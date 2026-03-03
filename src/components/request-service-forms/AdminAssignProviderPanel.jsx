import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import AsyncSelect from "react-select/async";
import { useLazyGetProvidersAccountsQuery } from "@/redux/api/providersApi";
import debounce from "lodash.debounce";
import { useParams } from "next/navigation";
import { useAssignProviderToRequestMutation } from "@/redux/api/ordersApi";
import { useTranslation } from "react-i18next";
import { UserCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

const AdminAssignProviderPanel = ({ data, refetch }) => {
  const { t } = useTranslation();
  const assignedProvider = data?.assigned_provider;
  const response = data?.provider_response || 'none';

  const validationSchema = Yup.object().shape({
    providerId: Yup.string().required(t("AdminAssignProvider.providerRequired") || "اختر مزوداً"),
    providerPrice: Yup.number().typeError(t("AdminAssignProvider.priceType") || "سعر غير صحيح").required(t("AdminAssignProvider.priceRequired") || "أدخل السعر"),
  });

  const [AssignProvider] = useAssignProviderToRequestMutation();
  const { id } = useParams();

  const [triggerSearch] = useLazyGetProvidersAccountsQuery();

  const debouncedLoadProvidersOptions = debounce(async (inputValue, callback) => {
    try {
      const result = await triggerSearch({
        name: inputValue,
        AccountStatus: 201, // 201 is 'Active' status for providers
        PageNumber: 1,
        PageSize: 50
      }).unwrap();

      // Handle paginated response structure: {data: [], count: number}
      const providers = result?.data || result || [];

      const options = providers.map((provider) => ({
        value: provider.id,
        label: provider.name,
        provider: provider
      }));

      callback(options || []);
    } catch (error) {
      console.error('Error loading providers:', error);
      callback([]);
    }
  }, 500);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await AssignProvider({
        requestId: id,
        providerId: values.providerId,
        providerPrice: values.providerPrice,
      }).unwrap();
      toast.success(t("AdminAssignProvider.success") || "تم إرسال العرض للمزود بنجاح");
      refetch && refetch();
    } catch (error) {
      toast.error(error?.data?.message || t("AdminAssignProvider.error") || "حدث خطأ أثناء تعيين المزود");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            {t("AdminAssignProvider.pending") || "بانتظار الرد"}
          </span>
        );
      case 'accepted':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase tracking-wider">
            <CheckCircle className="w-3 h-3" />
            {t("AdminAssignProvider.accepted") || "تم القبول"}
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-full uppercase tracking-wider">
            <XCircle className="w-3 h-3" />
            {t("AdminAssignProvider.rejected") || "تم الرفض"}
          </span>
        );
      default:
        return null;
    }
  };

  const isPaid =
    data?.status?.code?.toLowerCase() === 'paid' ||
    data?.status?.id === 204 ||
    data?.payment_status === 'paid';

  return (
    <section className="bg-white rounded-[2rem] shadow-custom border border-gray-100 p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {t("AdminAssignProvider.title") || "تعيين مزود الخدمة"}
          </h3>
        </div>
        {getStatusBadge(response)}
      </div>

      {assignedProvider && (
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary font-bold">
              {assignedProvider.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900">{assignedProvider.name}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-gray-400 font-medium">
                  {data?.provider_quoted_price ? `${formatCurrency(data.provider_quoted_price, 'ar')} • ` : ""}
                  {t("AdminAssignProvider.assignedStatus") || "المزود المعين للعرض"}
                </span>
              </div>
            </div>
          </div>

          {response === 'rejected' && data?.provider_rejection_reason && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-[11px] text-red-800 font-medium">
                <strong>{t("AdminAssignProvider.rejectionReason") || "سبب الرفض"}:</strong> {data.provider_rejection_reason}
              </p>
            </div>
          )}
        </div>
      )}

      <Formik
        initialValues={{
          providerId: assignedProvider?.id || "",
          providerPrice: data?.provider_quoted_price || ""
        }}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="grid gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                {t("AdminAssignProvider.providerLabel") || (assignedProvider ? "تغيير المزود" : "اختيار مزود لتنفيذ العرض")}
              </label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={debouncedLoadProvidersOptions}
                onChange={(option) => setFieldValue("providerId", option?.value || "")}
                placeholder={assignedProvider ? assignedProvider.name : (t("AdminAssignProvider.providerPlaceholder") || "ابحث عن مزود باسمه...")}
                isClearable
                formatOptionLabel={(option) => (
                  <div className="flex items-center justify-between py-1">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 text-sm">{option.label}</span>
                      <span className="text-[10px] text-gray-500">
                        {option.provider?.specialization || t("common.noSpecialization") || "بدون تخصص"}
                        {" • "}
                        {option.provider?.city?.name_ar || option.provider?.city?.name_en || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                      <span className="text-[10px] font-black text-amber-600">{option.provider?.avg_rate || "0.0"}</span>
                      <svg className="w-2.5 h-2.5 text-amber-500 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                    </div>
                  </div>
                )}
                classNames={{
                  control: () => "!rounded-2xl !border-gray-200 !py-1.5 !shadow-none focus-within:!border-primary/50",
                  option: (state) => state.isFocused ? "!bg-primary/5" : ""
                }}
              />
              <ErrorMessage name="providerId" component="div" className="text-red-500 text-[10px] font-bold mt-1 px-1" />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                {t("AdminAssignProvider.priceLabel") || "سعر شراء الخدمة"}
              </label>
              <div className="relative">
                <Field
                  name="providerPrice"
                  type="number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-primary/50 transition-all outline-none"
                  placeholder={t("AdminAssignProvider.pricePlaceholder") || "أدخل السعر الذي سيصل للمزود..."}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">SAR</div>
              </div>
              <ErrorMessage name="providerPrice" component="div" className="text-red-500 text-[10px] font-bold mt-1 px-1" />
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                (values.providerId === (assignedProvider?.id || "") && values.providerPrice === (data?.provider_quoted_price || "")) ||
                !isPaid
              }
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white py-4 rounded-2xl font-black text-base transition-all duration-300 hover:scale-[1.02] shadow-2xl hover:shadow-indigo-500/50 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t("AdminAssignProvider.submitting") || "جاري المعالجة..."}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {assignedProvider ? (t("AdminAssignProvider.update") || "تحديث العرض") : (t("AdminAssignProvider.submit") || "إرسال العرض للمزود")}
                </>
              )}
            </button>
            {!isPaid && (
              <p className="text-xs text-gray-500 mt-2">{t("AdminAssignProvider.waitForPayment") || "يجب أن يكون الطلب في حالة 'مدفوع' قبل تعيين مزود الخدمة."}</p>
            )}
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default AdminAssignProviderPanel;
