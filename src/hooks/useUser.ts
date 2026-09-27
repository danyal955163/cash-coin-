"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Database["public"]["Tables"]["profiles"]["Row"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;
      setUser(data.user);
      if (data.user) {
        const profileResult = await getProfile(data.user.id);
        if (isMounted) setProfile(profileResult.data);
      }
      if (isMounted) setIsLoading(false);
    }

    void loadUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, profile, isLoading };
}
