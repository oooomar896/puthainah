import React, { useEffect, useRef } from "react";
import NumberBg from "../../../shared/numberBg/NumberBg";
import Polygon from "../../../../assets/icons/Polygon.svg";
// import howImg from "../../../../assets/images/howImg.jpg";
const howImg = "https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=1600";
import HowItWorkList from "./HowItWorkList";
import { useLocation } from "@/utils/useLocation";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const HowItWork = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const contentRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Animate Title
      gsap.from(titleRef.current, {
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
        },
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // Animate Image Section
      gsap.from(imgRef.current, {
        scrollTrigger: {
          trigger: imgRef.current,
          start: "top 75%",
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // Animate Content Section
      gsap.from(contentRef.current, {
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 75%",
        },
        x: 50,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full py-24 sm:py-32 bg-luxuryBlack overflow-hidden grain-bg"
      id="how-it-work"
    >
      <div className="container relative z-10">
        {/* Header Section */}
        <div ref={titleRef} className="text-center space-y-6 mb-24">
          <span className="text-secondary font-black tracking-[0.4em] uppercase text-xs md:text-sm">منهجية العمل</span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
            {t("howItWorks.title")}
          </h2>
          <div className="w-24 h-[3px] bg-secondary/30 mx-auto rounded-full"></div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
          {/* Image Side - Decorative & High-end */}
          <div ref={imgRef} className="w-full lg:w-1/2 relative group">
            <div className="relative z-10 w-full aspect-square rounded-[80px] overflow-hidden border border-white/10 shadow-3xl rotate-2 transition-all duration-700 group-hover:rotate-0 group-hover:scale-105">
              <Image
                src={howImg}
                alt="Quality Craftsmanship"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxuryBlack/80 via-transparent to-transparent"></div>

              {/* Overlay Badge */}
              <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-secondary/90 backdrop-blur-md flex items-center justify-center animate-bounce shadow-2xl shadow-secondary/20">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-luxuryBlack">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-secondary/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute -top-10 -left-10 w-40 h-40 border-t-8 border-l-8 border-secondary/10 rounded-tl-[80px] -z-10 transition-all duration-700 group-hover:scale-110"></div>
          </div>

          {/* List Side */}
          <div ref={contentRef} className="w-full lg:w-1/2">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[40px] p-8 md:p-12">
              <HowItWorkList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWork;
