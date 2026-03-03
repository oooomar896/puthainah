import ProjectDetailsContent from './ProjectDetailsContent';

export default async function ProjectDetailsPage({ params }) {
  const { id } = await params;
  // const supabase = await createClient();

  // Fetch project details
  // Note: Detailed fetch with relations like orderAttachments is complex to replicate fully here without exact query
  // For now, we pass ID and let the client component fetch full details using the existing API/hook.
  // We can fetch basic details for SEO/Skeleton if needed.
  
  // const { data: project } = await supabase
  //   .from('orders')
  //   .select('*')
  //   .eq('id', id)
  //   .single();

  // We could potentially pass partial initialData if we shaped it correctly, 
  // but since the client component relies on a complex shape (attachments, status nameAr/En, etc),
  // it's safer to let it fetch on client side for now, or implement a comprehensive fetch here.
  // Given time constraints, passing ID to client component is the robust first step.

  return <ProjectDetailsContent id={id} />;
}
