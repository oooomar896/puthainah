"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Search, Ticket } from "lucide-react";

const navLinks = [
    {
        name: "Home", // Translation keys can be added if needed, sticking to simple for now or adding hardcoded Arabic/English checks if I had access to translation hook here easily. 
        // Using hardcoded titles as placeholder or keys if I use useTranslation
        href: "/home",
        icon: Home,
    },
    {
        name: "New Request",
        href: "/request-service",
        icon: PlusCircle,
    },
    {
        name: "Explore",
        href: "/requests",
        icon: Search,
    },
    {
        name: "Tickets",
        href: "/tickets",
        icon: Ticket,
    },
];

const SeekerMobileNavigation = () => {
    const pathname = usePathname();

    return (
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="flex justify-between items-center h-16 px-4">
                {/* Navigation Links */}
                <nav className="flex-1 flex justify-around items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/home" && pathname.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group flex flex-col items-center justify-center space-y-1 text-sm text-gray-600 hover:text-primary transition-all ${isActive
                                        ? "text-primary font-semibold"
                                        : ""
                                    }`}
                            >
                                <span
                                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-all ${isActive
                                            ? "bg-primary/20 ring-2 ring-primary/30 shadow-sm"
                                            : "bg-gray-100 group-hover:bg-gray-200"
                                        } group-hover:shadow-md group-active:scale-[0.98]`}
                                >
                                    <link.icon className="w-6 h-6" />
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default SeekerMobileNavigation;
