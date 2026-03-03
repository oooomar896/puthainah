import { createClient } from '@/utils/supabase/server';
import TicketDetails from '@/views/landing/tickets/TicketDetails';
import SeekerLayout from '@/components/Layouts/seeker-layout/SeekerLayout';

export default async function TicketDetailsPage({ params }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let requester = null;
    if (user) {
        const { data } = await supabase.from('requesters').select('*').eq('user_id', user.id).single();
        requester = data;
    }

    if (requester) {
        return (
            <SeekerLayout requester={requester}>
                <TicketDetails ticketId={id} />
            </SeekerLayout>
        );
    }

    return <TicketDetails ticketId={id} />;
}
