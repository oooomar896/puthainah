import React from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useCreateTicketsMutation } from "../../../redux/api/ticketApi";
import { useSelector } from "react-redux";

export default function TicketModal({ open, setOpen, refetch }) {
  const { t } = useTranslation();
  const handleClose = () => setOpen(false);
  const [createTickets, { isLoading: loadingCreateTickets }] =
    useCreateTicketsMutation();
  const userId = useSelector((state) => state.auth.userId);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await createTickets({ ...values, userId }).unwrap();
      toast.success(t("ticket.success"));
      resetForm();
      handleClose();
      refetch();
    } catch (error) {
      toast.error(
        error?.data?.message || t("ticket.error") || "حدث خطأ أثناء إرسال التذكرة"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required(t("ticket.errors.titleRequired")),
    description: Yup.string().required(t("ticket.errors.descriptionRequired")),
  });

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel className="relative w-full sm:w-[400px] py-7 px-6 transform overflow-hidden rounded-lg bg-white text-right shadow-xl transition-all sm:my-8">
            <h2 className="text-lg font-bold mb-4 text-primary">
              {t("ticket.title")}
            </h2>

            <Formik
              initialValues={{ title: "", description: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col gap-4">
                  {/* عنوان الشكوى */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      {t("ticket.form.title")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                      placeholder={t("ticket.form.titlePlaceholder")}
                    />
                    <ErrorMessage
                      name="title"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* وصف الشكوى */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      {t("ticket.form.description")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl resize-none"
                      placeholder={t("ticket.form.descriptionPlaceholder")}
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* الأزرار */}
                  <div className="flex items-center justify-between gap-4 mt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting || loadingCreateTickets}
                      className="bg-primary text-white shadow-btn rounded-xl h-[50px] w-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting || loadingCreateTickets
                        ? t("ticket.sending")
                        : t("ticket.submit")}
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loadingCreateTickets}
                      className="bg-[#F3F6F5] shadow-btn rounded-xl h-[50px] w-full font-semibold disabled:opacity-50"
                    >
                      {t("ticket.cancel")}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
