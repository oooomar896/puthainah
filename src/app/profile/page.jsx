import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProfileContent from './ProfileContent';
import SeekerLayout from '@/components/Layouts/seeker-layout/SeekerLayout';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ searchParams }) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login?from=%2Fprofile');
  }

  // Safety check for role (Middleware should handle this, but double check)
  const role = user.user_metadata?.role;
  if (role === 'Admin') {
    redirect('/admin');
  }
  if (role === 'Provider') {
    redirect('/provider');
  }

  // Fetch requester details with attachments
  const { data: requester } = await supabase
    .from('requesters')
    .select('*, city:lookup_values!requesters_city_id_fkey(*), entityType:lookup_values!requesters_entity_type_id_fkey(*), attachments(*)')
    .eq('user_id', user.id)
    .single();

  let requesterResolved = requester;
  if (!requesterResolved) {
    requesterResolved = {
      id: null,
      user_id: user.id,
      name: user.user_metadata?.name || "",
      fullName: user.user_metadata?.name || "",
      email: user.email || "",
      phone: user.user_metadata?.phone || "",
      created_at: user.created_at || new Date().toISOString(),
      attachments: [],
      city: null,
      entityType: null,
      user: { id: user.id },
    };
  }

  // Fetch tickets
  const { data: tickets } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Stats calculation
  const stats = {
    totalOrdersCount: 0,
    waitingForApprovalOrdersCount: 0,
    waitingToStartOrdersCount: 0,
    ongoingOrdersCount: 0,
    completedOrdersCount: 0,
    serviceCompletedOrdersCount: 0,
    rejectedOrdersCount: 0,
  };

  if (requesterResolved) {
    const { data: ordersData } = await supabase
      .from('orders')
      .select('order_status_id, requests!inner(requester_id)')
      .eq('requests.requester_id', requesterResolved.id);

    if (ordersData) {
      stats.totalOrdersCount = ordersData.length;
      stats.waitingForApprovalOrdersCount = ordersData.filter(o => o.order_status_id === 17).length;
      stats.waitingToStartOrdersCount = ordersData.filter(o => o.order_status_id === 18).length;
      stats.ongoingOrdersCount = ordersData.filter(o => o.order_status_id === 13).length;
      stats.completedOrdersCount = ordersData.filter(o => o.order_status_id === 15).length;
      stats.serviceCompletedOrdersCount = ordersData.filter(o => o.order_status_id === 15).length; // Map to completed if same
      stats.rejectedOrdersCount = ordersData.filter(o => o.order_status_id === 19).length;
    }
  }

  // Pagination params
  const sp = await searchParams;
  const pageSizeParam = Number(sp?.PageSize || 5);
  const pageNumberParam = Number(sp?.PageNumber || 1);
  const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? pageSizeParam : 5;
  const pageNumber = Number.isFinite(pageNumberParam) && pageNumberParam > 0 ? pageNumberParam : 1;
  const from = (pageNumber - 1) * pageSize;
  const to = from + pageSize - 1;

  let recentOrders = [];
  if (requesterResolved && requesterResolved.id) {
    const { data: rec } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        order_status_id,
        status:lookup_values!orders_order_status_id_fkey(name_ar, name_en, code),
        requests!inner(
          id,
          requester_id,
          title,
          service:services(name_ar, name_en)
        )
      `)
      .eq('requests.requester_id', requesterResolved.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (rec) {
      recentOrders = rec.map(o => ({
        ...o,
        request: {
          id: o.requests?.id,
          title: o.requests?.title,
          service: o.requests?.service || null,
        }
      }));
    }
  }

  return (
    <SeekerLayout requester={requesterResolved}>
      <ProfileContent
        requester={requesterResolved}
        tickets={tickets || []}
        stats={stats}
        recentOrders={recentOrders}
        pageNumber={pageNumber}
        pageSize={pageSize}
      />
    </SeekerLayout>
  );
}
