"use client";

const userImg = "/vite.png";
import logoutIcon from "../../../../assets/icons/logout.svg";
import notifications from "../../../../assets/icons/notifications.svg";
import { useDispatch, useSelector } from "react-redux";
import { appLogout } from "../../../../utils/logout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGetNotificationsQuery } from "../../../../redux/api/notificationsApi";
import NotificationsModal from "@/components/Layouts/NotificationsModal";
import { useTranslation } from "react-i18next";
import LanguageDropdown from "@/components/Layouts/LanguageDropdown";
import { getAppBaseUrl } from "../../../../utils/env";
import RoleBadge from "@/components/shared/RoleBadge";
import UserAvatarMenu from "@/components/shared/UserAvatarMenu";

const SeekerHeader = ({ data }) => {
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
            : (typeof userImg === "string" ? userImg : (userImg?.src || userImg));

    return (
        <header className="lg:mr-[250px] sticky top-0 right-0 bg-white py-6 border-b-2 border-b-[#E7E7E7] z-[500]">
            <div className="container">
                <div className="flex items-center justify-between gap-7">
                    <div className="profile flex items-center gap-2">
                        <UserAvatarMenu
                            imageUrl={imageUrl}
                            items={[
                                { href: "/home", label: "الصفحة الرئيسية" },
                                { href: "/profile", label: "الملف الشخصي" },
                                { href: "/requests", label: "طلباتي" },
                                { href: "/tickets", label: "الدعم الفني" },
                                { href: "/logout", label: "تسجيل الخروج" },
                            ]}
                        />
                        <Link href={"/profile"} className="flex flex-col">
                            <h1 className="text-xs font-medium">
                                {t("header.goodMorning")} {data?.name || data?.fullName}
                            </h1>
                            <span className="text-xs font-normal text-[#CCCCCC]">
                                {t("navSeeker.serviceSeeker") || "Service Seeker"}
                            </span>
                        </Link>
                    </div>

                    <div className="buttons flex items-center xl:gap-6 lg:gap-4 md:gap-3 sm:gap-2 gap-1">
                        <LanguageDropdown />
                        <RoleBadge />
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="notification border border-[#ccc] rounded-lg flex items-center gap-1 p-2 font-medium text-sm"
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
                        <NotificationsModal open={isModalOpen} setOpen={setIsModalOpen} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default SeekerHeader;
