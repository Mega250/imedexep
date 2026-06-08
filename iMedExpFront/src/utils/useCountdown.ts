import { useEffect, useState } from "react";

export function useCountdown(targetIso: string | null | undefined): number {
  const target = targetIso ? new Date(targetIso).getTime() : 0;
  const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    if (!targetIso) {
      setRemaining(0);
      return;
    }
    const t = new Date(targetIso).getTime();
    setRemaining(Math.max(0, t - Date.now()));
    const id = setInterval(() => {
      const rem = Math.max(0, t - Date.now());
      setRemaining(rem);
      if (rem === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return remaining;
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return "0:00";
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
