"use client";

import React, { useContext, useMemo, useState } from "react";
import { motion } from "framer-motion"; // ✅ استيراد Framer Motion
import ServiceCard from "./ServiceCard";

import { LanguageContext } from "@/context/LanguageContext";
import { AppLink } from "../../../../utils/routing";

import { PLATFORM_SERVICES } from "@/constants/servicesData";

const ServiceList = ({ data }) => {
  const { lang } = useContext(LanguageContext);
  const [query, setQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState("none");

  const normalized = useMemo(() => {
    // We strictly use the 8 services requested by the user
    return PLATFORM_SERVICES.map((standardService) => {
      // Try to find best match in the database: prefer active + priced
      const matches = Array.isArray(data) ? data.filter(item => {
        const nameAr = item.name_ar || item.titleAr || "";
        const nameEn = item.name_en || item.titleEn || "";
        return nameAr.includes(standardService.name_ar) ||
          standardService.name_ar.includes(nameAr) ||
          nameEn.toLowerCase().includes(standardService.name_en.toLowerCase());
      }) : [];
      const dbMatch =
        matches.find(m => (m.is_active !== false) && typeof m.base_price === 'number') ||
        matches.find(m => m.is_active !== false) ||
        matches[0] || null;

      return {
        id: dbMatch?.id || standardService.id,
        title: lang === 'ar' ? standardService.name_ar : standardService.name_en,
        description: lang === 'ar' ? standardService.description_ar : standardService.description_en,
        price: dbMatch?.price ?? dbMatch?.base_price ?? null,
        isActive: dbMatch ? dbMatch?.is_active !== false : true,
        icon: standardService.icon,
        color: standardService.color,
        raw: dbMatch || standardService,
      };
    });
  }, [data, lang]);

  const filteredSorted = useMemo(() => {
    let list = normalized.filter((s) => s.isActive !== false);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          String(s.title).toLowerCase().includes(q) ||
          String(s.description).toLowerCase().includes(q)
      );
    }
    if (availableOnly) {
      list = list.filter((s) => s.isActive !== false);
    }
    if (sortBy === "priceAsc") {
      list = [...list].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else if (sortBy === "priceDesc") {
      list = [...list].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    }
    return list;
  }, [normalized, query, availableOnly, sortBy]);

  return (
    <div>
      <div className="container">
        <div className="card mb-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="flex-1">
              <input
                type="text"
                className="input input-search rounded-xl pl-10"
                placeholder="ابحث عن خدمة..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                />
                المتاحة فقط
              </label>
              <select
                className="input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="none">بدون ترتيب</option>
                <option value="priceAsc">السعر: من الأقل للأعلى</option>
                <option value="priceDesc">السعر: من الأعلى للأقل</option>
              </select>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            عدد النتائج: {filteredSorted.length}
          </div>
        </div>
        <div className="servicesList grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSorted.length > 0 &&
            filteredSorted.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <ServiceCard
                  index={index + 1}
                  icon={item.icon}
                  color={item.color}
                  imageUrl={item.imageUrl}
                  title={item.title}
                  description={item.description}
                  price={item.price}
                  isActive={item.isActive}
                  lang={lang}
                />
              </motion.div>
            ))}
          {filteredSorted.length === 0 && (
            <div className="col-span-full text-center text-sm text-gray-500 py-10">
              لا توجد خدمات متاحة حالياً
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceList;
