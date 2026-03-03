import React, { useEffect } from "react";
import HeadTitle from "../../../components/shared/head-title/HeadTitle";
import OrdersTable from "../../../components/provider-components/active-orders/OrdersTable";
import { useTranslation } from "react-i18next";

const ActiveOrders = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <title>{t("activeOrders.title") || "الطلبات المتاحة"}</title>
      <meta name="description" content={t("activeOrders.description") || "عرض وإدارة الطلبات المتاحة للقبول أو الرفض"} />

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="mb-8">
          <HeadTitle
            title={t("activeOrders.title") || "الطلبات المتاحة"}
          />
          <p className="text-gray-500 mt-3 text-base">
            {t("activeOrders.description") || "قائمة الطلبات المعينة لك من قبل الإدارة. يمكنك قبول أو رفض الطلبات حسب توفرك."}
          </p>
        </div>

        <OrdersTable />
      </div>
    </div>
  );
};

export default ActiveOrders;
