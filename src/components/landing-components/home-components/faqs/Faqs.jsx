import React from "react";
import { motion } from "framer-motion"; // ✅ استيراد Framer Motion
import NumberBg from "../../../shared/numberBg/NumberBg";
import CustomAccordion from "./accordion";
import { useLocation } from "@/utils/useLocation";
import { useGetQuestionsQuery } from "../../../../redux/api/faqsApi";
import { useTranslation } from "react-i18next";

const Faqs = () => {
  const { t } = useTranslation();
  const { data: questions } = useGetQuestionsQuery();

  const location = useLocation();

  return (
    <section className="py-24 sm:py-32 bg-white" id="faqs">
      {location.pathname !== "/" && <title>{t("faqs.title")}</title>}
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Header Side */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="space-y-4">
              <span className="text-secondary font-bold tracking-[0.3em] uppercase text-sm">الأسئلة الشائعة</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-luxuryBlack leading-tight">
                {t("faq")}
              </h2>
            </div>
            <p className="text-gray-500 text-lg leading-relaxed">
              هنا تجد إجابات لمعظم الاستفسارات التي قد تخطر ببالك حول خدماتنا وعملية التصميم والتنفيذ. نبسط لك الأمور لتبدأ رحلتك معنا بوضوح.
            </p>
            <div className="hidden lg:block w-24 h-1 bg-secondary rounded-full"></div>
          </div>

          {/* Accordion Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-full lg:w-2/3"
          >
            <CustomAccordion questions={questions} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Faqs;
