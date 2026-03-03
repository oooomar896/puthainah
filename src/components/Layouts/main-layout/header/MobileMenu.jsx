import Link from "next/link";
import logoutIcon from "@/assets/icons/logout.svg";
import logo from "../../../../assets/images/logo-landing.png";
import NavLinks from "./NavLinks";
import { useTranslation } from "react-i18next";
import OptimizedImage from "@/components/shared/OptimizedImage";

const MobileMenu = ({
  isOpen,
  links,
  isActive,
  token,
  role,
  // imageUrl,
  onLogout,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="lg:hidden animate-fade-in flex flex-col h-full bg-white">
      {/* Branding Header in Menu */}
      <div className="flex items-center justify-center py-6 border-b border-gray-100 mb-2">
        <Link href="/" onClick={onClose} className="block w-48 hover:scale-105 transition-transform">
          <div className="relative w-48 h-16">
            <OptimizedImage
              src={logo}
              alt="Bothina Suliman Logo"
              fill
              className="object-contain"
            />
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2">
        <ul className="flex flex-col gap-2 text-[#2B2D32] text-sm">
          <NavLinks
            links={links}
            isActive={isActive}
            onClick={onClose}
            itemClassName="block w-full py-3 px-2 border-b border-gray-50 hover:bg-gray-50 rounded-lg"
          />
        </ul>
      </nav>

      {token && role === "Requester" ? (
        <div className="flex flex-col gap-3">
          <button
            onClick={onLogout}
            className="logout border border-[#ccc] rounded-lg gap-1 p-3 font-medium text-sm flex justify-between items-center bg-white active:bg-gray-50"
          >
            <span className="inline">{t("mobileMenu.logout")}</span>
            <img src={typeof logoutIcon === "string" ? logoutIcon : (logoutIcon?.src || "")} alt="logout" loading="lazy" decoding="async" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="py-3 px-4 bg-primary text-white rounded-lg text-center font-medium active:scale-[0.98] transition-transform"
            onClick={onClose}
          >
            {t("mobileMenu.signup")}
          </Link>
          <Link
            href="/login"
            className="py-3 px-4 border border-primary text-primary rounded-lg text-center font-medium active:bg-primary/5 transition-colors"
            onClick={onClose}
          >
            {t("mobileMenu.login")}
          </Link>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
