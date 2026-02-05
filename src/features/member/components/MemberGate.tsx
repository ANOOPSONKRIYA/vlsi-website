import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LogIn, ShieldCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';

import { supabase, signInWithGoogle, signOut, getTeamMemberByUser } from '@/lib/supabase';
import type { TeamMember } from '@/types';
import { MemberSessionContext } from '@/features/member/context/MemberContext';

type GateStatus = 'loading' | 'unauthenticated' | 'forbidden' | 'ready';

export function MemberGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = useState<GateStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<TeamMember | null>(null);

  const resolveMember = async (sessionUser?: User | null) => {
    const currentUser = sessionUser || (await supabase.auth.getUser()).data.user;
    if (!currentUser) {
      setUser(null);
      setMember(null);
      setStatus('unauthenticated');
      return;
    }

    const profile = await getTeamMemberByUser(currentUser);
    if (!profile) {
      await signOut();
      setUser(null);
      setMember(null);
      setStatus('forbidden');
      return;
    }

    setUser(currentUser);
    setMember(profile);
    setStatus('ready');
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;
      await resolveMember();
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      resolveMember(session?.user);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    const redirectTo = `${window.location.origin}${location.pathname}`;
    await signInWithGoogle(redirectTo);
  };

  const refreshMember = async () => {
    if (!user) return;
    const profile = await getTeamMemberByUser(user);
    if (profile) {
      setMember(profile);
    } else {
      toast.error('Unable to refresh member profile.');
    }
  };

  const contextValue = useMemo(() => {
    if (!user || !member) return null;
    return { user, member, refreshMember };
  }, [user, member]);

  if (status === 'ready' && contextValue) {
    return (
      <MemberSessionContext.Provider value={contextValue}>
        {children}
      </MemberSessionContext.Provider>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="glass rounded-2xl p-6 sm:p-8 w-full max-w-md border border-white/10">
        {status === 'loading' && (
          <div className="flex items-center gap-3 text-white/60">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>Checking member access...</span>
          </div>
        )}

        {status === 'unauthenticated' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white text-lg font-semibold">Member Sign In</h2>
                <p className="text-white/40 text-sm">Access your profile and projects</p>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Continue with Google
            </button>
          </div>
        )}

        {status === 'forbidden' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-white text-lg font-semibold">Profile Not Found</h2>
                <p className="text-white/40 text-sm">
                  Your email is not linked to a team profile.
                </p>
              </div>
            </div>

            <p className="text-white/30 text-sm">
              Ask an admin to add your email to the team members list in Supabase,
              then sign in again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
