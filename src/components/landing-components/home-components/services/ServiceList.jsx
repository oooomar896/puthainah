"use client";

import React, { useContext, useRef, useEffect, useMemo } from "react";
import ServiceCard from "./ServiceCard";
import { AppLink } from "../../../../utils/routing";
import { PLATFORM_SERVICES } from "@/constants/servicesData";
import { LanguageContext } from "@/context/LanguageContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { SkeletonCard } from "../../../shared/skeletons/Skeleton";
import EmptyState from "../../../shared/EmptyState";
import { Layers } from "lucide-react";

const ServiceList = ({ data, isLoading }) => {
  const { lang } = useContext(LanguageContext);
  const containerRef = useRef(null);

  const items = useMemo(() => {
    // Return empty if data is not an array (though we will use PLATFORM_SERVICES mainly)
    const dbServices = Array.isArray(data) ? data : [];

    // Map PLATFORM_SERVICES to ensure we show the standard 8 services with correct icons
    return PLATFORM_SERVICES.map((standardService, idx) => {
      // Find matching service in DB to get price/active status
      // We look for a match by name (English or Arabic)
      const dbMatch = dbServices.find(item => {
        const nameAr = item.name_ar || item.titleAr || "";
        const nameEn = item.name_en || item.titleEn || "";
        return nameAr.includes(standardService.name_ar) ||
          standardService.name_ar.includes(nameAr) ||
          nameEn.toLowerCase().includes(standardService.name_en.toLowerCase());
      });

      const title = lang === "ar" ? standardService.name_ar : standardService.name_en;
      const description = lang === "ar" ? standardService.description_ar : standardService.description_en;

      // Use DB price if available, otherwise null
      const price = dbMatch?.price ?? dbMatch?.base_price ?? null;
      // Use DB active status if available, default to true if no match (or handled by logic)
      const isActive = dbMatch ? dbMatch.is_active !== false : true;

      return {
        id: dbMatch?.id || standardService.id,
        index: idx + 1,
        title,
        description,
        price,
        imageUrl: null, // We generally don't use images for main services anymore, we use icons
        isActive,
        icon: standardService.icon, // The correct Lucide icon
        color: standardService.color
      };
    });
  }, [data, lang]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".service-item", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  if (isLoading) {
    return (
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 min-h-[400px]">
        {items.length > 0 &&
          items.map((item) => (
            <div key={item.id || item.index} className="service-item h-full">
              <ServiceCard
                index={item.index}
                icon={item.icon}
                imageUrl={item.imageUrl}
                title={item.title}
                description={item.description}
                price={item.price}
                isActive={item.isActive}
                lang={lang}
                color={item.color}
              />
            </div>
          ))}
        {items.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              title={lang === "ar" ? "لا توجد خدمات" : "No Services"}
              description={
                lang === "ar"
                  ? "لم يتم العثور على خدمات مطابقة"
                  : "No matching services found"
              }
              icon={Layers}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList;
