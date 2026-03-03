"use client";

import Link from "next/link";

import {
  FaSnapchat,
  FaTiktok,
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useGetProfileInfoQuery } from "../../../../redux/api/profileInfoApi";
import { formatLastUpdate, getLastUpdateTime } from "../../../../utils/buildInfo";
import { useEffect, useState } from "react";
import OptimizedImage from "@/components/shared/OptimizedImage";
import logo from "../../../../assets/images/logoFooter.png";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const [lastUpdate, setLastUpdate] = useState("");

  const { data: profileList } = useGetProfileInfoQuery();
  const profile = Array.isArray(profileList) ? profileList[0] : profileList;
  const filePath = profile?.file_path_url || profile?.filePathUrl;

  const profileUrl = filePath
    ? (filePath.startsWith("http")
      ? filePath
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments/${filePath}`)
    : "#";

  useEffect(() => {
    // Get last update time and format it
    const updateTime = getLastUpdateTime();
    const locale = i18n.language === "ar" ? "ar-SA" : "en-US";
    const formatted = formatLastUpdate(updateTime, locale);
    setLastUpdate(formatted);
  }, [i18n.language]);

  const socials = [
    { icon: <FaFacebookF />, url: "https://www.facebook.com/Bacuratec?locale=ar_AR" },
    { icon: <FaTwitter />, url: "https://x.com/Bacura_tec?s=21" },
    {
      icon: <FaInstagram />,
      url: "https://www.instagram.com/Bacura_tec?igsh=azFzMDY4aGd6ejZv&utm_source=qr",
    },
    {
      icon: <FaSnapchat />,
      url: "https://www.snapchat.com/@Bacura_tec?invite_id=G6fAPTsA&locale=ar_SA%40calendar%3Dgregorian&share_id=a5POSbAvQj-vUY3rK49XUw&xp_id=1&sid=d6804253db774afcbeae7c8ce1688c21",
    },
    { icon: <FaTiktok />, url: "https://www.tiktok.com/@Bacura_tec" },
    { icon: <FaLinkedinIn />, url: "https://www.linkedin.com/company/Bacura-tec/" },
  ];
  return (
    <footer className="pt-24 pb-12 bg-luxuryBlack border-t border-white/5 relative overflow-hidden">
      {/* Background Decorative glow */}
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Column 1: Logo & Vision */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-right gap-8">
            <div className="relative w-72 h-32 lg:w-96 lg:h-40 -mr-6">
              <OptimizedImage
                src={logo}
                alt="Buthaina Business Platform"
                fill
                className="object-contain lg:object-right"
              />
            </div>
            <p className="text-base text-gray-400 leading-relaxed max-w-sm font-medium">
              منصة بثينة أعمال للتصميم الداخلي والأثاث الفاخر. نجسد الرؤى الجمالية في واقع ملموس يحاكي أدق تفاصيل الفخامة والرقي.
            </p>

            {/* Socials - Desktop */}
            <div className="hidden lg:flex gap-4 mt-2">
              {socials.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  className="w-11 h-11 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white/50 hover:bg-secondary hover:text-luxuryBlack hover:border-secondary transition-all duration-400 shadow-xl group"
                >
                  <span className="transition-transform group-hover:scale-110">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Important Links */}
          <div className="flex flex-col items-center lg:items-start gap-6">
            <h5 className="font-black text-white text-xl relative pb-3 w-fit">
              {t("footer.importantLinks")}
              <span className="absolute bottom-0 right-0 w-1/2 h-[3px] bg-secondary rounded-full"></span>
            </h5>
            <ul className="flex flex-col gap-4 text-center lg:text-right w-full">
              <li><Link href="/" className="text-gray-400 hover:text-secondary transition-colors text-base font-bold">{t("footer.home")}</Link></li>
              <li><Link href="/about-us" className="text-gray-400 hover:text-secondary transition-colors text-base font-bold">{t("footer.about")}</Link></li>
              <li><Link href="/our-services" className="text-gray-400 hover:text-secondary transition-colors text-base font-bold">{t("footer.services")}</Link></li>
              <li><Link href="/how-it-work" className="text-gray-400 hover:text-secondary transition-colors text-base font-bold">{t("footer.howItWorks")}</Link></li>
              <li><Link href="/faqs" className="text-gray-400 hover:text-secondary transition-colors text-base font-bold">{t("footer.faq")}</Link></li>
              <li><Link href="/signup-provider" className="text-gray-400 hover:text-secondary transition-colors text-base font-bold">انظم ك شريك نجاح</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact & Legal */}
          <div className="flex flex-col items-center lg:items-start gap-6">
            <h5 className="font-black text-white text-xl relative pb-3 w-fit">
              سياسات الخصوصية
              <span className="absolute bottom-0 right-0 w-1/2 h-[3px] bg-secondary rounded-full"></span>
            </h5>
            <ul className="flex flex-col gap-4 text-center lg:text-right w-full">
              <li><Link href="/terms" className="text-gray-400 hover:text-secondary transition-colors text-base font-bold">الشروط والأحكام</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-secondary transition-colors text-base font-bold">سياسة الخصوصية</Link></li>
              <li><Link href="/national-location" className="text-gray-400 hover:text-secondary transition-colors text-base font-bold">العنوان الوطني</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="flex flex-col items-center lg:items-start gap-6">
            <h5 className="font-black text-white text-xl relative pb-3 w-fit">
              تواصل مباشرة
              <span className="absolute bottom-0 right-0 w-1/2 h-[3px] bg-secondary rounded-full"></span>
            </h5>
            <div className="flex flex-col gap-5 w-full">
              <a href="https://wa.me/+966547000015" target="_blank" className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl shadow-xl hover:bg-white/10 hover:border-secondary/30 transition-all group">
                <div className="w-12 h-12 flex items-center justify-center bg-green-500/10 text-green-500 rounded-xl group-hover:bg-green-500 group-hover:text-white transition-all duration-500">
                  <FaWhatsapp size={24} />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">WhatsApp</span>
                  <span className="text-base font-black dir-ltr text-white group-hover:text-secondary transition-colors">+966 54 700 0015</span>
                </div>
              </a>

              {filePath && (
                <a
                  href={profileUrl}
                  target="_blank"
                  className="flex items-center justify-center gap-3 p-4 bg-secondary text-luxuryBlack rounded-2xl hover:shadow-[0_0_20px_rgba(226,177,60,0.4)] transition-all text-base font-black"
                >
                  <span className="relative z-10">{t("footer.profile")}</span>
                </a>
              )}
            </div>

            {/* Socials - Mobile */}
            <div className="lg:hidden flex gap-4 mt-6 justify-center w-full">
              {socials.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white/50"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-center">
          {lastUpdate && (
            <p className="text-xs text-gray-600 order-3 md:order-1 font-medium">
              {t("footer.lastUpdate")}: {lastUpdate}
            </p>
          )}

          <div className="flex flex-col items-center gap-1 order-1 md:order-2">
            <p className="text-sm text-gray-400 font-bold tracking-tight">{t("footer.rights")}</p>
          </div>

          <div className="order-2 md:order-3 text-[10px] text-gray-600 flex items-center gap-2 uppercase font-black tracking-widest">
            <span>Powered By</span>
            <a href="https://bacura.sa" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
              Bacura Digital Tech
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
