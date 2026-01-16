import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

type AppRole = "owner" | "worker";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isLoading: boolean;
  isStaff: boolean;
  isOwner: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  isClockedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(false);

  useEffect(() => {
    const sessionId = localStorage.getItem('current_staff_session_id');
    setIsClockedIn(!!sessionId);
  }, []);

  const fetchUserRole = async (userId: string): Promise<AppRole | null> => {
    try {
      // console.log("AuthContext: Fetching role for user:", userId);

      // Add internal timeout for the query (increased to 5s for reliability)
      const queryPromise = supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Query timeout")), 5000)
      );

      const result = await Promise.race([queryPromise, timeoutPromise]) as any;
      const { data, error } = result;

      if (error) {
        console.error("AuthContext: Database error fetching role:", error);
        return null;
      }

      if (!data) {
        console.warn("AuthContext: No role found for user");
        return null;
      }

      // console.log("AuthContext: Role found:", data.role);
      return data.role as AppRole;
    } catch (err: any) {
      console.error("AuthContext: Exception fetching role:", err.message || err);
      return null;
    }
  };

  // 🚀 Profile Sync Logic (Ensures visibility in dashboard)
  const syncProfile = async (targetUser: User) => {
    try {
      // console.log("AuthContext: Syncing profile for", targetUser.email);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: targetUser.id,
          email: targetUser.email,
          full_name: targetUser.user_metadata?.full_name || "Staff Member",
          last_sign_in_at: new Date().toISOString(),
          is_active: true,
          updated_at: new Date().toISOString()
        });

      if (error) console.error("AuthContext: Profile sync failed", error);
    } catch (err) {
      console.error("AuthContext: Profile sync exception", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // console.log("AuthContext: Auth state change:", event, !!session?.user);
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Sync profile on every login event or initial session discovery
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            await syncProfile(session.user);
          }

          try {
            const userRole = await fetchUserRole(session.user.id);
            if (isMounted) {
              setRole(userRole);
            }
          } catch (error) {
            console.error('AuthContext: Error fetching user role:', error);
            if (isMounted) {
              setRole(null);
            }
          }
        } else {
          setRole(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      // Add shorter timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn("AuthContext: Role fetch timed out. Defaulting to safe state (Access Denied).");
          setRole(null);
          setIsLoading(false);
        }
      }, 5000);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('AuthContext: Session check error:', error);
          if (isMounted) {
            setSession(null);
            setUser(null);
            setRole(null);
            setIsLoading(false);
          }
          clearTimeout(timeoutId);
          return;
        }

        if (!isMounted) {
          clearTimeout(timeoutId);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Robust Profile Sync on Initial Load
          await syncProfile(session.user);

          try {
            const userRole = await fetchUserRole(session.user.id);
            if (isMounted) {
              setRole(userRole);
            }
          } catch (error) {
            console.error('AuthContext: Error fetching user role:', error);
            if (isMounted) {
              setRole(null);
            }
          }
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('AuthContext: Error initializing auth:', error);
        if (isMounted) {
          setRole(null);
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const clockIn = async () => {
    if (!user) return;

    // Throw error to let UI handle it
    const { data: sessionData, error: sessionError } = await supabase
      .from('staff_shifts')
      .insert({ staff_id: user.id })
      .select()
      .single();

    if (sessionError) throw sessionError;

    if (sessionData) {
      localStorage.setItem('current_staff_session_id', sessionData.id);
      setIsClockedIn(true);
    }
  };

  const clockOut = async () => {
    const sessionId = localStorage.getItem('current_staff_session_id');
    if (sessionId) {
      // Throw error to let UI handle it
      const { error } = await supabase
        .from('staff_shifts')
        .update({ check_out: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      localStorage.removeItem('current_staff_session_id');
      setIsClockedIn(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      // 1. Sync public profile for visibility (Owner needs to see this)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          last_sign_in_at: new Date().toISOString()
        });

      if (profileError) {
        console.error("AuthContext: Profile sync failed", profileError);
      }

      // 2. Auto-clock in for all staff
      try {
        const { data: sessionData } = await supabase
          .from('staff_shifts')
          .insert({ staff_id: data.user.id })
          .select()
          .single();

        if (sessionData) {
          localStorage.setItem('current_staff_session_id', sessionData.id);
          setIsClockedIn(true);
        }
      } catch (err) {
        console.error("Auto-clock-in failed", err);
      }
    }

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await clockOut();
    await supabase.auth.signOut();
    setRole(null);
  };

  const contextValue = {
    user,
    session,
    role,
    isLoading,
    isStaff: role === "owner" || role === "worker",
    isOwner: role === "owner",
    signIn,
    signOut,
    clockIn,
    clockOut,
    isClockedIn,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
