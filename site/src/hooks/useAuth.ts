import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types";

interface AuthState {
  loading: boolean;
  profile: Profile | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ loading: true, profile: null });

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        if (active) setState({ loading: false, profile: null });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, role, percentual")
        .eq("id", userId)
        .single();

      if (active) {
        setState({ loading: false, profile: error ? null : data });
      }
    }

    loadProfile();

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { ...state, signIn, signOut };
}
