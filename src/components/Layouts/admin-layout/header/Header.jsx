"use client";

import { useDispatch, useSelector } from "react-redux";
import { appLogout } from "../../../../utils/logout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import NotificationsModal from "../../NotificationsModal";
import { useGetNotificationsQuery } from "../../../../redux/api/notificationsApi";
import LanguageDropdown from "../../LanguageDropdown";
import RoleBadge from "../../../shared/RoleBadge";

import userImg from "../../../../assets/images/user.jpg";
import logoutIcon from "../../../../assets/icons/logout.svg";
import notifications from "../../../../assets/icons/notifications.svg";
import { getAppBaseUrl } from "../../../../utils/env";

const Header = ({ data, collapsed }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const token = useSelector((state) => state.auth.token);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: notificationsData } = useGetNotificationsQuery(undefined, {
    pollingInterval: 60000,
    skip: !token,
  });

  const unseenNotifications =
    notificationsData?.filter((notification) => notification.seen === false) ||
    [];

  const dispatch = useDispatch();
  const imageUrl =
    typeof data?.profilePictureUrl === "string" && data.profilePictureUrl.length > 0
      ? (data.profilePictureUrl.startsWith("http")
        ? data.profilePictureUrl
        : `${getAppBaseUrl()}/${data.profilePictureUrl}`)
      : (typeof userImg === "string" ? userImg : (userImg?.src || ""));

  return (
    <header className={`sticky top-0 right-0 bg-white py-4 border-b border-gray-100 z-[500] transition-all duration-300 ease-in-out ${collapsed ? "lg:mr-[88px]" : "lg:mr-[280px]"
      }`}>
      <div className="container">
        <div className="flex items-center justify-between gap-7">
          <Link
            href={"/admin/profile"}
            className="profile flex items-center gap-1"
          >
            <div className="w-10 h-10 overflow-hidden rounded-md">
              <img src={imageUrl} alt="user" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col ">
              <h1 className="text-xs font-medium ">
                {t("header.goodMorning")} {data?.fullName}
              </h1>
              <span className="text-xs font-normal text-[#CCCCCC]">
                {t("header.role")}
              </span>
            </div>
          </Link>

          <div className="buttons flex items-center xl:gap-6 lg:gap-4 md:gap-3 sm:gap-2 gap-1">
            <LanguageDropdown />
            <RoleBadge />
            <button
              onClick={() => setIsModalOpen(true)}
              className="notification border border-[#ccc] rounded-lg flex items中心 gap-1 p-2 font-medium text-sm"
            >
              <img
                src={typeof notifications === "string" ? notifications : (notifications?.src || "")}
                alt={t("header.notifications") || "notifications"}
                className="w-5 md:w-6 lg:w-auto"
                loading="lazy"
                decoding="async"
              />
              <span className="rounded-md bg-primary text-white w-4 h-4 text-[10px] flex items-center justify-center">
                {unseenNotifications?.length}
              </span>
            </button>
            <button
              onClick={async () => {
                await appLogout(dispatch, router);
              }}
              className="logout border border-[#ccc] rounded-lg flex items-center gap-1 p-2 font-medium text-sm"
            >
              <span className="hidden sm:inline">{t("header.logout")}</span>
              <img src={typeof logoutIcon === "string" ? logoutIcon : (logoutIcon?.src || "")} alt={t("header.logout")} className="w-5 md:w-6 lg:w-auto" loading="lazy" decoding="async" />
            </button>
          </div>
          <NotificationsModal open={isModalOpen} setOpen={setIsModalOpen} />
        </div>
      </div>
    </header>
  );
};

export default Header;
