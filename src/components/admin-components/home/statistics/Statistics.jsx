import React from "react";
import { usePathname } from "next/navigation";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const Statistics = ({ title, stats }) => {
  const pathname = usePathname();
  return (
    <div className="my-5 w-full basis-full lg:basis-1/3">
      <div className="container">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-5">
          {title ?? ""}
        </h2>
        <div
          className={`grid ${pathname === "/admin" || pathname === "/provider"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-1"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            } gap-4 md:gap-6`}
        >
          {stats?.length > 0 &&
            stats?.map((item, i) => {
              return (
                <div
                  key={i}
                  className="group relative overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {item?.title}
                      </p>
                      <h3 className="text-2xl font-black text-gray-800">
                        {Number(item?.number || 0).toLocaleString()}
                      </h3>
                    </div>

                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
                      style={{
                        backgroundColor: `${item?.color || '#F3F4F6'}`,
                        color: '#1F2937'
                      }}
                    >
                      {item?.ic ? (
                        React.cloneElement(item?.icon, { size: 32, strokeWidth: 2.5, className: "drop-shadow-sm" })
                      ) : (
                        <img
                          src={typeof item?.icon === "string" ? item.icon : (item?.icon?.src || "")}
                          alt={item?.title || "icon"}
                          className="w-8 h-8 object-contain filter group-hover:drop-shadow-md"
                        />
                      )}
                    </div>
                  </div>

                  {/* Subtle accent bar */}
                  <div
                    className="absolute bottom-0 left-0 h-1 transition-all duration-500 rounded-full bg-primary"
                    style={{ width: '0%', backgroundColor: item?.color || '#3b82f6' }}
                  />

                  {/* Decorative background shape */}
                  <div
                    className="absolute -right-4 -bottom-4 w-16 h-16 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 rounded-full"
                    style={{ backgroundColor: item?.color || '#3b82f6' }}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
