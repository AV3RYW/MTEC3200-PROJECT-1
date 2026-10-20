"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ACTIVE_ALARM_UPDATED_EVENT,
  HANDLED_ALARM_STORAGE_KEY,
  ALARM_UPDATED_EVENT,
  type AlarmSettings,
  readAlarmSettings,
  readActiveAlarm,
  saveActiveAlarm,
} from "@/lib/alarm";

function getAlarmDueThisMinute(
  alarm: AlarmSettings,
  now: Date,
): Date | null {
  if (!alarm.enabled) return null;

  const [hours, minutes] = alarm.time.split(":").map(Number);
  const scheduledAt = new Date(now);
  scheduledAt.setHours(hours, minutes, 0, 0);

  const withinAlarmMinute =
    now.getTime() >= scheduledAt.getTime() &&
    now.getTime() - scheduledAt.getTime() < 60_000;
  const repeatDayMatches =
    alarm.repeatDays.length === 0 ||
    alarm.repeatDays.includes(scheduledAt.getDay());

  return withinAlarmMinute && repeatDayMatches ? scheduledAt : null;
}

export default function AlarmController() {
  const pathname = usePathname();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAlarm = () => {
      try {
        const activeAlarm = readActiveAlarm();
        if (activeAlarm) {
          setError("");
          if (pathname !== "/alarm") router.push("/alarm");
          return;
        }

        const settings = readAlarmSettings();
        if (!settings) return;

        const now = new Date();
        const scheduledAt = getAlarmDueThisMinute(settings, now);
        if (!scheduledAt) return;

        const scheduledFor = scheduledAt.toISOString();
        const handledAlarm = window.localStorage.getItem(
          HANDLED_ALARM_STORAGE_KEY,
        );
        if (handledAlarm === scheduledFor) return;

        const alarmToStart = {
          scheduledFor,
          time: settings.time,
          difficulty: settings.difficulty,
        };

        window.localStorage.setItem(
          HANDLED_ALARM_STORAGE_KEY,
          scheduledFor,
        );
        if (settings.repeatDays.length === 0) {
          window.localStorage.setItem(
            "puzzle-alarm-settings",
            JSON.stringify({ ...settings, enabled: false }),
          );
          window.dispatchEvent(new Event(ALARM_UPDATED_EVENT));
        }

        saveActiveAlarm(alarmToStart);
        setError("");
        if (pathname !== "/alarm") router.push("/alarm");
      } catch {
        setError(
          "Alarm monitoring is unavailable because this browser could not access saved alarm settings.",
        );
      }
    };

    checkAlarm();
    const intervalId = window.setInterval(checkAlarm, 1000);
    window.addEventListener("storage", checkAlarm);
    window.addEventListener(ALARM_UPDATED_EVENT, checkAlarm);
    window.addEventListener(ACTIVE_ALARM_UPDATED_EVENT, checkAlarm);
    window.addEventListener("focus", checkAlarm);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", checkAlarm);
      window.removeEventListener(ALARM_UPDATED_EVENT, checkAlarm);
      window.removeEventListener(ACTIVE_ALARM_UPDATED_EVENT, checkAlarm);
      window.removeEventListener("focus", checkAlarm);
    };
  }, [pathname, router]);

  if (!error) return null;

  return (
    <p
      role="alert"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-2xl border border-rose-300 bg-rose-950 px-4 py-3 text-sm text-white shadow-lg"
    >
      {error}
    </p>
  );
}
