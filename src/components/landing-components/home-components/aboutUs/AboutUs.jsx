import React, { useEffect, useRef } from "react";
import NumberBg from "../../../shared/numberBg/NumberBg";
import more from "../../../../assets/icons/moreabout.svg";
// import bgabout from "../../../../assets/images/bgabout.png";
const bgabout = "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&q=80&w=1600";
import Link from "next/link";
import Image from "next/image";
import { useLocation } from "@/utils/useLocation";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const AboutUs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Animate Title
      gsap.from(titleRef.current, {
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // Animate Description
      gsap.from(descRef.current, {
        scrollTrigger: {
          trigger: descRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });

      // Animate Button (only if present)
      if (btnRef.current) {
        gsap.from(btnRef.current, {
          scrollTrigger: {
            trigger: btnRef.current,
            start: "top 85%",
          },
          y: 30,
          opacity: 0,
          duration: 0.8,
          delay: 0.4,
          ease: "power3.out",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div
      ref={containerRef}
      className="relative py-24 sm:py-32 md:py-40 bg-luxuryBlack overflow-hidden"
      id="about-us"
    >
      {/* Dynamic Background with high-end texture */}
      <div className="absolute inset-0 z-0">
        <Image src={bgabout} alt="" fill className="object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-l from-luxuryBlack via-luxuryBlack/90 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32">

          {/* Content Side - Precise & Luxurious */}
          <div className="flex-1 space-y-12 text-right order-2 lg:order-1">
            <div ref={titleRef} className="space-y-6">
              <div className="inline-flex items-center gap-3">
                <span className="text-secondary font-black tracking-[0.4em] uppercase text-xs md:text-sm">
                  قثصة نجاح وشغف
                </span>
                <div className="w-12 h-[2px] bg-secondary/30"></div>
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
                تميزنا هو <span className="shimmer-text">سر نجاحنا</span>
              </h2>
            </div>

            <div ref={descRef} className="space-y-8">
              <p className="text-gray-400 text-lg md:text-2xl leading-relaxed max-w-3xl font-medium">
                بثينة سليمان ليست مجرد منصة، بل هي كيان إبداعي يهدف إلى تغيير مفهوم التصميم الداخلي وتصنيع الأثاث الفاخر في المملكة، من خلال دمج التراث بالأصالة والعصرية بالابتكار.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 text-right pt-4">
                <div className="group p-6 bg-white/5 border border-white/10 rounded-3xl transition-all hover:bg-white/10">
                  <h4 className="text-secondary font-black text-4xl mb-2">+100</h4>
                  <p className="text-gray-500 text-base font-bold">مشروع سكني وتجاري ناجح</p>
                </div>
                <div className="group p-6 bg-secondary/10 border border-secondary/20 rounded-3xl transition-all hover:bg-secondary/20">
                  <h4 className="text-white font-black text-4xl mb-2">+15</h4>
                  <p className="text-secondary font-bold text-base">عام من الخبرة في السوق السعودي</p>
                </div>
              </div>
            </div>

            {/* Button */}
            {location.pathname === "/" && (
              <div ref={btnRef} className="pt-8">
                <Link
                  href={"/about-us"}
                  className="group relative inline-flex items-center gap-6 bg-white text-luxuryBlack px-10 py-5 rounded-2xl transition-all duration-500 hover:shadow-[0_10px_40px_rgba(255,255,255,0.2)] active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10 font-black text-xl">
                    {t("about.more")}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-luxuryBlack/5 flex items-center justify-center group-hover:bg-secondary transition-colors duration-500">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-luxuryBlack rotate-180">
                      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Decorative Side - High-end Visuals */}
          <div className="flex-1 relative order-1 lg:order-2">
            <div className="relative group">
              <div className="relative z-10 w-full aspect-[4/5] rounded-[40px] overflow-hidden border border-white/10 shadow-3xl">
                <Image src={bgabout} alt="About Buthaina" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-luxuryBlack via-transparent to-transparent"></div>
              </div>

              {/* Artistic Elements */}
              <div className="absolute -top-10 -left-10 w-32 h-32 border-t-4 border-l-4 border-secondary/40 rounded-tl-[40px] -z-10"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 border-b-4 border-r-4 border-secondary/40 rounded-br-[40px] -z-10"></div>

              {/* Floating Award Badge */}
              <div className="absolute bottom-10 right-10 bg-secondary px-8 py-10 rounded-3xl flex flex-col items-center gap-2 shadow-2xl animate-float">
                <span className="text-luxuryBlack font-black text-5xl">15</span>
                <span className="text-luxuryBlack font-bold text-sm text-center leading-tight">سنة من<br />الإبداع</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
