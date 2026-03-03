import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { getAppBaseUrl } from "../../../utils/env";
import { ShieldCheck, Mail, Phone, Edit, User, FileText, Calendar, Building, MapPin } from "lucide-react";

const UserData = ({ data, onEdit }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const srcData = data?.user ? { ...data, ...data.user } : data || {};
  const fullName = srcData.full_name || srcData.fullName || srcData.name || "-";
  const email = srcData.email || "-";
  const phoneNumber = srcData.phone || srcData.phoneNumber || "-";
  const creationTime = srcData.creation_time || srcData.created_at || srcData.user_created_at || Date.now();
  const commercialRegistrationNumber = srcData.commercial_registration_number || srcData.commercialRegNo || srcData.commercial_registration_no || null;
  const commercialRegistration = srcData.commercial_registration_date || srcData.CommercialRegistrationDate || null;
  const entityType = srcData.entity_type || srcData.entityType || null;
  const city = srcData.city || srcData.address || null;

  const joiningDateFormatted = new Date(creationTime).toLocaleDateString(
    lang === "ar" ? "ar-EG" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const commercialRegistrationDate = commercialRegistration ? new Date(
    commercialRegistration
  ).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : null;

  const base = getAppBaseUrl();

  return (
    <section className="sm:py-2 md:py-3 lg:py-5 animate-fade-in-up">
      <div className="rounded-[32px] bg-white shadow-custom border border-gray-100 p-6 md:p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">{t("profile.userData") || "البيانات الشخصية"}</h3>
                <p className="text-gray-400 text-sm">{t("profile.userDataDesc") || "إدارة معلوماتك الأساسية وإعدادات الحساب"}</p>
              </div>
            </div>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 bg-gray-50 hover:bg-primary/10 text-gray-600 hover:text-primary px-5 py-2.5 rounded-2xl font-bold transition-all border border-gray-100 hover:border-primary/20"
            >
              <Edit className="w-4 h-4" />
              {t("profile.editData") || "تعديل البيانات"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Avatar Section */}
            <div className="lg:col-span-3 flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] overflow-hidden border-4 border-white shadow-xl bg-gray-50 flex items-center justify-center">
                  <img
                    src={
                      srcData.profile_picture_url
                        ? `${base}${srcData.profile_picture_url}`
                        : srcData.profilePictureUrl
                        ? `${base}/${String(srcData.profilePictureUrl).replace(/^\//, "")}`
                        : "/vite.png"
                    }
                    alt=""
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit className="text-white w-8 h-8" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-secondary rounded-2xl flex items-center justify-center shadow-lg border-2 border-white">
                  <ShieldCheck className="w-5 h-5 text-black" />
                </div>
              </div>
              <div className="mt-4 text-center">
                <h4 className="font-black text-gray-900 text-lg">{fullName}</h4>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("navSeeker.serviceSeeker") || "Service Seeker"}</span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="lg:col-span-9">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InfoItem label={t("userData.email")} value={email} icon={<Mail className="w-4 h-4" />} />
                <InfoItem label={t("userData.phone")} value={phoneNumber} icon={<Phone className="w-4 h-4" />} />
                <InfoItem label={t("userData.registrationDate")} value={joiningDateFormatted} icon={<User className="w-4 h-4" />} />
                {commercialRegistrationNumber && (
                  <InfoItem label={t("userData.commercialNumber")} value={commercialRegistrationNumber} icon={<FileText className="w-4 h-4" />} />
                )}
                {commercialRegistrationDate && (
                  <InfoItem label={t("userData.commercialDate")} value={commercialRegistrationDate} icon={<Calendar className="w-4 h-4" />} />
                )}
                {entityType && (
                  <InfoItem label={t("userData.entityType")} value={lang === "ar" ? (entityType.name_ar || entityType.nameAr) : (entityType.name_en || entityType.nameEn)} icon={<Building className="w-4 h-4" />} />
                )}
                {city && (
                  <InfoItem label={t("userData.workRegion")} value={lang === "ar" ? (city.name_ar || city.nameAr) : (city.name_en || city.nameEn)} icon={<MapPin className="w-4 h-4" />} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const InfoItem = ({ label, value, icon }) => (
  <div className="flex flex-col gap-1 group">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all group-hover:text-primary">
      {icon}
      {label}
    </span>
    <div className="px-4 py-3 bg-gray-50/50 rounded-2xl border border-gray-100 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
      <span className="font-bold text-gray-800">{value}</span>
    </div>
  </div>
);

export default UserData;
