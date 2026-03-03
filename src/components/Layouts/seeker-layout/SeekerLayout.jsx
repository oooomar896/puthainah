"use client";

import SeekerMobileNavigation from "./sidebar/SeekerMobileNavigation";
import SeekerHeader from "./header/SeekerHeader";
import SeekerSideBar from "./sidebar/SeekerSideBar";
// We might need a separate API hook for Seeker details or pass it down.
// app/profile/page.jsx fetches it server side. 
// But here we might want it for the header/sidebar if they are client components.
// The Header uses providerData. I might need to adapt Header too or pass props.

/* 
   The existing DashboardLayout fetches provider details inside. 
   For Seekers, we have data passed from page.jsx usually, OR we can fetch it here.
   However, reusing Header might be tricky if it expects provider data structure.
   Let's assume Header is generic enough or we pass data.
*/

const SeekerLayout = ({ children, requester }) => {
    // If requester data is passed from Server Component, use it.
    // Otherwise we might need to fetch it or get from Redux.

    return (
        <div>
            <SeekerMobileNavigation />
            <SeekerHeader data={requester} />
            <SeekerSideBar data={requester} />
            <main className="lg:mr-[250px] min-h-screen mb-10 lg:mb-0 bg-[#FAFAFA]">
                {children}
            </main>
        </div>
    );
};

export default SeekerLayout;
