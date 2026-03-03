import { useCountdown } from "../../../hooks/useCountdown";

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    s
  ).padStart(2, "0")}`;
}

const FiveHoursTimer = ({
  startISO,
  durationHours = 5,
  //   timeZone = "Africa/Cairo",
}) => {
  // لو عايز تجبر العرض يبقى بتوقيت مصر بالضبط:
  // const start = dayjs.tz(startISO, timeZone);
  // const startISOFixed = start.toISOString();
  // const remainingMs = useCountdown(startISOFixed, durationHours);

  const remainingMs = useCountdown(startISO, durationHours);

  const isFinished = remainingMs === 0;
  const isNearEnd = remainingMs <= 5 * 60 * 1000; // آخر 5 دقايق يرنّ

  if (!startISO) return null;

  return (
    <div className="flex flex-col items-center justify-center">
      {!isFinished ? (
        <div
          className={`text-3xl md:text-xl font-bold px-6 py-1 rounded-xl border
          ${
            isNearEnd
              ? "border-red-500 text-red-600 bg-red-50 blink"
              : "border-primary text-primary bg-primary/5"
          }`}
        >
          {formatTime(remainingMs)}
        </div>
      ) : (
        ""
      )}

      {/* لو عايز تعرض وقت النهاية المحسوب */}
      {/* <div className="text-xs text-gray-500 mt-2">
        ينتهي عند: {dayjs(startISO).add(durationHours, "hour").format("YYYY-MM-DD HH:mm:ss")}
      </div> */}
    </div>
  );
};

export default FiveHoursTimer;
export { FiveHoursTimer };
