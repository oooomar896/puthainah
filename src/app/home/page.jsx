import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SeekerLayout from '@/components/Layouts/seeker-layout/SeekerLayout';
import ProviderSectionLayout from '@/app/provider/layout';
import RequesterHomePanel from '@/components/home/RequesterHomePanel';
export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login?from=%2Fhome');
  }

  const role = (user.user_metadata?.role || '').toLowerCase();
  if (role === 'admin') {
    redirect('/admin');
  }

  const sp = await searchParams;
  const reqPageSize = Number.isFinite(Number(sp?.RequestPageSize)) && Number(sp?.RequestPageSize) > 0 ? Number(sp.RequestPageSize) : 10;
  const reqPageNumber = Number.isFinite(Number(sp?.RequestPageNumber)) && Number(sp?.RequestPageNumber) > 0 ? Number(sp.RequestPageNumber) : 1;
  const notPageSize = Number.isFinite(Number(sp?.NotifyPageSize)) && Number(sp?.NotifyPageSize) > 0 ? Number(sp.NotifyPageSize) : 10;
  const notPageNumber = Number.isFinite(Number(sp?.NotifyPageNumber)) && Number(sp?.NotifyPageNumber) > 0 ? Number(sp.NotifyPageNumber) : 1;
  const reqFrom = (reqPageNumber - 1) * reqPageSize;
  const reqTo = reqFrom + reqPageSize - 1;
  const notFrom = (notPageNumber - 1) * notPageSize;
  const notTo = notFrom + notPageSize - 1;

  let roleData = { role, requests: [], notifications: [], requestCount: 0, notificationsCount: 0 };
  if (role === 'provider') {
    const { data: provider } = await supabase
      .from('providers')
      .select('id,name,attachments(*)')
      .eq('user_id', user.id)
      .maybeSingle();
    const providerId = provider?.id || null;
    let reqs = [];
    if (providerId) {
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerId);
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status:lookup_values!orders_order_status_id_fkey(name_ar,name_en,code),
          request:requests!orders_request_id_fkey(id,title,service:services(name_ar,name_en))
        `)
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
        .range(reqFrom, reqTo);
      reqs = (orders || []).map(o => ({
        id: o.id,
        title: o.request?.title || '-',
        serviceName: o.request?.service ? (o.request.service.name_ar || o.request.service.name_en) : '-',
        statusName: o.status ? (o.status.name_ar || o.status.name_en) : '-',
        created_at: o.created_at
      }));
      roleData.requestCount = ordersCount || 0;
    }
    const { count: ticketsCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    const { data: tickets } = await supabase
      .from('tickets')
      .select('id,title,created_at,status_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(notFrom, notTo);
    roleData = { role, provider, requests: reqs, notifications: tickets || [], requestCount: roleData.requestCount, notificationsCount: ticketsCount || 0, reqPageSize, reqPageNumber, notPageSize, notPageNumber };
  } else {
    const { data: requester } = await supabase
      .from('requesters')
      .select('id,name') // Removed attachments(*)
      .eq('user_id', user.id)
      .maybeSingle();
    const requesterId = requester?.id || null;
    let reqs = [];
    if (requesterId) {
      const { count: requestsCount } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('requester_id', requesterId);
      const { data: requests } = await supabase
        .from('requests')
        .select(`
          id,
          title,
          created_at,
          service:services(name_ar,name_en),
          status:lookup_values!requests_status_id_fkey(name_ar,name_en,code)
        `)
        .eq('requester_id', requesterId)
        .order('created_at', { ascending: false })
        .range(reqFrom, reqTo);
      reqs = (requests || []).map(r => ({
        id: r.id,
        title: r.title || '-',
        serviceName: r.service ? (r.service.name_ar || r.service.name_en) : '-',
        statusName: r.status ? (r.status.name_ar || r.status.name_en) : '-',
        created_at: r.created_at
      }));
      roleData.requestCount = requestsCount || 0;
    } else {
      // Fallback: If no requester profile yet, return empty to prevent errors or leaks
      // This is safer than trying to filter by user_id which might leak or fail
      reqs = [];
      roleData.requestCount = 0;
    }
    const { count: ticketsCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    const { data: tickets } = await supabase
      .from('tickets')
      .select('id,title,created_at,status_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(notFrom, notTo);
    roleData = { role, requester: requester || {}, requests: reqs, notifications: tickets || [], requestCount: roleData.requestCount, notificationsCount: ticketsCount || 0, reqPageSize, reqPageNumber, notPageSize, notPageNumber };
  }

  const Card = ({ title, children, subtitle }) => (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-4">{title}</h3>
      {subtitle ? <p className="text-gray-600 text-sm mb-4">{subtitle}</p> : null}
      {children}
    </div>
  );

  const RequestsList = ({ items }) => (
    items && items.length > 0 ? (
      <div className="space-y-3">
        {items.map(it => (
          <a href={it.id ? `/requests/${it.id}` : '/requests'} key={it.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
            <div className="min-w-0">
              <div className="font-bold text-gray-800 truncate">{it.title}</div>
              <div className="text-[11px] text-gray-500 mt-0.5 truncate">{it.serviceName}</div>
            </div>
            <div className="text-[11px] font-bold px-3 py-1 rounded-full border bg-gray-50 text-gray-700">{it.statusName}</div>
          </a>
        ))}
      </div>
    ) : (
      <div className="text-gray-500 text-sm">لا توجد طلبات</div>
    )
  );

  const NotificationsList = ({ items }) => (
    items && items.length > 0 ? (
      <ul className="space-y-2">
        {items.map(n => (
          <a href={`/tickets/${n.id}`} key={n.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
            <span className="font-medium text-gray-800 truncate">{n.title}</span>
            <span className="text-[11px] text-gray-500">{new Date(n.created_at).toLocaleDateString('ar-EG')}</span>
          </a>
        ))}
      </ul>
    ) : (
      <div className="text-gray-500 text-sm">لا توجد إشعارات</div>
    )
  );

  if (role === 'provider') {
    return (
      <ProviderSectionLayout>
        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card title="طلباتي" subtitle={`إجمالي: ${roleData.requestCount}`}>
                <RequestsList items={roleData.requests} />
                <div className="mt-4 flex items-center justify-between">
                  <a href={`/home?RequestPageSize=${roleData.reqPageSize}&RequestPageNumber=${roleData.reqPageNumber + 1}&NotifyPageSize=${roleData.notPageSize}&NotifyPageNumber=${roleData.notPageNumber}`} className="text-primary font-bold text-sm">عرض المزيد</a>
                  <a href="/provider/our-projects" className="text-gray-700 font-bold text-sm">عرض الكل</a>
                </div>
              </Card>
              <Card title="الإشعارات" subtitle={`إجمالي: ${roleData.notificationsCount}`}>
                <NotificationsList items={roleData.notifications} />
                <div className="mt-4 flex items-center justify-between">
                  <a href={`/home?NotifyPageSize=${roleData.notPageSize}&NotifyPageNumber=${roleData.notPageNumber + 1}&RequestPageSize=${roleData.reqPageSize}&RequestPageNumber=${roleData.reqPageNumber}`} className="text-primary font-bold text-sm">عرض المزيد</a>
                  <a href="/tickets" className="text-gray-700 font-bold text-sm">عرض الكل</a>
                </div>
              </Card>
            </div>
            <div className="lg:col-span-1 space-y-8">
              <Card title="إجراءات سريعة">
                <div className="grid gap-2">
                  <a href="/provider/our-projects" className="px-4 py-3 rounded-xl bg-primary/5 text-primary font-bold border border-primary/10">مشاريعي</a>
                  <a href="/requests" className="px-4 py-3 rounded-xl bg-gray-50 text-gray-800 font-bold border border-gray-100">تصفح الطلبات</a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </ProviderSectionLayout>
    );
  }

  return (
    <SeekerLayout requester={roleData.requester}>
      <div className="p-6 md:p-8 space-y-8">
        <RequesterHomePanel
          requesterId={roleData.requester?.id}
          userId={user.id}
          reqPageSize={roleData.reqPageSize}
          notPageSize={roleData.notPageSize}
          initialRequests={roleData.requests}
          initialNotifications={roleData.notifications}
          initialRequestCount={roleData.requestCount}
          initialNotificationsCount={roleData.notificationsCount}
        />
      </div>
    </SeekerLayout>
  );
}
