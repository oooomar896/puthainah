import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { FaStar } from "react-icons/fa";
import toast from "react-hot-toast";
import { useCreateRatingMutation } from "../../../redux/api/ratingsApi";
import { useTranslation } from "react-i18next";

export default function AddReviewModal({ open, setOpen, orderId, refetch }) {
  const { t } = useTranslation();

  const [review, setReview] = useState({ orderRating: 0, ratingNotes: "" });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [CreateRating, { isLoading }] = useCreateRatingMutation(); // ✅ هنا جبت isLoading

  const handleStarClick = (orderRating) => {
    setReview((prev) => ({ ...prev, orderRating }));
  };

  const handleStarHover = (star) => {
    setHoveredStar(star);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const handleRatingNotesChange = (e) => {
    setReview((prev) => ({ ...prev, ratingNotes: e.target.value }));
  };

  const handleSubmitReview = async () => {
    try {
      await CreateRating({
        orderId,
        ...review,
      }).unwrap();
      toast.success(t("review.review_success"));
      setOpen(false);
      setReview({ orderRating: 0, ratingNotes: "" });
      refetch();
    } catch (error) {
      toast.error(
        error?.data?.message || t("review.review_error") || "حدث خطأ أثناء إضافة التقييم"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-50"
      style={{ direction: "rtl" }}
    >
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel className="relative sm:w-[370px] w-full py-7 px-6 transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8">
            <div className="bg-white h-full flex flex-col justify-between items-center gap-6">
              {/* قسم النجوم */}
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={24}
                    className={`cursor-pointer transition-colors duration-200 ${
                      star <= (hoveredStar || review.orderRating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                  />
                ))}
              </div>

              {/* كتابة التقييم */}
              <textarea
                placeholder={t("review.write_review_placeholder")}
                className="w-full h-24 p-2 border rounded-lg"
                value={review.ratingNotes}
                onChange={handleRatingNotesChange}
              />

              {/* الأزرار */}
              <div className="w-full flex flex-col gap-4">
                <button
                  onClick={handleSubmitReview}
                  disabled={isLoading} // ✅ يمنع الضغط لو لسه بيحمل
                  className={`bg-primary shadow-btn rounded-xl h-[50px] w-full text-white flex items-center justify-center ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <span className="loader border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
                  ) : (
                    t("review.submit")
                  )}
                </button>

                <button
                  onClick={() => {
                    setOpen(false);
                    setReview({ orderRating: 0, ratingNotes: "" });
                  }}
                  className="bg-[#F3F6F5] shadow-btn rounded-xl h-[50px] w-full"
                >
                  {t("review.back")}
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
