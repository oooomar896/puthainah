"use client";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { tr as trHelper } from "@/utils/tr";
import { useCreateTicketsMutation } from "@/redux/api/ticketApi";
import toast from "react-hot-toast";

export default function AdminPaymentTicketModal({ open, onClose, userId, relatedOrderId, presetTitle }) {
  const { t } = useTranslation();
  const tr = (k, f) => trHelper(t, k, f);
  const [createTicket, { isLoading }] = useCreateTicketsMutation();

  const validationSchema = Yup.object({
    title: Yup.string().required(tr("ticket.errors.titleRequired", "العنوان مطلوب")),
    description: Yup.string().required(tr("ticket.errors.descriptionRequired", "الوصف مطلوب")),
  });

  const initialTitle = presetTitle || tr("payments.chatTitle", "محادثة بخصوص الدفع");

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await createTicket({
        userId,
        relatedOrderId,
        title: values.title,
        description: values.description,
        statusId: 1,
      }).unwrap();
      toast.success(tr("ticket.success", "تم إرسال التذكرة"));
      resetForm();
      onClose();
    } catch {
      toast.error(t("tickets.failedToCreate"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[5000]">
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-right shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">{tr("payments.openChat", "فتح محادثة")}</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl">
                <span className="text-2xl text-gray-400">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <Formik initialValues={{ title: initialTitle, description: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">{tr("ticket.form.title", "عنوان المحادثة")}</label>
                      <Field name="title" className="w-full px-4 py-3 bg-gray-50 border rounded-xl" />
                      <ErrorMessage name="title" component="div" className="text-red-500 text-xs font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">{tr("ticket.form.description", "التفاصيل")}</label>
                      <Field as="textarea" name="description" rows={4} className="w-full px-4 py-3 bg-gray-50 border rounded-xl resize-none" />
                      <ErrorMessage name="description" component="div" className="text-red-500 text-xs font-bold" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border bg-white text-gray-700">
                        {tr("profile.cancel", "عودة")}
                      </button>
                      <button type="submit" disabled={isSubmitting || isLoading} className="px-6 py-2 rounded-xl bg-primary text-white font-black">
                        {tr("payments.sendMessage", "إرسال")}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

