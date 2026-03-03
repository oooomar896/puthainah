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
    <div className="lg:hidden animate-fade-in flex flex-col h-full bg-luxuryBlack grain-bg fixed inset-0 z-[600]">
      {/* Branding Header in Menu */}
      <div className="flex items-center justify-between px-8 py-8 border-b border-white/5 mb-4">
        <Link href="/" onClick={onClose} className="block w-48 transition-transform active:scale-95">
          <div className="relative w-40 h-16">
            <OptimizedImage
              src={logo}
              alt="Buthaina Suleiman Platform"
              fill
              className="object-contain object-right"
            />
          </div>
        </Link>
        <button
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white active:scale-90 transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-8 py-4">
        <ul className="flex flex-col gap-6">
          <NavLinks
            links={links}
            isActive={isActive}
            onClick={onClose}
            itemClassName="block w-full py-5 px-6 bg-white/[0.03] border border-white/5 rounded-[24px] text-xl font-black text-white/70 hover:text-secondary hover:bg-white/[0.07] transition-all"
          />
        </ul>
      </nav>

      <div className="p-8 border-t border-white/5 bg-luxuryBlack/50 backdrop-blur-lg">
        {token && role === "Requester" ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={onLogout}
              className="group relative overflow-hidden py-5 px-8 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black text-lg flex justify-between items-center active:scale-[0.98] transition-all"
            >
              <span className="relative z-10">{t("mobileMenu.logout")}</span>
              <img src={typeof logoutIcon === "string" ? logoutIcon : (logoutIcon?.src || "")} alt="logout" className="w-6 h-6 opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Link
              href="/signup"
              className="relative overflow-hidden py-5 px-8 bg-secondary text-luxuryBlack rounded-2xl text-center font-black text-xl shadow-[0_15px_30px_#E2B13C33] active:scale-[0.98] transition-all"
              onClick={onClose}
            >
              <span className="relative z-10">{t("mobileMenu.signup")}</span>
            </Link>
            <Link
              href="/login"
              className="py-5 px-8 border-2 border-white/10 text-white rounded-2xl text-center font-black text-xl backdrop-blur-md active:bg-white/5 transition-all"
              onClick={onClose}
            >
              {t("mobileMenu.login")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
