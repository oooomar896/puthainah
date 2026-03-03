import { useState } from "react";
import Link from "next/link";
import CustomDataTable from "../../shared/datatable/DataTable";
import {
  useGetQuestionsQuery,
  useDeleteQuestionMutation,
} from "../../../redux/api/faqsApi";
import { Edit, PlusIcon, Trash } from "lucide-react";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";
import { useTranslation } from "react-i18next";

const FaqsTable = () => {
  const { t } = useTranslation();
  const { data: questions, isLoading, refetch } = useGetQuestionsQuery();
  const [deleteQuestion, { isLoading: isDeleting }] =
    useDeleteQuestionMutation();

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const askToDelete = (id) => {
    setSelectedId(id);
    setOpenDelete(true);
  };

  const onDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteQuestion(selectedId).unwrap();
      toast.success(t("question.deleteSuccess"));
      setOpenDelete(false);
      setSelectedId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || t("question.deleteError"));
    }
  };

  const columns = [
    {
      name: t("question.question"),
      selector: (row) => row?.question_ar || row?.question_en || "-",
      wrap: true,
      grow: 2,
    },
    {
      name: t("question.answer"),
      selector: (row) => row?.answer_ar || row?.answer_en || "-",
      wrap: true,
      grow: 3,
    },
    {
      name: t("question.actions"),
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/update-question/${row.id}`}
            className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition text-xs font-medium"
          >
            <Edit width={15} />
          </Link>
          <button
            onClick={() => askToDelete(row.id)}
            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition text-xs font-medium"
          >
            <Trash width={15} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  return (
    <>
      <div className="py-6">
        <div className="mx-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-700">
                {t("question.faqManagement")}
              </h2>
              <Link
                href="/admin/add-questions"
                className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg text-sm md:text-base font-medium hover:bg-primary/90 transition"
              >
                <PlusIcon className="w-4 h-4" /> {t("question.addQuestion")}
              </Link>
            </div>

            <CustomDataTable
              columns={columns}
              data={questions || []}
              searchableFields={["questionString", "answer"]}
              isLoading={isLoading}
              searchPlaceholder={t("searchPlaceholder")}
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

export default FaqsTable;
