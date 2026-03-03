'use client';

import MobileNavigation from "@/components/Layouts/admin-layout/sidebar/MobileNavigation";
import Header from "@/components/Layouts/admin-layout/header/Header";
import SideBar from "@/components/Layouts/admin-layout/sidebar/SideBar";
import { useSelector } from "react-redux";
import { useGetAdminByUserIdQuery } from "@/redux/api/usersDetails";
import { useState } from "react";

const AdminLayout = ({ children }) => {
  const userId = useSelector((state) => state.auth.userId);
  const [collapsed, setCollapsed] = useState(false);

  const { data: adminDataResult } = useGetAdminByUserIdQuery(userId, { skip: !userId });
  const adminData = Array.isArray(adminDataResult) ? adminDataResult[0] : adminDataResult;

  return (
    <div>
      <MobileNavigation />
      <Header data={adminData} collapsed={collapsed} />
      <SideBar data={adminData} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main
        className={`min-h-screen mb-10 lg:mb-0 transition-all duration-300 ease-in-out ${collapsed ? "lg:mr-[88px]" : "lg:mr-[280px]"
          }`}
      >
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

