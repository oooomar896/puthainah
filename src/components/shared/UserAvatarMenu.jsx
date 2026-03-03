"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const UserAvatarMenu = ({ imageUrl, items = [] }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open ? "true" : "false"}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md overflow-hidden border-2 border-gray-200 w-10 h-10 focus:ring-2 focus:ring-primary/30"
        title="الملف الشخصي"
      >
        <img src={imageUrl} alt="user" className="w-full h-full object-cover" />
      </button>
      {open && (
        <div className="absolute top-full mt-2 right-0 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          <div className="py-2">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                {it.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatarMenu;

