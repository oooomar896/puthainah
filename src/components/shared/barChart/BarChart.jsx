import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const BarchartStats = ({ data }) => {
  const totalUsers = data[0]?.number ?? 1; // أول عنصر هو المستخدمين
  const filteredData = data.slice(1); // نسيب أول واحد

  const chartData = filteredData.map((item) => ({
    name: item.title,
    value: item.number,
  }));

  // إضافة تدرج لوني للأعمدة
  // const gradientOffset = () => {
  //   const dataMax = Math.max(...chartData.map((i) => i.value));
  //   const dataMin = Math.min(...chartData.map((i) => i.value));
  //   if (dataMax <= 0) {
  //     return 0;
  //   }
  //   if (dataMin >= 0) {
  //     return 1;
  //   }
  //   return dataMax / (dataMax - dataMin);
  // };

  // const off = gradientOffset();

  return (
    <div className="w-full flex items-center justify-center p-4 basis-full lg:basis-2/3">
      <div className="w-full">
        <ResponsiveContainer height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1967AE" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#1967AE" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            {/* خطوط الشبكة أخف */}
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />

            {/* المحور الأفقي مع تدوير النصوص لو طويلة */}
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#555", dy: 80 }} // ⬅️ هنا الإضافة المهمة
              interval={0}
              angle={-50}
              textAnchor="end"
              height={60}
            />

            {/* المحور الرأسي مع خط أخف */}
            <YAxis
              domain={[0, totalUsers]}
              tick={{
                fontSize: 12,
                fill: "#555",
                dx: -50, // ⬅️ تزحزح الرقم لليسار
              }}
              axisLine={false}
              tickLine={false}
            />

            {/* Tooltip بتصميم أوضح */}
            <Tooltip
              cursor={{ fill: "rgba(25, 103, 174, 0.1)" }}
              contentStyle={{ borderRadius: "8px", borderColor: "#1967AE" }}
              formatter={(value) => [value, "عدد"]}
            />

            {/* الأعمدة مع تدرج لوني وزوايا مدورة */}
            <Bar
              dataKey="value"
              fill="url(#colorUv)"
              radius={[8, 8, 0, 0]}
              barSize={40}
            >
              {/* عرض قيمة كل عمود فوقه */}
              <LabelList
                dataKey="value"
                position="top"
                fill="#1967AE"
                fontWeight="bold"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarchartStats;
