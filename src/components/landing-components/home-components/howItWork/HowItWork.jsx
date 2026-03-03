import React, { useEffect, useRef } from "react";
import NumberBg from "../../../shared/numberBg/NumberBg";
import Polygon from "../../../../assets/icons/Polygon.svg";
// import howImg from "../../../../assets/images/howImg.jpg";
const howImg = "https://images.unsplash.com/photo-1556912167-455d5138f36c?auto=format&fit=crop&q=80&w=1600";
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
      className="relative w-full py-24 sm:py-32 bg-white overflow-hidden"
      id="how-it-work"
    >
      <div className="container relative z-10">
        {/* Header Section */}
        <div ref={titleRef} className="text-center space-y-4 mb-20">
          <span className="text-secondary font-bold tracking-[0.3em] uppercase text-sm">خطوات العمل</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-luxuryBlack leading-tight">
            {t("howItWorks.title")}
          </h2>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Image Side - Decorative & High-end */}
          <div ref={imgRef} className="w-full lg:w-1/2 relative">
            <div className="relative z-10 w-full aspect-square rounded-[60px] overflow-hidden border-8 border-gray-50 shadow-2xl rotate-3 transition-transform duration-700 hover:rotate-0">
              <Image
                src={howImg}
                alt="Quality Craftsmanship"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxuryBlack/40 to-transparent"></div>
            </div>
            {/* Decorative Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-secondary/5 rounded-full blur-[100px] -z-10"></div>
          </div>

          {/* List Side */}
          <div ref={contentRef} className="w-full lg:w-1/2">
            <HowItWorkList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWork;
