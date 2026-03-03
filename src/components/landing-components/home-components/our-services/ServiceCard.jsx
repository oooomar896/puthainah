import Link from "next/link";
import { ServiceIcon } from "@/constants/servicesData";

const ServiceCard = ({ icon, title, description, index, isActive, color }) => {
  return (
    <div
      title={description}
      className="relative rounded-[32px] bg-white border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group p-6 sm:p-8 flex flex-col gap-6"
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-black text-gray-200 group-hover:text-primary/20 transition-colors uppercase tracking-widest">{String(index).padStart(2, '0')}</span>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color || '#0071FF' }}></div>
      </div>

      <div className="flex items-center gap-4">
        <ServiceIcon icon={icon} color={color} size={32} />
        <div className="flex flex-col">
          {isActive === false ? (
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">غير متاح حالياً</span>
          ) : (
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">متاح الآن</span>
          )}
          <h3 className="font-black text-xl text-gray-800 leading-tight">{title}</h3>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 font-medium">
          {description}
        </p>
      </div>

      <div className="flex justify-end">
        <Link href="/request-service" className="btn btn-primary">
          اطلب الخدمة
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
