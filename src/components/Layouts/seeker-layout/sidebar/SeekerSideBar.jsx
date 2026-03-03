"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { getAppBaseUrl } from "@/utils/env";
import { Home, PlusCircle, Search, Ticket, ChevronLeft, ChevronRight } from "lucide-react";

const logo = "/vite.png";

const SeekerSideBar = ({ data }) => {
    const { t } = useTranslation();
    const imageUrl = data?.profilePictureUrl
        ? `${getAppBaseUrl()}/${data.profilePictureUrl}`
        : logo;

    // Define Seeker Links
    const Links = [
        {
            name: t("navSeeker.home") || "Home",
            href: "/home",
            icon: Home,
        },
        {
            name: t("navSeeker.postRequest") || "Post Request",
            href: "/request-service",
            icon: PlusCircle,
        },
        {
            name: t("navSeeker.explore") || "Explore Requests",
            href: "/requests",
            icon: Search,
        },
        {
            name: t("navSeeker.support") || "Support Tickets",
            href: "/tickets",
            icon: Ticket,
        },
    ];

    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const containerRef = useRef(null);
    const scrollRef = useRef(null);
    const dragState = useRef({ down: false, startY: 0, startTop: 0 });
    useEffect(() => {
        const containerEl = containerRef.current;
        const el = scrollRef.current;
        if (!containerEl || !el) return;
        const onMouseDown = (e) => {
            dragState.current.down = true;
            dragState.current.startY = e.pageY;
            dragState.current.startTop = el.scrollTop;
            containerEl.style.cursor = "grabbing";
            e.preventDefault();
        };
        const onMouseMove = (e) => {
            if (!dragState.current.down) return;
            const dy = e.pageY - dragState.current.startY;
            el.scrollTop = dragState.current.startTop - dy;
        };
        const end = () => {
            dragState.current.down = false;
            if (containerEl) containerEl.style.cursor = "grab";
        };
        const onTouchStart = (e) => {
            const t = e.touches[0];
            dragState.current.down = true;
            dragState.current.startY = t.pageY || t.clientY;
            dragState.current.startTop = el.scrollTop;
        };
        const onTouchMove = (e) => {
            if (!dragState.current.down) return;
            const t = e.touches[0];
            const dy = (t.pageY || t.clientY) - dragState.current.startY;
            el.scrollTop = dragState.current.startTop - dy;
        };
        const onWheel = (e) => {
            if (!el) return;
            el.scrollTop += e.deltaY;
            e.preventDefault();
        };
        containerEl.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", end);
        containerEl.addEventListener("mouseleave", end);
        containerEl.addEventListener("touchstart", onTouchStart, { passive: true });
        containerEl.addEventListener("touchmove", onTouchMove, { passive: true });
        containerEl.addEventListener("touchend", end);
        containerEl.addEventListener("wheel", onWheel, { passive: false });
        containerEl.style.cursor = "grab";
        return () => {
            containerEl.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", end);
            containerEl.removeEventListener("mouseleave", end);
            containerEl.removeEventListener("touchstart", onTouchStart);
            containerEl.removeEventListener("touchmove", onTouchMove);
            containerEl.removeEventListener("touchend", end);
            containerEl.removeEventListener("wheel", onWheel);
        };
    }, []);

    return (
        <aside ref={containerRef} className={`h-screen overflow-hidden fixed ${collapsed ? "w-[80px]" : "w-[250px]"} bg-white border-l lg:border-r border-gray-200 top-0 right-0 hidden lg:flex flex-col justify-between transition-all duration-300 z-50 select-none`}>
            <div className="logo px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                <img src={logo} alt="Buthaina Platform" className={collapsed ? "h-8 w-8 object-contain" : "h-10 w-auto object-contain"} />
                <button
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="rounded-md p-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => setCollapsed((c) => !c)}
                >
                    {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
            </div>
            <nav ref={scrollRef} className="flex-1 mt-4 overflow-y-auto select-none">
                <ul>
                    {Links.map((item, i) => {
                        const isActive = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
                        return (
                            <li key={i}>
                                <Link
                                    href={item.href}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`group flex items-center gap-4 py-3 px-6 text-gray-700 ${isActive
                                        ? "text-primary font-medium bg-gray-100 border-r-4 border-r-primary"
                                        : "hover:text-primary"
                                        }`}
                                >
                                    <item.icon className="w-6 h-6" />
                                    {!collapsed && <span className="truncate">{item.name}</span>}
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
            <div className="info flex items-center gap-2 px-6 py-7 border-t border-gray-200">
                <div className="rounded-full w-8 h-8 overflow-hidden border-2 border-[#D8D8FE]">
                    <img src={imageUrl} alt="user" className="w-full h-full object-cover" />
                </div>
                {!collapsed && (
                    <Link href={"/profile"} className="content text-gray-700">
                        <h3 className="font-medium leading-4 truncate">{data?.name || data?.fullName || "User"}</h3>
                        <span className="text-xs font-normal leading-4">
                            {t("navSeeker.serviceSeeker") || "Service Seeker"}
                        </span>
                    </Link>
                )}
            </div>
        </aside>
    );
};

export default SeekerSideBar;
