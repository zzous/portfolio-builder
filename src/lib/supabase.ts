import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

// 공개 읽기용 (RLS 적용, anon key)
export function getSupabase(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return anonClient;
}

// 서버 전용 쓰기용 (RLS 우회, service_role key — 절대 클라이언트에 노출 금지)
export function getSupabaseAdmin(): SupabaseClient {
  if (!serviceClient) {
    serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return serviceClient;
}
