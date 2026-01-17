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
  currentSessionStartTime: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  /* 
   * CRITICAL FIX: Session Stability
   * Initialize isLoading to TRUE to prevent premature redirects
   * Initialize role from localStorage to prevent "flicker" on refresh
   */
  const [role, setRole] = useState<AppRole | null>(() => {
    return localStorage.getItem('user_role') as AppRole | null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(() => {
    return localStorage.getItem('isClockedIn') === 'true';
  });
  const [currentSessionStartTime, setCurrentSessionStartTime] = useState<string | null>(() => {
    return localStorage.getItem('currentSessionStartTime');
  });

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

      const foundRole = data.role as AppRole;
      localStorage.setItem('user_role', foundRole); // Persist role
      return foundRole;
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
          last_active_at: new Date().toISOString(), // 🟢 Online status
          is_active: true,
          updated_at: new Date().toISOString()
        });

      if (error) console.error("AuthContext: Profile sync failed", error);
    } catch (err) {
      console.error("AuthContext: Profile sync exception", err);
    }
  };

  // 🟢 Heartbeat for Online Status (updates every 2 min)
  useEffect(() => {
    if (!user) return;

    const sendHeartbeat = async () => {
      try {
        await supabase
          .from('profiles')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', user.id);
      } catch (err) {
        console.error("Heartbeat failed:", err);
      }
    };

    // Send immediately on mount
    sendHeartbeat();

    // Then every 2 minutes
    const interval = setInterval(sendHeartbeat, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        // console.log("AuthContext: Auth state change:", event);

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setRole(null);
          localStorage.removeItem('user_role');
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setSession(session);
          setUser(session.user);

          // Force update last active on every sign in / resume
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            syncProfile(session.user).catch(console.error);
          }

          // Re-fetch role to be safe, but utilize cache if network fails
          try {
            const currentRole = localStorage.getItem('user_role') as AppRole | null;
            // Optimistically set from cache if available to prevent flicker
            if (currentRole && !role) {
              setRole(currentRole);
            }

            const fetchedRole = await fetchUserRole(session.user.id);
            if (isMounted) {
              if (fetchedRole) {
                setRole(fetchedRole);
              } else if (!currentRole) {
                // Only nullify if we have NO role at all (neither fetched nor cached)
                // This allows "offline" mode or RLS failure survival
                console.warn("AuthContext: No role found, and no cache.");
                setRole(null);
              }
            }
          } catch (error) {
            console.error('AuthContext: Error checking role:', error);
          }
        } else {
          // Case: Session exists but user is somehow null? Rare.
        }

        setIsLoading(false);
      }
    );

    // Initial Load Logic
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!isMounted) return;

        if (session?.user) {
          setSession(session);
          setUser(session.user);

          // Try to get role
          const cachedRole = localStorage.getItem('user_role') as AppRole | null;
          if (cachedRole) setRole(cachedRole);

          // Background refresh of role
          fetchUserRole(session.user.id).then(r => {
            if (isMounted && r) setRole(r);
          });
        } else {
          // No session
          setRole(null);
          localStorage.removeItem('user_role');
        }
      } catch (err) {
        console.error("AuthContext: Init error", err);
        // Ensure we stop loading so user isn't stuck on white screen
        if (isMounted) {
          setRole(null);
        }
      } finally {
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
  }, []); // Empty dependency array prevents re-subscription loops

  // 🚀 Attendance Hardening: Check DB for active shift on mount
  useEffect(() => {
    if (!user) return;

    const checkActiveShift = async () => {
      try {
        const { data, error } = await supabase
          .from('staff_shifts')
          .select('id, check_in')
          .eq('staff_id', user.id)
          .is('check_out', null)
          .order('check_in', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("AuthContext: Failed to check active shift", error);
          return;
        }

        if (data) {
          localStorage.setItem('current_staff_session_id', data.id);
          localStorage.setItem('currentSessionStartTime', data.check_in);
          setIsClockedIn(true);
          setCurrentSessionStartTime(data.check_in);
        } else {
          localStorage.removeItem('current_staff_session_id');
          localStorage.removeItem('currentSessionStartTime');
          setIsClockedIn(false);
          setCurrentSessionStartTime(null);
        }
      } catch (err) {
        console.error("AuthContext: Active shift check exception", err);
      }
    };

    checkActiveShift();
  }, [user]);

  const clockIn = async () => {
    if (!user) return;

    const { data: sessionData, error: sessionError } = await supabase
      .from('staff_shifts')
      .insert({ staff_id: user.id })
      .select()
      .single();

    if (sessionError) throw sessionError;

    if (sessionData) {
      localStorage.setItem('current_staff_session_id', sessionData.id);
      localStorage.setItem('currentSessionStartTime', sessionData.check_in);
      setIsClockedIn(true);
      setCurrentSessionStartTime(sessionData.check_in);

      // Notify Owner
      import('@/services/emailService').then(({ sendStaffAttendanceNotification }) => {
        sendStaffAttendanceNotification({
          staffName: user.user_metadata?.full_name || user.email || 'Staff',
          action: 'clock_in',
          time: new Date().toLocaleTimeString('fr-FR')
        });
      });
    }
  };

  const clockOut = async () => {
    const sessionId = localStorage.getItem('current_staff_session_id');

    // Fallback: If no local ID, check DB for any open shift to close it
    let targetSessionId = sessionId;
    if (!targetSessionId && user) {
      const { data } = await supabase.from('staff_shifts').select('id').eq('staff_id', user.id).is('check_out', null).limit(1).maybeSingle();
      if (data) targetSessionId = data.id;
    }

    if (targetSessionId) {
      const { error } = await supabase
        .from('staff_shifts')
        .update({ check_out: new Date().toISOString() })
        .eq('id', targetSessionId);

      if (error) throw error;

      localStorage.removeItem('current_staff_session_id');
      localStorage.removeItem('currentSessionStartTime');
      setIsClockedIn(false);
      setCurrentSessionStartTime(null);

      // Notify Owner
      import('@/services/emailService').then(({ sendStaffAttendanceNotification }) => {
        sendStaffAttendanceNotification({
          staffName: user?.user_metadata?.full_name || user?.email || 'Staff',
          action: 'clock_out',
          time: new Date().toLocaleTimeString('fr-FR')
        });
      });
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
          localStorage.setItem('currentSessionStartTime', sessionData.check_in);
          setIsClockedIn(true);
          setCurrentSessionStartTime(sessionData.check_in);
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
    currentSessionStartTime,
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
