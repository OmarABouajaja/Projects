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

  const fetchUserRole = async (userId: string) => {
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
        // console.log("AuthContext: Assuming owner role for authenticated user as fallback");
        return "owner" as AppRole;
      }

      if (!data) {
        console.warn("AuthContext: No role found for user, using fallback 'owner'");
        return "owner" as AppRole;
      }

      // console.log("AuthContext: Role found:", data.role);
      return data.role as AppRole;
    } catch (err: any) {
      console.error("AuthContext: Exception fetching role:", err.message || err);
      // console.log("AuthContext: Using fallback - assuming owner role");
      return "owner" as AppRole;
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
          try {
            const userRole = await fetchUserRole(session.user.id);
            if (isMounted) {
              setRole(userRole);
              // console.log("AuthContext: Role set to:", userRole);
            }
          } catch (error) {
            console.error('AuthContext: Error fetching user role:', error);
            if (isMounted) {
              setRole(null);
            }
          }
        } else {
          setRole(null);
          // console.log("AuthContext: No session, role set to null");
        }
        setIsLoading(false);
        // console.log("AuthContext: isLoading set to false");
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      // Add shorter timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          // console.log("AuthContext: Forcing loading completion due to timeout");
          // Force role to 'owner' for authenticated users as fallback
          setRole("owner");
          setIsLoading(false);
        }
      }, 2000); // 2 second timeout

      try {
        // console.log("AuthContext: Checking for existing session...");
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

        // console.log("AuthContext: Existing session found:", !!session?.user);

        if (!isMounted) {
          clearTimeout(timeoutId);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            const userRole = await fetchUserRole(session.user.id);
            if (isMounted) {
              setRole(userRole);
              // console.log("AuthContext: Role loaded:", userRole);
            }
          } catch (error) {
            console.error('AuthContext: Error fetching user role:', error);
            if (isMounted) {
              setRole(null);
            }
          }
        } else {
          setRole(null);
          // console.log("AuthContext: No session, role set to null");
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
          // console.log("AuthContext: Initialization complete, isLoading = false");
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
