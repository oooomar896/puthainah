import { createClient } from '@/utils/supabase/server';
import ProjectsContent from './ProjectsContent';
import SeekerLayout from '@/components/Layouts/seeker-layout/SeekerLayout';
import { redirect } from 'next/navigation';

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/projects');
  }

  // Fetch requester details
  const { data: requester } = await supabase
    .from('requesters')
    .select('*')
    .eq('user_id', user.id)
    .single();

  let stats = {
    totalOrdersCount: 0,
    waitingForApprovalOrdersCount: 0,
    waitingToStartOrdersCount: 0,
    ongoingOrdersCount: 0,
    completedOrdersCount: 0,
    serviceCompletedOrdersCount: 0,
    rejectedOrdersCount: 0,
    expiredOrdersCount: 0,
  };

  try {
    const getCount = async (statusId) => {
      let q = supabase.from("orders").select("*", { count: "exact", head: true });
      if (requester) q = q.eq('requests.requester_id', requester.id);
      if (statusId) q = q.eq('order_status_id', statusId);
      const { count } = await q;
      return count || 0;
    };

    stats.totalOrdersCount = await getCount();
    stats.waitingForApprovalOrdersCount = await getCount(17);
    stats.waitingToStartOrdersCount = await getCount(18);
    stats.ongoingOrdersCount = await getCount(13);
    stats.completedOrdersCount = await getCount(15);
    stats.serviceCompletedOrdersCount = await getCount(15); // ended/completed same for now
    stats.rejectedOrdersCount = await getCount(19);
    stats.expiredOrdersCount = await getCount(20);

  } catch (err) {
    console.error("Error fetching projects stats:", err);
  }

  if (requester) {
    return (
      <SeekerLayout requester={requester}>
        <ProjectsContent stats={stats} requesterId={requester.id} />
      </SeekerLayout>
    );
  }

  return <ProjectsContent stats={stats} />;
}
