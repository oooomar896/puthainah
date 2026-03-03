"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../../../../assets/images/logo-landing.png";
import userImg from "../../../../assets/images/user.jpg";
import { useDispatch, useSelector } from "react-redux";
import { appLogout } from "../../../../utils/logout";
import logoutIcon from "@/assets/icons/logout.svg";
import { useGetNotificationsQuery } from "../../../../redux/api/notificationsApi";
import NotificationsModal from "../../NotificationsModal";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";
import NotificationButton from "./NotificationButton";
import LanguageDropdown from "../../LanguageDropdown";
import { useTranslation } from "react-i18next";
import { getAppBaseUrl } from "../../../../utils/env";
import OptimizedImage from "@/components/shared/OptimizedImage";
import RoleBadge from "@/components/shared/RoleBadge";

const Header = ({ data }) => {
  const { t } = useTranslation(); // 👈 استخدام hook الترجمة

  const pathname = usePathname(); // 👈 نجيب اللينك الحالي
  const router = useRouter();
  const { token, role } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const links = [
    { name: t("headerLanding.about"), href: "/about-us" },
    { name: t("headerLanding.services"), href: "/our-services" },
    { name: t("headerLanding.faq"), href: "/faqs" },
    { name: t("headerLanding.support"), href: "/tickets" },
  ];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: notificationsData } = useGetNotificationsQuery(undefined, {
    pollingInterval: 60000, // كل 60 ثانية
    skip: !token,
  });
  const unseenNotifications =
    notificationsData?.filter((notification) => notification.is_seen === false) ||
    [];
  const dispatch = useDispatch();
  const imageUrl = data?.profilePictureUrl
    ? `${getAppBaseUrl()}/${data.profilePictureUrl}`
    : userImg;

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 left-0 w-full bg-luxuryBlack/90 backdrop-blur-md z-[500] border-b border-white/5 transition-all duration-300">
      <div className="container py-2 lg:py-0">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Section */}
          <Link
            href="/"
            onClick={() => scrollToTop()}
            className="relative flex items-center min-w-[200px] lg:min-w-[280px] h-20 md:h-24 lg:h-28 group"
          >
            <div className="relative w-full h-16 md:h-20 transition-transform duration-300 group-hover:scale-105">
              <OptimizedImage
                src={logo}
                alt="Buthaina Suleiman Platform"
                fill
                priority
                className="object-contain object-right"
              />
            </div>
          </Link>

          {/* Desktop Nav Center */}
          <nav className="hidden lg:flex flex-1 justify-center items-center">
            <ul className="flex items-center gap-8 text-white/80 font-medium">
              <NavLinks
                links={links}
                isActive={isActive}
                onClick={() => scrollToTop()}
              />
            </ul>
          </nav>

          {/* Actions & Locale */}
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden lg:flex items-center gap-4">
              <LanguageDropdown dark />
              <div className="h-6 w-[1px] bg-white/10"></div>
              <RoleBadge />
            </div>

            {/* Mobile Actions Overlay */}
            <div className="flex lg:hidden items-center gap-2">
              <LanguageDropdown />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-secondary border border-white/10"
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>

            {/* Desktop Auth Section */}
            {token && role === "Requester" ? (
              <div className="hidden lg:flex items-center gap-4">
                <NotificationButton
                  unseenCount={unseenNotifications.length}
                  setOpen={setIsModalOpen}
                />
                <Link href="/profile" className="relative group">
                  <div className="w-11 h-11 rounded-full border-2 border-secondary/30 p-0.5 transition-colors group-hover:border-secondary overflow-hidden">
                    <OptimizedImage
                      src={imageUrl}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="object-cover rounded-full"
                    />
                  </div>
                </Link>
                <Link href="/request-service" className="group relative overflow-hidden py-2.5 px-6 bg-secondary text-luxuryBlack font-bold rounded-xl transition-all hover:shadow-[0_0_15px_rgba(226,177,60,0.3)]">
                  <span className="relative z-10">{t("headerLanding.requestService")}</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </Link>
                <button
                  onClick={async () => {
                    await appLogout(dispatch, router);
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-red-400 transition-colors"
                  title={t("headerLanding.logout")}
                >
                  <FiX size={20} />
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-4">
                <Link href="/login" className="text-white/80 hover:text-white font-medium transition-colors px-4">
                  {t("headerLanding.login")}
                </Link>
                <Link href="/signup" className="group relative overflow-hidden py-2.5 px-8 bg-secondary text-luxuryBlack font-black rounded-xl transition-all hover:shadow-[0_0_20px_rgba(226,177,60,0.4)]">
                  <span className="relative z-10">{t("headerLanding.signup")}</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isMenuOpen}
          links={links}
          isActive={isActive}
          token={token}
          role={role}
          unseenCount={unseenNotifications.length}
          imageUrl={imageUrl}
          onLogout={async () => {
            await appLogout(dispatch, router);
          }}
          onClose={() => setIsMenuOpen(false)}
        />
      </div>
    </header>
  );
};

export default Header;
