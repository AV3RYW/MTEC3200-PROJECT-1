"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ALARM_UPDATED_EVENT,
  type AlarmSettings,
  formatRepeatDays,
  getNextAlarmDate,
  readAlarmSettings,
} from "@/lib/alarm";

type TimeOfDay = "morning" | "day" | "evening" | "night";

const palettes: Record<
  TimeOfDay,
  { background: string; glow: string; foreground: string; card: string }
> = {
  morning: {
    background: "from-amber-100 via-orange-50 to-rose-100",
    glow: "bg-orange-300/30",
    foreground: "text-slate-900",
    card: "border-white/70 bg-white/60",
  },
  day: {
    background: "from-sky-100 via-blue-50 to-cyan-100",
    glow: "bg-sky-300/30",
    foreground: "text-slate-900",
    card: "border-white/70 bg-white/60",
  },
  evening: {
    background: "from-rose-100 via-orange-50 to-amber-100",
    glow: "bg-rose-300/30",
    foreground: "text-slate-900",
    card: "border-white/70 bg-white/60",
  },
  night: {
    background: "from-slate-950 via-indigo-950 to-slate-900",
    glow: "bg-indigo-500/20",
    foreground: "text-slate-50",
    card: "border-white/10 bg-white/5",
  },
};

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 10) return "morning";
  if (hour >= 10 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

export default function HomeScreen() {
  const [now, setNow] = useState<Date | null>(null);
  const [alarm, setAlarm] = useState<AlarmSettings | null>(null);
  const [alarmError, setAlarmError] = useState("");

  useEffect(() => {
    const updateTime = () => setNow(new Date());
    const updateAlarm = () => {
      try {
        setAlarm(readAlarmSettings());
        setAlarmError("");
      } catch {
        setAlarm(null);
        setAlarmError("Saved alarm settings could not be loaded.");
      }
    };

    updateTime();
    updateAlarm();
    const intervalId = window.setInterval(updateTime, 1000);
    window.addEventListener("storage", updateAlarm);
    window.addEventListener(ALARM_UPDATED_EVENT, updateAlarm);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", updateAlarm);
      window.removeEventListener(ALARM_UPDATED_EVENT, updateAlarm);
    };
  }, []);

  const palette = palettes[getTimeOfDay(now?.getHours() ?? 12)];
  const nextAlarmDate =
    alarm && now ? getNextAlarmDate(alarm, now) : null;
  const alarmTime = alarm
    ? new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(`2000-01-01T${alarm.time}:00`))
    : "";
  const nextAlarmDay = nextAlarmDate
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "long",
      }).format(nextAlarmDate)
    : "";
  const formattedTime = now
    ? new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(now)
    : "--:--";
  const formattedDate = now
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(now)
    : "Your local time";

  return (
    <main
      className={`relative isolate flex min-h-svh flex-col overflow-hidden bg-gradient-to-br ${palette.background} ${palette.foreground} transition-colors duration-1000`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -left-32 top-1/4 -z-10 size-96 rounded-full ${palette.glow} blur-3xl`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-48 -right-24 -z-10 size-[30rem] rounded-full ${palette.glow} blur-3xl`}
      />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-10 sm:py-8">
        <div className="flex items-center gap-3" aria-label="Puzzle Alarm home">
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white shadow-sm"
          >
            p
          </span>
          <span className="text-sm font-semibold tracking-[0.16em]">
            PUZZLE ALARM
          </span>
        </div>

        <Link
          href="/settings"
          aria-label="Alarm settings"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-current/15 bg-white/30 px-4 text-sm font-medium backdrop-blur transition hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
        >
          <svg
            aria-hidden="true"
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
            <path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z" />
          </svg>
          <span>Settings</span>
        </Link>
      </header>

      <section
        aria-label="Current time and alarm"
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-5 pb-12 text-center sm:px-10"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] opacity-65 sm:text-sm">
          Your local time
        </p>
        <time
          aria-live="off"
          aria-label={now ? `Current local time: ${formattedTime}` : "Loading local time"}
          dateTime={now?.toISOString()}
          className="whitespace-nowrap text-8xl font-light leading-none tracking-[-0.08em] tabular-nums sm:text-9xl md:text-[12rem]"
        >
          {formattedTime}
        </time>
        <p className="mt-5 text-base font-medium opacity-70 sm:text-lg">
          {formattedDate}
        </p>

        <div
          className={`mt-12 w-full max-w-sm rounded-3xl border px-6 py-5 text-left shadow-sm backdrop-blur-md sm:mt-16 ${palette.card}`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">
            Next alarm
          </p>
          {alarmError ? (
            <p role="alert" className="mt-2 text-sm leading-6">
              {alarmError}
            </p>
          ) : alarm ? (
            <>
              <p className="mt-2 text-lg font-medium">
                {alarm.enabled ? alarmTime : "Alarm is off"}
              </p>
              <p className="mt-1 text-sm leading-6 opacity-65">
                {alarm.enabled && nextAlarmDate
                  ? `${nextAlarmDay} · ${formatRepeatDays(alarm.repeatDays)}`
                  : `${alarmTime} · ${formatRepeatDays(alarm.repeatDays)}`}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] opacity-55">
                {alarm.enabled ? "Enabled" : "Disabled"}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-lg font-medium">No alarm set yet</p>
              <p className="mt-1 text-sm leading-6 opacity-65">
                Use settings to choose when your morning starts.
              </p>
            </>
          )}
        </div>

        <Link
          href="/alarm"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-current/20 bg-white/30 px-5 text-sm font-medium backdrop-blur transition hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
        >
          Open alarm page
        </Link>
      </section>

      <footer className="mx-auto w-full max-w-7xl px-5 pb-6 text-center text-xs leading-5 opacity-60 sm:px-10 sm:pb-8 sm:text-sm">
        Web alarms may not ring if your browser is closed, your device is asleep,
        or background activity is restricted.
      </footer>
    </main>
  );
}
