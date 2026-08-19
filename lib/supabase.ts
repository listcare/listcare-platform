import { createClient } from "@supabase/supabase-js";

export function browserDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function userFromToken(token: string) {
  const db = browserDb();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw new Error("Δεν βρέθηκε ενεργός λογαριασμός.");
  return data.user;
}
