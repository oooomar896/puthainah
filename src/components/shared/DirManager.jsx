"use client";

import { useEffect, useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";

export default function DirManager() {
  const { lang } = useContext(LanguageContext);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    const html = document.documentElement;
    if (html) {
      html.setAttribute("dir", dir);
      html.setAttribute("lang", lang);
    }
  }, [lang]);

  return null;
}
