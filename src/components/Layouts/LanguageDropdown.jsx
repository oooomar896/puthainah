import React, { useState, useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";
import saudiFlag from "@/assets/icons/sarIcon.svg";
import ukFlag from "@/assets/icons/enIcon.svg";
import { FaChevronDown } from "react-icons/fa";

const LanguageDropdown = ({ dark = false }) => {
  const [open, setOpen] = useState(false);
  const { lang, setLang, changeLanguage } = useContext(LanguageContext);

  const languages = [
    { code: "ar", label: "اللغة العربية", flag: saudiFlag },
    { code: "en", label: "English", flag: ukFlag },
  ];

  const selectedLang = languages.find((l) => l.code === lang);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-3 px-3 py-1.5 rounded-xl transition-all duration-300 border border-transparent hover:border-white/10 group ${dark ? "text-white" : "text-luxuryBlack"}`}
      >
        <img
          src={typeof selectedLang.flag === "string" ? selectedLang.flag : (selectedLang.flag?.src || "")}
          alt={selectedLang.label}
          className="w-6 h-6 rounded-full object-cover shadow-sm group-hover:scale-110 transition-transform"
        />
        <span className="text-sm font-bold tracking-tight hidden lg:block">
          {selectedLang.label}
        </span>
        <FaChevronDown className={`text-[10px] transition-transform duration-300 ${open ? "rotate-180" : ""} ${dark ? "text-white/40" : "text-gray-400"}`} />
      </button>

      {open && (
        <div className={`absolute rtl:left-0 ltr:right-0 z-[600] top-full mt-3 w-52 rounded-2xl shadow-2xl overflow-hidden border backdrop-blur-xl ${dark ? "bg-luxuryBlack/90 border-white/10" : "bg-white border-gray-100"}`}>
          <div className="py-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  changeLanguage(language.code);
                  setLang(language.code);
                  setOpen(false);
                }}
                className={`flex items-center w-full gap-3 px-5 py-3 text-sm transition-colors ${lang === language.code
                    ? (dark ? "bg-secondary/20 text-secondary font-bold" : "bg-secondary/10 text-secondary font-bold")
                    : (dark ? "text-white hover:bg-white/5" : "text-luxuryBlack hover:bg-gray-50")
                  }`}
              >
                <img
                  src={typeof language.flag === "string" ? language.flag : (language.flag?.src || "")}
                  alt={language.label}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="flex-1 text-right">{language.label}</span>
                {lang === language.code && <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
