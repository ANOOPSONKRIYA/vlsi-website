import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { TeamMember } from '@/types';

export interface MemberSessionContextValue {
  user: User;
  member: TeamMember;
  refreshMember: () => Promise<void>;
}

export const MemberSessionContext = createContext<MemberSessionContextValue | null>(null);

export function useMemberSession() {
  const context = useContext(MemberSessionContext);
  if (!context) {
    throw new Error('useMemberSession must be used within MemberGate');
  }
  return context;
}
