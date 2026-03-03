import { useEffect, useState } from "react";
import dayjs from "dayjs";

export function useCountdown(startISO, durationHours = 5) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!startISO) return;

    const start = dayjs(startISO); // لو عايز تعتبره UTC: dayjs.utc(startISO).tz("Africa/Cairo")
    const end = start.add(durationHours, "hour");

    const tick = () => {
      const diff = end.diff(dayjs()); // now (local)
      setRemainingMs(Math.max(0, diff));
    };

    tick(); // أول مرة
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startISO, durationHours]);

  return remainingMs;
}

