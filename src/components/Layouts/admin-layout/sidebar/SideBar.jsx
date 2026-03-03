const logo = "/vite.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  FileText,
  FolderKanban,
  Star,
  Layers,
  Ticket,
  HelpCircle,
  FileUser,
  Handshake,
  UsersRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAppBaseUrl } from "../../../../utils/env";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetAdminStatisticsQuery } from "@/redux/api/adminStatisticsApi";

const SideBar = ({ data, collapsed, setCollapsed }) => {
  const { t } = useTranslation();
  const pathname = usePathname();

  const Links = [
    {
      name: t("navProvider.home"),
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: t("nav.providers"),
      href: "/admin/providers",
      icon: BriefcaseBusiness,
    },
    {
      name: t("nav.requesters"),
      href: "/admin/requesters",
      icon: Users,
    },
    {
      name: t("nav.requests"),
      href: "/admin/requests",
      icon: FileText,
    },
    {
      name: t("nav.projects"),
      href: "/admin/projects",
      icon: FolderKanban,
    },
    {
      name: t("nav.rates"),
      href: "/admin/our-rates",
      icon: Star,
    },
    {
      name: t("nav.services"),
      href: "/admin/services",
      icon: Layers,
    },
    {
      name: t("nav.tickets"),
      href: "/admin/tickets",
      icon: Ticket,
    },
    {
      name: t("nav.faqs"),
      href: "/admin/faqs",
      icon: HelpCircle,
    },
    {
      name: t("footer.profile"),
      href: "/admin/profile-info",
      icon: FileUser,
    },
    {
      name: t("nav.partners"),
      href: "/admin/partners",
      icon: Handshake,
    },
    {
      name: t("nav.customers"),
      href: "/admin/customers",
      icon: UsersRound,
    },
  ];

  const imageUrl =
    typeof data?.profilePictureUrl === "string" && data.profilePictureUrl.length > 0
      ? (data.profilePictureUrl.startsWith("http")
        ? data.profilePictureUrl
        : `${getAppBaseUrl()}/${data.profilePictureUrl}`)
      : (typeof logo === "string" ? logo : (logo?.src || ""));

  const { data: stats } = useGetAdminStatisticsQuery();
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
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

  return (
    <aside
      ref={containerRef}
      className={`h-screen overflow-hidden fixed bg-white border-l border-gray-200 top-0 right-0 hidden lg:flex flex-col justify-between shadow-lg z-50 transition-all duration-300 ease-in-out ${collapsed ? "w-[88px]" : "w-[280px]"
        }`}
    >
      <div ref={headerRef} className="logo p-4 flex items-center justify-between border-b border-gray-100 bg-white min-h-[80px]">
        <div className={`transition-opacity duration-300 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 flex-1"}`}>
          <img src={typeof logo === "string" ? logo : (logo?.src || "")} alt="Buthaina Platform" className="h-10 w-auto object-contain mx-auto" />
        </div>

        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`rounded-full p-2 hover:bg-gray-50 text-gray-500 hover:text-primary transition-colors ${collapsed ? "mx-auto" : ""}`}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav ref={scrollRef} className="flex-1 overflow-y-auto py-6 sidebar-scroll custom-scrollbar" style={navHeight ? { height: navHeight } : undefined}>
        <ul className="flex flex-col gap-2 px-3">
          {Links.map((item, i) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.includes(item.href) && item.href !== "/admin";

            const Icon = item.icon;

            return (
              <li key={i}>
                <Link
                  href={item.href}
                  title={collapsed ? item.name : ""}
                  className={`group flex items-center gap-3 py-3 px-3.5 rounded-xl transition-all duration-200 relative ${isActive
                    ? "bg-primary/5 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                    }`}
                >
                  <Icon
                    size={22}
                    className={`shrink-0 transition-colors duration-200 ${isActive ? "text-primary fill-primary/10" : "text-gray-400 group-hover:text-primary"
                      }`}
                    strokeWidth={1.5}
                  />

                  <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 overflow-hidden ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    }`}>
                    {item.name}
                  </span>

                  {!collapsed && (
                    <div className="mr-auto flex items-center gap-2">
                      {item.href === "/admin/providers" && typeof stats?.totalProviders === "number" && (
                        <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {stats.totalProviders}
                        </span>
                      )}
                      {item.href === "/admin/requesters" && typeof stats?.totalRequesters === "number" && (
                        <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {stats.totalRequesters}
                        </span>
                      )}
                      {item.href === "/admin/requests" && typeof stats?.totalRequests === "number" && (
                        <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {stats.totalRequests}
                        </span>
                      )}
                      {item.href === "/admin/projects" && typeof stats?.totalProjects === "number" && (
                        <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {stats.totalProjects}
                        </span>
                      )}
                      {item.href === "/admin/tickets" && typeof stats?.totalTickets === "number" && stats.totalTickets > 0 && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      )}
                    </div>
                  )}

                  {isActive && !collapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-lg" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        ref={footerRef}
        className="footer p-4 border-t border-gray-100 bg-gray-50/50"
      >
        <Link href={"/admin/profile"} className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200 ${collapsed ? "justify-center" : ""}`}>
          <div className="relative shrink-0">
            <div className="w-9 h-9 overflow-hidden rounded-full border border-gray-200 shadow-sm">
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
          </div>

          <div className={`overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 flex-1 min-w-0"}`}>
            <h3 className="font-semibold text-sm text-gray-800 truncate leading-tight">{data?.fullName || "Admin User"}</h3>
            <span className="text-xs text-gray-500 truncate block mt-0.5">
              {t("nav.admin")}
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default SideBar;
