import { notFound } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { PortfolioCard } from '@/components/PortfolioCard';
import type { PortfolioData } from '@/types/portfolio';

export default async function PublicPortfolio({
  params,
}: {
  params: { username: string };
}) {
  const { data } = await getSupabase()
    .from('portfolios')
    .select('data')
    .eq('username', params.username)
    .single();

  if (!data) notFound();

  return <PortfolioCard portfolio={data.data as PortfolioData} />;
}
