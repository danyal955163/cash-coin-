import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

export function createClient() {
  // Next 15 types cookies() as a Promise, while synchronous access remains
  // supported for existing server-component call sites during the transition.
  const cookieStore = cookies() as unknown as Awaited<ReturnType<typeof cookies>>;

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot always write cookies. Middleware handles refresh.
          }
        },
      },
    },
  );
}
