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

const navLinks = [
  {
    name: "الرئيسية",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "مزودي الخدمة",
    href: "/admin/providers",
    icon: BriefcaseBusiness,
  },
  {
    name: "طالبي الخدمة",
    href: "/admin/requesters",
    icon: Users,
  },
  {
    name: "الطلبات",
    href: "/admin/requests",
    icon: FileText,
  },
  {
    name: "المشاريع",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    name: "التقييمات",
    href: "/admin/our-rates",
    icon: Star,
  },
  {
    name: "الخدمات",
    href: "/admin/services",
    icon: Layers,
  },
  {
    name: "البلاغات",
    href: "/admin/tickets",
    icon: Ticket,
  },
  {
    name: "الأسئلة الشائعة",
    href: "/admin/faqs",
    icon: HelpCircle,
  },
  {
    name: "الملف الشخصي",
    href: "/admin/profile-info",
    icon: FileUser,
  },
  {
    name: "شركاؤنا",
    href: "/admin/partners",
    icon: Handshake,
  },
  {
    name: "العملاء",
    href: "/admin/customers",
    icon: UsersRound,
  },
];

const MobileNavigation = () => {
  const pathname = usePathname();
  
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 pb-safe">
      <div className="flex justify-between items-center h-16 px-2 overflow-x-auto no-scrollbar">
        <nav className="flex w-full justify-between items-center min-w-max gap-4 px-2">
          {navLinks?.map((link) => {
             const isActive = link.exact 
             ? pathname === link.href 
             : pathname.includes(link.href) && link.href !== "/admin";
             
             const Icon = link.icon;
             
             return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-[64px] ${
                  isActive
                    ? "text-primary bg-primary/5 translate-y-[-4px]"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 2 : 1.5}
                  className={isActive ? "fill-primary/20" : ""}
                />
                <span className="text-[10px] mt-1 font-medium truncate max-w-[60px]">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default MobileNavigation;
