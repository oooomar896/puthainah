import React from "react";

const DashboardInfo = ({ stats, title }) => {
  return (
    <div>
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats?.map((item, i) => (
          <div
            key={i}
            className="group relative p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {item?.title}
                </p>
                <h4 className="text-2xl font-black text-gray-800">
                  {item?.number}
                </h4>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500"
                style={{ backgroundColor: `${item?.color}20`, color: item?.color }}
              >
                {item?.ic ? React.cloneElement(item?.icon, { size: 24, strokeWidth: 2.5 }) : (
                  <img
                    src={typeof item?.icon === "string" ? item.icon : (item?.icon?.src || "")}
                    alt={item?.title || "icon"}
                    className="w-6 h-6 object-contain"
                  />
                )}
              </div>
            </div>

            <div
              className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-500 rounded-full"
              style={{ width: '0%', backgroundColor: item?.color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardInfo;
