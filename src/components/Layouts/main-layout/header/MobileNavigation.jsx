"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, PlusCircle, UserCircle2Icon } from "lucide-react";
import { useSelector } from "react-redux";
import requestOrders from "../../../../assets/icons/requestOrders.svg";
import requestOrdersActive from "../../../../assets/icons/requestOrdersActive.svg";
import { getAppBaseUrl } from "../../../../utils/env";
import OptimizedImage from "@/components/shared/OptimizedImage";

const MobileNavigation = ({ data }) => {
  const { token, role } = useSelector((state) => state.auth);

  const navLinks = [
    {
      name: " الصفحه الرئيسية",
      href: "/",
      icon: <HomeIcon />,
    },
    {
      name: "طلباتي",
      href: "/requests",
      icon: requestOrders,
      iconActive: requestOrdersActive,
    },
    {
      name: "طلب خدمة",
      href: role === "Requester" ? "/request-service" : "/signup",
      icon: <PlusCircle />,
    },
  ];
  const pathname = usePathname();
  const imageUrl = (() => {
    const raw = data?.profilePictureUrl || null;
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    const base = (getAppBaseUrl() || "").replace(/\/$/, "");
    const path = String(raw).replace(/^\//, "");
    return `${base}/${path}`;
  })();
  // <UserCircle2Icon />
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-luxuryBlack/90 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-[1000] pb-safe">
      <div className="flex justify-between items-center h-[76px] px-8">
        {/* Navigation Links */}
        <nav className="flex-1 flex justify-between items-center max-w-sm mx-auto w-full">
          {navLinks?.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-2 transition-all duration-500 w-20 relative py-1
                ${isActive ? "text-secondary -translate-y-2 scale-110" : "text-gray-500"}`}
              >
                {isActive && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-secondary rounded-b-xl shadow-[0_4px_15px_#E2B13C66]" />
                )}

                <div className={`p-2 rounded-2xl transition-all duration-500 ${isActive ? 'bg-secondary/10 shadow-[0_0_20px_#E2B13C22]' : 'bg-transparent'}`}>
                  {typeof link.icon === "object" && !React.isValidElement(link.icon) ? (
                    (() => {
                      const srcObj = isActive ? link.iconActive : link.icon;
                      const src = typeof srcObj === "string" ? srcObj : (srcObj?.src || "");
                      return (
                        <OptimizedImage
                          src={src}
                          alt={link.name}
                          width={24}
                          height={24}
                          className={`w-[24px] h-[24px] object-contain transition-all duration-500 ${isActive ? 'brightness-125' : 'opacity-60 grayscale'}`}
                        />
                      );
                    })()
                  ) : (
                    React.cloneElement(link.icon, {
                      size: 24,
                      className: `transition-all duration-500 ${isActive ? 'text-secondary' : 'text-gray-500'}`
                    })
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isActive ? 'text-secondary' : 'text-gray-600'}`}>
                  {link.name}
                </span>
              </Link>
            )
          })}

          {token && imageUrl ? (
            <Link href="/profile" className={`flex flex-col items-center justify-center gap-2 transition-all duration-500 w-20 relative py-1 ${pathname === '/profile' ? "-translate-y-2 scale-110" : ""}`}>
              {pathname === '/profile' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-secondary rounded-b-xl shadow-[0_4px_15px_#E2B13C66]" />
              )}
              <div className={`p-0.5 rounded-full border-2 transition-all duration-500 ${pathname === '/profile' ? 'border-secondary shadow-[0_0_20px_#E2B13C44]' : 'border-white/10 opacity-60'}`}>
                <OptimizedImage
                  src={imageUrl}
                  alt="user"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-cover rounded-full"
                />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${pathname === '/profile' ? 'text-secondary' : 'text-gray-600'}`}>
                حسابي
              </span>
            </Link>
          ) : (
            <Link
              href={"/login"}
              className={`flex flex-col items-center justify-center gap-2 transition-all duration-500 w-20 relative py-1
                ${pathname === "/login" ? "text-secondary -translate-y-2 scale-110" : "text-gray-500"}`}
            >
              {pathname === "/login" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-secondary rounded-b-xl shadow-[0_4px_15px_#E2B13C66]" />
              )}
              <div className={`p-2 rounded-2xl transition-all duration-500 ${pathname === "/login" ? 'bg-secondary/10 shadow-[0_0_20px_#E2B13C22]' : 'bg-transparent'}`}>
                <UserCircle2Icon size={24} className={`transition-all duration-500 ${pathname === "/login" ? 'text-secondary' : 'text-gray-500'}`} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${pathname === "/login" ? 'text-secondary' : 'text-gray-600'}`}>
                دخول
              </span>
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
};

export default MobileNavigation;
