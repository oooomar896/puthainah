import { Menu, Transition } from "@headlessui/react";
import { Fragment, ReactNode } from "react";
import { MoreVertical } from "lucide-react";
import Link from "next/link";

interface ActionItem {
    label: string;
    icon?: ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "destructive" | "success";
    hidden?: boolean;
}

interface TableActionsProps {
    actions?: ActionItem[];
}

/**
 * TableActions Component
 * @param {Array} actions - Array of action objects
 */
const TableActions = ({ actions = [] }: TableActionsProps) => {
    return (
        <div className="relative">
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <MoreVertical className="w-5 h-5 text-gray-500" aria-hidden="true" />
                    </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute z-50 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ltr:right-0 rtl:left-0">
                        <div className="px-1 py-1">
                            {actions.map((action, index) => {
                                if (action.hidden) return null;

                                const itemClass = ({ active }: { active: boolean }) =>
                                    `${active
                                        ? action.variant === "destructive"
                                            ? "bg-red-50 text-red-600"
                                            : action.variant === "success"
                                                ? "bg-green-50 text-green-600"
                                                : "bg-primary/10 text-primary"
                                        : action.variant === "destructive"
                                            ? "text-red-600"
                                            : action.variant === "success"
                                                ? "text-green-600"
                                                : "text-gray-700"
                                    } group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors mb-1 last:mb-0`;

                                return (
                                    <Menu.Item key={index}>
                                        {({ active }) =>
                                            action.href ? (
                                                <Link href={action.href} className={itemClass({ active })}>
                                                    {action.icon && (
                                                        <span className="w-4 h-4 ltr:mr-2 rtl:ml-2">
                                                            {action.icon}
                                                        </span>
                                                    )}
                                                    {action.label}
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent row click
                                                        action.onClick?.();
                                                    }}
                                                    className={itemClass({ active })}
                                                >
                                                    {action.icon && (
                                                        <span className="w-4 h-4 ltr:mr-2 rtl:ml-2">
                                                            {action.icon}
                                                        </span>
                                                    )}
                                                    {action.label}
                                                </button>
                                            )
                                        }
                                    </Menu.Item>
                                );
                            })}
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
};

export default TableActions;
