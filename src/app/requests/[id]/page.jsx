import RequestDetailsContent from './RequestDetailsContent';
import { createClient } from '@/utils/supabase/server';
import SeekerLayout from '@/components/Layouts/seeker-layout/SeekerLayout';
import { supabaseAdmin } from '@/lib/supabase';

export default async function RequestDetailsPage({ params }) {
  const { id } = await params;
  // const supabase = await createClient();

  // Fetch request details
  // const { data: request } = await supabase
  //   .from('requests')
  //   .select(`
  //     *,
  //     service:services(id, name_ar, name_en, description, base_price),
  //     requestStatus:lookup_values!status_id(id, name_ar, name_en)
  //   `)
  //   .eq('id', id)
  //   .single();

  // If request found, format it to match what RequestDetails expects
  // let formattedRequest = null;
  // if (request) {
  //     formattedRequest = {
  //         ...request,
  //         // Map fields if necessary. 
  //         // RequestDetails expects: requestStatus.nameAr, service (array?), attachments
  //         // The API might return different structure.
  //         // For now, let's pass it as is and let the component handle it or fallback to client fetch.
  //         // Actually, if we pass formattedRequest, we need to ensure it has all required fields.
  //         // Since we can't easily replicate the whole API response with attachments and all relations without complex queries,
  //         // we will pass the ID and let the client fetch the full details for now, 
  //         // BUT we can pass basic details for SEO/Skeleton if we wanted.

  //         // However, RequestDetails uses `initialData` to SKIP client fetch.
  //         // If we provide incomplete data, the page might break.
  //         // So let's NOT pass initialData for now, but keep the server component structure ready.
  //     };
  // }

  // For now, we just pass the ID via params implicitly (handled by client component via useParams)
  // But we want to use the server component.
  // We can pass `id` prop to `RequestDetailsContent`.

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let requester = null;
  if (user) {
    const { data } = await supabase.from('requesters').select('*').eq('user_id', user.id).single();
    requester = data;
  }

  // SSR: fetch initial request details using service-role to avoid RLS issues
  let initialData = null;
  if (supabaseAdmin && id) {
    const { data: reqRow } = await supabaseAdmin
      .from('requests')
      .select(`
        *,
        requester:requesters!requests_requester_id_fkey(id,name),
        service:services(id,name_ar,name_en,description,base_price),
        status:lookup_values!requests_status_id_fkey(id,name_ar,name_en,code),
        city:cities(id,name_ar,name_en),
        provider:providers!requests_provider_id_fkey(id,name)
      `)
      .eq('id', id)
      .maybeSingle();
    if (reqRow) {
      let attachments = [];
      if (reqRow.attachments_group_key) {
        const { data: group } = await supabaseAdmin
          .from('attachment_groups')
          .select('id,group_key')
          .eq('group_key', reqRow.attachments_group_key)
          .maybeSingle();
        if (group?.id) {
          const { data: files } = await supabaseAdmin
            .from('attachments')
            .select('id,file_path,file_name,content_type,size_bytes,request_phase_lookup_id,created_at')
            .eq('group_id', group.id);
          attachments = (files || []).map(f => ({
            id: f.id,
            fileUrl: f.file_path,
            fileName: f.file_name,
            contentType: f.content_type,
            sizeBytes: f.size_bytes,
            requestPhaseLookupId: f.request_phase_lookup_id,
            created_at: f.created_at,
          }));
        }
      }
      initialData = {
        ...reqRow,
        fullName: reqRow?.requester?.name || null,
        requestNumber: reqRow?.id,
        creationTime: reqRow?.created_at,
        service: {
          id: reqRow.service?.id,
          name_ar: reqRow.service?.name_ar,
          name_en: reqRow.service?.name_en,
          description: reqRow.service?.description,
          base_price: reqRow.service?.base_price,
          price: typeof reqRow.service?.base_price === 'number' ? Number(reqRow.service.base_price) : null,
        },
        servicePrice: typeof reqRow.service?.base_price === 'number' ? Number(reqRow.service.base_price) : null,
        requestStatus: reqRow.status
          ? { id: reqRow.status.id, nameAr: reqRow.status.name_ar, nameEn: reqRow.status.name_en, code: reqRow.status.code }
          : null,
        attachments,
        provider: reqRow.provider, // Pass provider object
        provider_id: reqRow.provider_id,
        provider_assigned_at: reqRow.provider_assigned_at,
        admin_price: reqRow.admin_price,
        admin_notes: reqRow.admin_notes,
        admin_proposal_file_url: reqRow.admin_proposal_file_url,
      };

      // Fetch Order ID if exists
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('request_id', id)
        .maybeSingle();

      if (order) {
        initialData.orderId = order.id;
      }
    }
  }

  if (requester) {
    return (
      <SeekerLayout requester={requester}>
        <RequestDetailsContent id={id} initialData={initialData} />
      </SeekerLayout>
    );
  }

  return <RequestDetailsContent id={id} initialData={initialData} />;
}
