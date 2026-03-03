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
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-[1000] pb-safe">
      <div className="flex justify-between items-center h-[70px] px-6">
        {/* Navigation Links */}
        <nav className="flex-1 flex justify-between items-center max-w-sm mx-auto w-full">
          {navLinks?.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 w-16 relative py-1
                ${isActive ? "text-primary -translate-y-1" : "text-gray-400 hover:text-gray-600"}`}
              >
                {isActive && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-lg shadow-primary/30" />
                )}

                <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10' : 'bg-transparent'}`}>
                  {typeof link.icon === "object" && !React.isValidElement(link.icon) ? (
                    (() => {
                      const srcObj = isActive ? link.iconActive : link.icon;
                      const src = typeof srcObj === "string" ? srcObj : (srcObj?.src || "");
                      return (
                        <OptimizedImage
                          src={src}
                          alt={link.name}
                          width={22}
                          height={22}
                          className={`w-[22px] h-[22px] object-contain transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}
                        />
                      );
                    })()
                  ) : (
                    React.cloneElement(link.icon, {
                      size: 22,
                      className: `transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`
                    })
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                  {link.name}
                </span>
              </Link>
            )
          })}

          {token && imageUrl ? (
            <Link href="/profile" className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 w-16 relative py-1 ${pathname === '/profile' ? "-translate-y-1" : ""}`}>
              {pathname === '/profile' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-lg shadow-primary/30" />
              )}
              <div className={`p-0.5 rounded-full border-2 transition-all duration-300 ${pathname === '/profile' ? 'border-primary shadow-md shadow-primary/20 scale-110' : 'border-gray-200'}`}>
                <OptimizedImage
                  src={imageUrl}
                  alt="user"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-cover rounded-full"
                />
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-300 ${pathname === '/profile' ? 'text-primary' : 'text-gray-400'}`}>
                حسابي
              </span>
            </Link>
          ) : (
            <Link
              href={"/login"}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 w-16 relative py-1
                ${pathname === "/login" ? "text-primary -translate-y-1" : "text-gray-400 hover:text-gray-600"}`}
            >
              {pathname === "/login" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-lg shadow-primary/30" />
              )}
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${pathname === "/login" ? 'bg-primary/10' : 'bg-transparent'}`}>
                <UserCircle2Icon size={22} className={`transition-transform duration-300 ${pathname === "/login" ? 'scale-110' : 'scale-100'}`} />
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-300 ${pathname === "/login" ? 'text-primary' : 'text-gray-400'}`}>
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
