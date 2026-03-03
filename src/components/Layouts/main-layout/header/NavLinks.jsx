"use client";

// components/Header/NavLinks.jsx
import { useTranslation } from "react-i18next";
import Link from "next/link";

const NavLinks = ({ links, isActive, onClick, itemClassName }) => {
  const { t } = useTranslation();
  return (
    <>
      <li>
        <Link
          href="/"
          onClick={onClick}
          className={`transition-all duration-300 ${isActive("/") ? "text-primary font-bold" : "hover:text-primary"
            } ${itemClassName || ""}`}
        >
          {t("nav.home")}
        </Link>
      </li>
      {links.map(({ name, href }, i) => (
        <li key={i}>
          <Link
            href={href}
            onClick={onClick}
            className={`transition-all duration-300 ${isActive(href) ? "text-primary font-bold" : "hover:text-primary"
              } ${itemClassName || ""}`}
          >
            {name}
          </Link>
        </li>
      ))}
    </>
  );
};

export default NavLinks;
