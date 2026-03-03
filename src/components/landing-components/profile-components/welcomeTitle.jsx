import dayjs from "dayjs";


import ProfileModal from "../../shared/profile-modal/ProfileModal";
import { useTranslation } from "react-i18next";

const WelcomeTitle = ({ name, joinAt, onEdit }) => {
  const { t } = useTranslation();
  const formattedDate = dayjs(joinAt).format("DD/MM/YYYY");

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-primary/5 to-transparent p-6 md:p-10 rounded-[40px] border border-primary/10 relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <h1 className="text-3xl md:text-4xl xl:text-5xl font-black text-gray-900 leading-tight mb-2">
          {t("profile.welcome", { name })} 👋
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-gray-600">
              {t("profile.joinedSince", { date: formattedDate })}
            </span>
          </div>
          <p className="text-gray-400 text-sm hidden sm:block">
            {t("profile.subtitle") || "مرحباً بك في لوحة تحكم باقورة أمل"}
          </p>
        </div>
      </div>

      <button
        onClick={onEdit}
        className="relative z-10 flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white py-4 px-8 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1 active:scale-95 group"
      >
        <div className="p-1.5 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform">
          <Edit className="w-5 h-5 text-white" />
        </div>
        <span className="text-base">
          {t("profile.editData") || "تعديل الملف الشخصي"}
        </span>
      </button>
    </div>
  );
};

import { Calendar, Edit } from "lucide-react";

export default WelcomeTitle;
