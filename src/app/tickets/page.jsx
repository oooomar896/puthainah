import { createClient } from '@/utils/supabase/server';
import TicketsContent from './TicketsContent';
import SeekerLayout from '@/components/Layouts/seeker-layout/SeekerLayout';

export default async function TicketsPage() {
  try {
    const supabase = await createClient();

    // Safety check for user with timeout (3s)
    const userPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000));

    const { data: { user } } = await Promise.race([userPromise, timeoutPromise]);

    let requester = null;
    if (user) {
      const { data } = await supabase.from('requesters').select('*').eq('user_id', user.id).maybeSingle();
      requester = data;
    }

    return (
      <SeekerLayout requester={requester}>
        <TicketsContent />
      </SeekerLayout>
    );
  } catch (error) {
    console.error("Server-side TicketsPage error:", error);
    return <TicketsContent />;
  }
}

