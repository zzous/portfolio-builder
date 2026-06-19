import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/github';
import type { PortfolioData } from '@/types/portfolio';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  if (!username) {
    return Response.json({ error: 'username is required' }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from('portfolios')
    .select('username, data, updated_at')
    .eq('username', username)
    .single();

  if (error || !data) {
    return Response.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  return Response.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const portfolio = (await req.json()) as PortfolioData;
  const githubUser = await getAuthenticatedUser(session.accessToken);

  const { error } = await getSupabaseAdmin().from('portfolios').upsert(
    {
      username: githubUser.login,
      data: portfolio,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'username' }
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ username: githubUser.login });
}
