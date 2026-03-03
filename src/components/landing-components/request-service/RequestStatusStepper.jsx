import React, { useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";

export default function RequestStatusStepper({ status, providerResponse }) {
  const { lang } = useContext(LanguageContext);
  const rawCode = status?.code || "";
  let currentCode = rawCode === "accepted" ? "waiting_payment" : rawCode;
  if (currentCode === 'provider_assigned') currentCode = 'pending_delivery';

  const steps = [
    { code: "pending", labelAr: "قيد المراجعة", labelEn: "Pending" },
    { code: "priced", labelAr: "تم التسعير", labelEn: "Priced" },
    { code: "waiting_payment", labelAr: "بانتظار الدفع", labelEn: "Waiting Payment" },
    { code: "paid", labelAr: "تم الدفع", labelEn: "Paid" },
    { code: "pending_delivery", labelAr: "بانتظار التسليم", labelEn: "Waiting Delivery" },
    { code: "under_review", labelAr: "تحت المراجعة", labelEn: "Under Review" },
    { code: "completed", labelAr: "مكتمل", labelEn: "Completed" },
  ];

  let currentIndex = steps.findIndex((s) => s.code === currentCode);
  if (currentIndex === -1) currentIndex = 0;

  // Advance index if provider has accepted even if status is still 'paid'
  if (providerResponse === 'accepted' && currentCode === 'paid') {
    currentIndex = steps.findIndex((s) => s.code === 'pending_delivery');
  }

  return (
    <div className="w-full py-8 overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-between relative min-w-[800px] px-8">
        {/* Background Line */}
        <div className="absolute left-8 right-8 top-6 h-1 bg-gray-100 rounded-full -z-10" />

        {/* Active Progress Line */}
        <div
          className="absolute left-8 top-6 h-1 bg-gradient-to-r from-[#1967AE] to-[#155490] rounded-full -z-10 transition-all duration-1000 ease-in-out"
          style={{ width: `calc(${((currentIndex) / (steps.length - 1)) * 100}% - 2rem)` }}
        />

        {steps.map((step, idx) => {
          const active = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.code} className="flex flex-col items-center gap-4 relative group shrink-0">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-4 
                  transition-all duration-500 z-10 
                  ${active
                    ? "bg-gradient-to-br from-[#1967AE] to-[#155490] border-white shadow-lg shadow-[#1967AE]/20 scale-100"
                    : "bg-white border-gray-100 text-gray-300 scale-90"
                  }
                  ${isCurrent ? "ring-4 ring-primary/10 scale-110" : ""}
                `}
              >
                {active ? (
                  <svg className="w-5 h-5 text-white animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="font-bold text-sm">{idx + 1}</span>
                )}
              </div>
              <div className="flex flex-col items-center">
                <span
                  className={`
                    text-[11px] md:text-xs font-black text-center w-24 leading-tight transition-colors duration-300
                    ${active ? "text-primary" : "text-gray-400"}
                  `}
                >
                  {lang === "ar" ? step.labelAr : step.labelEn}
                </span>
                {isCurrent && (
                  <span className="mt-1 bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    {lang === 'ar' ? 'الحالية' : 'Current'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
