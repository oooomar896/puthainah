'use client';

import Header from "@/components/Layouts/main-layout/header/Header";
import Footer from "@/components/Layouts/main-layout/footer/Footer";
import { useGetRequesterByUserIdQuery } from "@/redux/api/usersDetails";
import { useSelector } from "react-redux";
import MobileNavigation from "@/components/Layouts/main-layout/header/MobileNavigation";

const MainLayout = ({ children }) => {
  const userId = useSelector((state) => state.auth.userId);
  const { data: userDataResult } = useGetRequesterByUserIdQuery(userId, {
    skip: !userId,
  });
  const userData = Array.isArray(userDataResult) ? userDataResult[0] : userDataResult;

  return (
    <>
      <MobileNavigation data={userData} />
      <Header data={userData} />
      <main className="overflow-hidden">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;

