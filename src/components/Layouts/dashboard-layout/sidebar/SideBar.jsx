const logo = "/vite.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  ClipboardList,
  FolderKanban,
  Star,
  MessageSquare
} from "lucide-react";
import { useSelector } from "react-redux";
import { useGetProviderOrderStatisticsQuery } from "@/redux/api/adminStatisticsApi";
import { getAppBaseUrl } from "../../../../utils/env";

const SideBar = ({ data }) => {
  const { t } = useTranslation();
  const imageUrl = data?.profilePictureUrl
    ? `${getAppBaseUrl()}/${data.profilePictureUrl}`
    : logo;

  const Links = [
    {
      name: t("navProvider.availableOrders"),
      href: "/provider/active-orders",
      icon: ClipboardList,
    },
    {
      name: t("navProvider.myProjects"),
      href: "/provider/our-projects",
      icon: FolderKanban,
    },
    {
      name: t("navProvider.myRatings"),
      href: "/provider/our-rates",
      icon: Star,
    },
    {
      name: t("navProvider.reports"),
      href: "/provider/tickets",
      icon: MessageSquare,
    },
  ];

  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const userId = useSelector((state) => state.auth.userId);
  const { data: providerStats } = useGetProviderOrderStatisticsQuery({ providerId: userId }, { skip: !userId });
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const dragState = useRef({ down: false, startY: 0, startTop: 0 });
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const [navHeight, setNavHeight] = useState(null);
  useEffect(() => {
    const update = () => {
      const h = (typeof window !== "undefined" ? window.innerHeight : 0) - (headerRef.current?.offsetHeight || 0) - (footerRef.current?.offsetHeight || 0);
      setNavHeight(h > 0 ? h : null);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
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
    <aside ref={containerRef} className={`h-screen overflow-hidden fixed ${collapsed ? "w-[80px]" : "w-[250px]"} bg-white border-l lg:border-r border-gray-200 top-0 right-0 hidden lg:flex flex-col justify-between select-none`}>
      <div ref={headerRef} className="logo px-6 py-3 border-b border-gray-200 flex items-center justify-between">
        <img src={typeof logo === "string" ? logo : (logo?.src || "")} alt="" className={collapsed ? "h-8 w-8 object-contain" : "h-10 w-auto object-contain"} />
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="rounded-md p-2 hover:bg-gray-100 text-gray-700"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
      <nav ref={scrollRef} className="flex-1 overflow-y-auto select-none" style={navHeight ? { height: navHeight } : undefined}>
        <ul>
          <li>
            <Link
              href={"/provider"}
              aria-current={pathname === "/provider" ? "page" : undefined}
              className={`group flex items-center gap-4 py-3 px-6 text-gray-700 ${pathname === "/provider"
                ? "text-primary font-medium bg-gray-100 border-r-4 border-r-primary"
                : "hover:text-primary"
                }`}
            >
              <Home
                className={`w-6 h-6 ${pathname === "/provider" ? "text-primary" : "text-gray-400"}`}
                strokeWidth={2.5}
              />
              {!collapsed && <span className="truncate">{t("navProvider.home")}</span>}
              {pathname === "/provider" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          </li>
          {Links.map((item, i) => (
            <li key={i}>
              <Link
                href={item.href}
                aria-current={pathname.includes(item.href) ? "page" : undefined}
                className={`group flex items-center gap-4 py-3 px-6 text-gray-700 ${pathname.includes(item.href)
                  ? "text-primary font-medium bg-gray-100 border-r-4 border-r-primary"
                  : "hover:text-primary"
                  }`}
              >
                {(() => {
                  const IconComponent = item.icon;
                  const isActive = pathname.includes(item.href);
                  return <IconComponent
                    className={`w-6 h-6 ${isActive ? "text-primary" : "text-gray-400"}`}
                    strokeWidth={2.5}
                  />;
                })()}
                {!collapsed && <span className="truncate">{item.name}</span>}
                {!collapsed && item.href === "/provider/our-projects" && typeof providerStats?.totalOrders === "number" && (
                  <span className="ml-auto text-xs rounded-lg px-2 py-0.5 bg-primary/10 text-primary">
                    {providerStats.totalOrders}
                  </span>
                )}
                {pathname.includes(item.href) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div ref={footerRef} className="info flex items-center gap-2 px-6 py-7 border-t border-gray-200">
        <div className="rounded-full w-8 h-8 overflow-hidden border-2 border-[#D8D8FE]">
          <img src={imageUrl} alt="user" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        </div>
        {!collapsed && (
          <Link href={"/provider/profile"} className="content text-gray-700">
            <h3 className="font-medium leading-4 truncate">{data?.name}</h3>
            <span className="text-xs font-normal leading-4">
              {t("navProvider.serviceProvider")}
            </span>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default SideBar;
