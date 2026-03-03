import { useContext, useEffect, useRef, useState } from "react";
import CustomDataTable from "../../shared/datatable/DataTable";
import OptimizedImage from "@/components/shared/OptimizedImage";
import { getServiceIcon } from "@/utils/serviceIcon";
import { supabase } from "@/lib/supabaseClient";
import UpdatePriceModal from "./UpdatePriceModal";
import { useTranslation } from "react-i18next";
import { Edit, PlusIcon, Trash } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import Link from "next/link";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";

import { formatCurrency } from "@/utils/currency";

const ServicesTable = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const tr = (key, fallback) => {
    const v = t(key);
    return v === key ? fallback : v;
  };

  const [isLoading, setIsLoading] = useState(true);

  const [service, setService] = useState("");
  const [openPriceModal, setOpenPriceModal] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const seedAttemptedRef = useRef(false);

  const handleUpdatePrice = async (newPrice) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("services")
        .update({ price: newPrice, updated_at: new Date().toISOString() })
        .eq("id", service.id);
      if (error) throw error;
      toast.success(t("services.updatePriceSuccess") || "تم تحديث السعر");
      await refetch();
    } catch (err) {
      toast.error(
        err?.message || t("services.updatePriceError") || "فشل تحديث السعر"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [localData, setLocalData] = useState([]);

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const refetch = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      setLocalData(data || []);
    } catch (err) {
      toast.error(
        err?.message || tr("services.fetchError", "فشل جلب الخدمات")
      );
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && !seeding && !seedAttemptedRef.current) {
      if (Array.isArray(localData) && localData.length === 0) {
        seedAttemptedRef.current = true;
        seedDemo();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localData]);

  const handleEdit = (service) => {
    setService(service);
    setOpenPriceModal(true);
  };
  
  const seedDemo = async () => {
    try {
      setSeeding(true);
      const { data: existing, error } = await supabase
        .from("services")
        .select("id,name_en")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      const names = new Set((existing || []).map((r) => (r?.name_en || "").toLowerCase()));
      const demo = [
        { name_ar: "خدمة التصميم الهندسي", name_en: "Engineering Design", price: 2500, image_url: null, is_active: true },
        { name_ar: "إدارة المشاريع", name_en: "Project Management", price: 0, image_url: null, is_active: true },
        { name_ar: "استشارات تقنية", name_en: "Technical Consulting", price: 1200, image_url: null, is_active: true },
        { name_ar: "تحليل الأعمال", name_en: "Business Analysis", price: 1500, image_url: null, is_active: true },
        { name_ar: "اختبار وضمان الجودة", name_en: "QA & Testing", price: 800, image_url: null, is_active: true },
      ].filter((s) => !names.has((s.name_en || "").toLowerCase()));
      for (const s of demo) {
        const { error: insError } = await supabase
          .from("services")
          .insert({ ...s });
        if (insError) throw insError;
      }
      toast.success(tr("services.seedSuccess", "تم إضافة بيانات تجريبية"));
      await refetch();
    } catch (e) {
      toast.error(e?.message || tr("services.seedError", "فشل إضافة البيانات التجريبية"));
    } finally {
      setSeeding(false);
    }
  };

  const askToDelete = (id) => {
    setSelectedId(id);
    setOpenDelete(true);
  };

  const onDelete = async () => {
    if (!selectedId) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", selectedId);
      if (error) throw error;
      toast.success(t("services.deleteSuccess") || "تم حذف الخدمة بنجاح");
      setOpenDelete(false);
      setSelectedId(null);
      await refetch();
    } catch (err) {
      toast.error(
        err?.data?.message || tr("services.deleteError", "فشل حذف الخدمة")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (service) => {
    const updatedServices = localData?.map((s) =>
      s.id === service.id ? { ...s, is_active: !s.is_active } : s
    );
    setLocalData(updatedServices);

    try {
      const next = !service.is_active;
      const { error } = await supabase
        .from("services")
        .update({ is_active: next, updated_at: new Date().toISOString() })
        .eq("id", service.id);
      if (error) throw error;
    } catch (err) {
      toast.error(
        err?.data?.message || tr("services.statusChangeError", "فشل تغيير الحالة")
      );

      // Rollback if API fails
      const rollbackServices = localData?.map((s) =>
        s.id === service.id ? { ...s, is_active: service.is_active } : s
      );
      setLocalData(rollbackServices);
    }
  };

  const columns = [
    {
      name: t("services.image") || "الصورة",
      cell: (row) => {
        const src = row?.image_url || row?.imageUrl || "";
        const fb = getServiceIcon(row?.name_en || row?.name_ar || "", "");
        return (
          <div className="w-12 h-12 rounded overflow-hidden border bg-gray-50">
            {src ? (
              <OptimizedImage
                src={src}
                alt={row?.name_en || row?.name_ar || "service"}
                width={48}
                height={48}
                quality={80}
                className="w-full h-full object-cover"
                fallbackSrc={fb}
              />
            ) : (
              <OptimizedImage
                src={fb}
                alt={row?.name_en || row?.name_ar || "service"}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        );
      },
      ignoreRowClick: true,
      button: true,
      width: "80px",
    },
    {
      name: t("services.serviceTitle"),
      selector: (row) => (lang === "ar" ? row?.name_ar : row?.name_en) || "-",
      wrap: true,
    },
    {
      name: t("services.price"),
      selector: (row) => formatCurrency(row?.price, lang),
      wrap: true,
      sortable: true,
    },
    {
      name: t("services.status"),
      cell: (row) => (
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={!!row?.is_active}
            onChange={() => handleToggleStatus(row)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 relative transition-colors">
            <div
              className={`absolute top-1 ${
                row?.is_active ? "left-1" : "right-1"
              } w-4 h-4 bg-white rounded-full transition-all peer-checked:left-6`}
            />
          </div>
        </label>
      ),
      ignoreRowClick: true,
      button: true,
    },
    {
      name: t("services.actions") || "الإجراءات",
      cell: (row) => (
        <div className="flex gap-2">
          <Link
            href={`/admin/services/${row.id}/edit`}
            className="btn btn-blue px-2 py-1 text-xs"
            title={t("services.editService") || "تعديل الخدمة"}
          >
            <Edit className="w-4 h-4" />
          </Link>
          {row?.price && (
            <button
              onClick={() => handleEdit(row)}
              className="btn btn-yellow px-2 py-1 text-xs"
              title={t("services.editPrice") || "تعديل السعر"}
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => askToDelete(row.id)}
            className="btn btn-danger px-2 py-1 text-xs font-medium"
            title={t("services.delete") || "حذف"}
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  return (
    <>
      <div className="py-5">
        <div className="mx-2">
          <div className="rounded-3xl bg-white p-5">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-700">
                {tr("services.title", "الخدمات")}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={seedDemo}
                  disabled={seeding}
                  className="btn btn-gray text-sm md:text-base"
                  title={tr("services.addDemoData", "إضافة بيانات تجريبية")}
                >
                  {seeding ? tr("services.seeding", "جاري الإضافة...") : tr("services.addDemoData", "إضافة بيانات تجريبية")}
                </button>
                <Link
                  href="/admin/add-service"
                  className="btn btn-primary text-sm md:text-base"
                >
                  <PlusIcon className="w-4 h-4" />{" "}
                  {tr("services.addService", "إضافة خدمة")}
                </Link>
              </div>
            </div>
            <UpdatePriceModal
              open={openPriceModal}
              setOpen={setOpenPriceModal}
              onSubmit={handleUpdatePrice}
              refetch={refetch}
            />
            <CustomDataTable
              columns={columns}
              data={localData}
              searchableFields={["name_ar", "price", "name_en"]}
              searchPlaceholder={tr("searchPlaceholder", "ابحث...")}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      <ModalDelete
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSelectedId(null);
        }}
        onConfirm={onDelete}
        loading={isDeleting}
      />
    </>
  );
};

export default ServicesTable;
