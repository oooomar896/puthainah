'use client';

import MobileNavigation from "@/components/Layouts/dashboard-layout/sidebar/MobileNavigation";
import Header from "@/components/Layouts/dashboard-layout/header/Header";
import SideBar from "@/components/Layouts/dashboard-layout/sidebar/SideBar";
import { useSelector } from "react-redux";
import { useGetProviderDetailsQuery } from "@/redux/api/usersDetails";

const DashboardLayout = ({ children }) => {
  const userId = useSelector((state) => state.auth.userId);

  const { data: providerData } = useGetProviderDetailsQuery(userId);
  return (
    <div>
      <MobileNavigation />
      <Header data={providerData} />
      <SideBar data={providerData} />
      <main className="lg:mr-[250px] min-h-screen mb-10 lg:mb-0">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

