import { createClient } from '@/utils/supabase/server';
import ExploreContent from './ExploreContent';
import SeekerLayout from '@/components/Layouts/seeker-layout/SeekerLayout';

export default async function RequestsPage() {
  const supabase = await createClient();

  let stats = {
    totalRequestsCount: 0,
    underProcessingRequestsCount: 0,
    initiallyApprovedRequestsCount: 0,
    waitingForPaymentRequestsCount: 0,
    rejectedRequestsCount: 0,
    approvedRequestsCount: 0,
    newRequestssCount: 0,
  };

  // Check for user to optionally show layout
  const { data: { user } } = await supabase.auth.getUser();
  let requester = null;

  if (user) {
    const { data } = await supabase
      .from('requesters')
      .select('id, name')
      .eq('user_id', user.id)
      .single();
    requester = data;
  }

  try {
    const countFor = async (statusId = null) => {
      let query = supabase.from("requests").select("id", { count: "exact", head: true });
      if (statusId) query = query.eq("status_id", statusId);
      if (requester) query = query.eq("requester_id", requester.id);

      const { count, error } = await query;
      if (error) {
        console.error(`Error counting requests for status ${statusId}:`, error);
        return 0;
      }
      return count || 0;
    };

    stats.totalRequestsCount = await countFor();
    stats.newRequestssCount = await countFor(7); // pending
    stats.underProcessingRequestsCount = await countFor(207); // under_review
    stats.initiallyApprovedRequestsCount = await countFor(8); // priced
    stats.waitingForPaymentRequestsCount = await countFor(21); // waiting_payment
    stats.rejectedRequestsCount = await countFor(10); // rejected
    stats.approvedRequestsCount = await countFor(11); // completed
  } catch (err) {
    console.error("Critical error fetching requests stats:", err);
  }

  if (requester) {
    return (
      <SeekerLayout requester={requester}>
        <ExploreContent stats={stats} />
      </SeekerLayout>
    );
  }

  return <ExploreContent stats={stats} />;
}

// eslint-disable-next-line react-refresh/only-export-components
export const metadata = {
  title: 'تصفح الطلبات | منصة بثينة أعمال',
  description: 'تصفح طلبات الخدمة ومتابعة حالتها',
};
