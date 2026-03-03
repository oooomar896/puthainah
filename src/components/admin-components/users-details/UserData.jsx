import React, { useContext } from "react";
import active from "@/assets/icons/active.svg";
import block from "@/assets/icons/block.svg";
import { useToggleBlockUserMutation } from "../../../redux/api/authApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { getAppBaseUrl } from "../../../utils/env";


const UserData = ({ data, refetch }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);


  const {
    name: fullName,
    email,
    phoneNumber,
    creationTime: joiningDate,
    commercialRegistrationDate,
    commercialRegistrationNumber,
    profileStatus,
    entityType,
    city,
  } = data;

  const joiningDateFormatted = new Date(joiningDate).toLocaleDateString(
    "ar-EG",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const registrationDateFormatted = new Date(
    commercialRegistrationDate
  ).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [toggleBlockUser, { isLoading }] = useToggleBlockUserMutation();
  const handleToggleBlock = async () => {
    try {
      const userId = data?.user?.id;
      const currentlyBlocked = !!data?.user?.is_blocked;
      await toggleBlockUser({ userId, isBlocked: !currentlyBlocked }).unwrap();
      toast.success(!currentlyBlocked ? (t("user.user_blocked_success")) : (t("user.user_activated_success")));
      refetch();
    } catch (error) {
      toast.error(
        error?.data?.message || t("user.toggleError") || "حدث خطأ أثناء تغيير حالة المستخدم"
      );
    }
  };
  const base = getAppBaseUrl();

  return (
    <section className="py-5">
      <div className="rounded-2xl bg-white shadow-sm p-6 ">
        <div className="flex justify-between flex-col lg:flex-row gap-5">
          <div className="shrink-0 w-[200px] profile h-[200px] bg-gray-100 border border-gray-200 rounded-xl col-span-1 overflow-hidden">
            <img
              src={`${base}${data?.profilePictureUrl}`}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col lg:flex-row justify-between gap-3 col-span-4">
            {/* البيانات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">
                  {t("user.name")}:
                </span>
                <span>{fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">
                  {t("user.email")}:
                </span>
                <span>{email || data?.user?.email || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">
                  {t("user.phone_number")}:
                </span>
                <span>{phoneNumber || data?.user?.phone || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">
                  {t("user.registration_date")}:
                </span>
                <span>{joiningDateFormatted}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">
                  {t("user.commercial_registration")}:
                </span>
                <span>{commercialRegistrationNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">
                  {t("user.commercial_registration_confirmation_date")}:
                </span>
                <span>{registrationDateFormatted}</span>
              </div>
              {data?.user?.role && (
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">
                    {t("user.role") || "الدور"}:
                  </span>
                  <span>{data.user.role}</span>
                </div>
              )}
              {entityType?.nameAr ||
                (entityType?.nameEn && (
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">
                      {t("user.entity_type")}:
                    </span>
                    <span>
                      {lang === "ar" ? entityType?.nameAr : entityType?.nameEn}
                    </span>
                  </div>
                ))}
              {city?.nameAr ||
                (city?.nameEn && (
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">
                      {t("user.city")}:
                    </span>
                    <span>{lang === "ar" ? city?.nameAr : city?.nameEn}</span>
                  </div>
                ))}
              {profileStatus?.nameAr || profileStatus?.nameEn ? (
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">
                    {t("user.account_status") || "حالة الحساب"}:
                  </span>
                  <span>
                    {lang === "ar" ? (profileStatus?.nameAr || "-") : (profileStatus?.nameEn || "-")}
                  </span>
                </div>
              ) : null}
            </div>

            {/* الأزرار */}
            <div className="flex lg:flex-col gap-3 items-start lg:items-end">
              {profileStatus?.id === 201 ? (
                <button
                  disabled={isLoading}
                  onClick={handleToggleBlock}
                  className="flex items-center gap-2 bg-[#1A71F61F] rounded-2xl px-4 py-2"
                >
                  <span className="text-primary">{t("user.block")}</span>
                  <img src={typeof block === "string" ? block : (block?.src || "")} alt="block" className="w-4 h-4" loading="lazy" decoding="async" />
                </button>
              ) : (
                <button
                  disabled={isLoading}
                  onClick={handleToggleBlock}
                  className="flex items-center gap-2 bg-[#1A71F61F] rounded-2xl px-4 py-2"
                >
                  <span className="text-primary">{t("user.activate")}</span>
                  <img src={typeof active === "string" ? active : (active?.src || "")} alt="active" className="w-4 h-4" loading="lazy" decoding="async" />
                </button>
              )}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2">
                <span className="text-gray-700 text-sm">
                  {t("user.user_id") || "معرّف المستخدم"}:
                </span>
                <span className="text-gray-500 text-xs">{data?.user?.id || "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserData;
