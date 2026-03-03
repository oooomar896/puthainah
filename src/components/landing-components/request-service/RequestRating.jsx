"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { useCreateRatingMutation } from "@/redux/api/ratingsApi";
import toast from "react-hot-toast";

const RequestRating = ({ orderId, userId, onRated }) => {
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [createRating, { isLoading }] = useCreateRatingMutation();

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error(t("rating.selectStars") || "يرجى اختيار التقييم بالنجوم");
            return;
        }

        try {
            await createRating({
                orderId,
                ratedByUserId: userId,
                ratingValue: rating,
                comment,
            }).unwrap();
            toast.success(t("rating.success") || "شكراً لتقييمك!");
            if (onRated) onRated();
        } catch {
            toast.error(t("common.error"));
        }
    };

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-custom p-8 md:p-12 animate-fade-in-up mt-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />

            <div className="relative z-10 max-w-2xl mx-auto text-center">
                <div className="inline-flex p-3 bg-amber-100 rounded-2xl mb-6">
                    <Star className="w-8 h-8 text-amber-500 fill-current" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">{t("rating.title") || "قيم تجربتك معنا"}</h3>
                <p className="text-gray-500 font-medium mb-10">{t("rating.subtitle") || "رأيك يهمنا في تحسين جودة الخدمات المقدمة"}</p>

                <div className="flex items-center justify-center gap-2 mb-10">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="p-1 transition-transform active:scale-90"
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                className={`w-12 h-12 transition-all duration-300 ${(hover || rating) >= star
                                    ? "text-amber-400 fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] scale-110"
                                    : "text-gray-200"
                                    }`}
                                strokeWidth={1.5}
                            />
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="text-right">
                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 block">
                            {t("rating.commentLabel") || "ملاحظاتك الإضافية"}
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t("rating.commentPlaceholder") || "اكتب هنا أي ملاحظات تود مشاركتها..."}
                            className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 text-gray-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all min-h-[150px] outline-none"
                        />
                    </div>

                    <button
                        disabled={isLoading || rating === 0}
                        onClick={handleSubmit}
                        className="w-full bg-gray-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                    >
                        {isLoading ? t("common.loading") : (t("rating.submit") || "إرسال التقييم")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestRating;
