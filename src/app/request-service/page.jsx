import { createClient } from '@/utils/supabase/server';
import RequestServiceContent from './RequestServiceContent';
import { redirect } from 'next/navigation';
import SeekerLayout from '@/components/Layouts/seeker-layout/SeekerLayout';

export default async function RequestServicePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/request-service');
  }

  const { data: services } = await supabase
    .from('services')
    .select('id,name_ar,name_en,base_price,is_active')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  // Need to fetch requester details for the layout
  // We have the user object.
  const { data: requester } = await supabase
    .from('requesters')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <SeekerLayout requester={requester}>
      <RequestServiceContent services={services} />
    </SeekerLayout>
  );
}
