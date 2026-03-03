"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Accordion, AccordionItem as Item } from "@szhsin/react-accordion";
import { ChevronDown } from "lucide-react";

const AccordionItem = ({ header, ...rest }) => (
  <Item
    {...rest}
    header={({ state: { isEnter } }) => (
      <div className={`flex w-full items-center justify-between transition-colors duration-300 ${isEnter ? "text-luxuryBlack" : "text-gray-700"}`}>
        <span className="font-bold text-lg md:text-xl text-right">{header || "Loading..."}</span>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isEnter ? "bg-luxuryBlack text-secondary rotate-180" : "bg-gray-100 text-gray-400"}`}>
          <ChevronDown size={20} />
        </div>
      </div>
    )}
    className="mb-4 last:mb-0 border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    buttonProps={{
      className: ({ isEnter }) =>
        `flex w-full px-6 py-6 transition-colors duration-300 ${isEnter ? "bg-secondary" : "bg-white"}`
    }}
    contentProps={{
      className: "transition-all duration-500 ease-in-out bg-white overflow-hidden",
    }}
    panelProps={{ className: "px-6 py-4 text-gray-500 leading-relaxed text-right border-t border-gray-50 bg-gray-50/30" }}
  />
);

import { DEFAULT_FAQS } from "@/constants/landingData";

const CustomAccordion = ({ questions: rawQuestions }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language || "ar"; // Default to 'ar' if undefined
  const questions = rawQuestions && rawQuestions.length > 0 ? rawQuestions : DEFAULT_FAQS;

  return (
    <div className="mx-2">
      <Accordion transition transitionTimeout={200}>
        {questions?.map((item, i) => {
          // Robust language check
          const isEn = lang && lang.startsWith("en");

          let question = isEn
            ? (item?.question_en || item?.questionString)
            : (item?.question_ar || item?.questionString);

          let answer = isEn
            ? (item?.answer_en || item?.answer)
            : (item?.answer_ar || item?.answer);

          // Fallback if the selected language field is empty but the other exists
          if (!question) question = isEn ? item?.question_ar : item?.question_en;
          if (!answer) answer = isEn ? item?.answer_ar : item?.answer_en;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <AccordionItem
                header={question}
                initialEntered={i === 0}
              >
                {answer}
              </AccordionItem>
            </motion.div>
          );
        })}
      </Accordion>
    </div>
  );
};

export default CustomAccordion;
