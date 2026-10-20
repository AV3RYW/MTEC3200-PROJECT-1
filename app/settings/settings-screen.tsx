"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  ALARM_UPDATED_EVENT,
  type AlarmSettings,
  type PuzzleDifficulty,
  readAlarmSettings,
  saveAlarmSettings,
} from "@/lib/alarm";

const repeatDayOptions = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const difficultyOptions: {
  value: PuzzleDifficulty;
  title: string;
  description: string;
}[] = [
  { value: "easy", title: "Easy", description: "A gentle start" },
  { value: "medium", title: "Medium", description: "A little thinking" },
  { value: "hard", title: "Hard", description: "A bigger challenge" },
];

const initialAlarm: AlarmSettings = {
  time: "07:00",
  repeatDays: [],
  difficulty: "medium",
  enabled: true,
};

export default function SettingsScreen() {
  const [alarm, setAlarm] = useState<AlarmSettings>(initialAlarm);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      try {
        const savedAlarm = readAlarmSettings();
        if (savedAlarm) {
          setAlarm(savedAlarm);
          setIsSaved(true);
        }
      } catch {
        setLoadError(
          "Saved alarm settings could not be loaded. Your browser storage may be unavailable or the saved data may be invalid.",
        );
      } finally {
        setIsLoading(false);
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  function toggleRepeatDay(day: number) {
    setAlarm((currentAlarm) => ({
      ...currentAlarm,
      repeatDays: currentAlarm.repeatDays.includes(day)
        ? currentAlarm.repeatDays.filter((selectedDay) => selectedDay !== day)
        : [...currentAlarm.repeatDays, day].sort((a, b) => a - b),
    }));
    setSaveMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError("");
    setSaveMessage("");

    try {
      saveAlarmSettings(alarm);
      setIsSaved(true);
      setSaveMessage("Your alarm settings are saved on this device.");
      window.dispatchEvent(new Event(ALARM_UPDATED_EVENT));
    } catch {
      setSaveError(
        "Your alarm could not be saved. Check that browser storage is available, then try again.",
      );
    }
  }

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 text-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 -z-10 size-96 rounded-full bg-orange-300/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -right-24 -z-10 size-[30rem] rounded-full bg-rose-300/30 blur-3xl"
      />

      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5 sm:px-8 sm:py-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-3 rounded-full pr-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
        >
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white shadow-sm"
          >
            p
          </span>
          <span className="text-sm font-semibold tracking-[0.16em]">
            PUZZLE ALARM
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border border-slate-900/15 bg-white/40 px-4 text-sm font-medium backdrop-blur transition hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
        >
          Back to clock
        </Link>
      </header>

      <section className="mx-auto w-full max-w-3xl px-5 pb-12 sm:px-8 sm:pb-16">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
            Make it yours
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
            Alarm settings
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-700 sm:text-base">
            Choose when your alarm rings and the kind of puzzle that starts your
            morning.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-sm backdrop-blur-md sm:p-8"
        >
          {loadError && (
            <p
              role="alert"
              className="rounded-2xl border border-rose-900/15 bg-rose-100/80 px-4 py-3 text-sm leading-6 text-rose-950"
            >
              {loadError}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="alarm-time" className="text-sm font-semibold">
              Alarm time
            </label>
            <input
              id="alarm-time"
              name="time"
              type="time"
              required
              value={alarm.time}
              onChange={(event) => {
                setAlarm({ ...alarm, time: event.target.value });
                setSaveMessage("");
              }}
              className="min-h-14 w-full rounded-2xl border border-slate-900/15 bg-white/80 px-4 text-2xl tabular-nums shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 sm:w-64"
            />
            <p className="text-sm leading-5 text-slate-600">
              Uses your device&apos;s local time.
            </p>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold">Repeat</legend>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Select days to repeat. Leave all days unselected for a one-time
              alarm.
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {repeatDayOptions.map((day) => {
                const selected = alarm.repeatDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleRepeatDay(day.value)}
                    className={`min-h-12 rounded-2xl border text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                      selected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-900/15 bg-white/75 text-slate-800 hover:bg-white"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold">Puzzle difficulty</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {difficultyOptions.map((option) => {
                const selected = alarm.difficulty === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex min-h-20 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-slate-900 ${
                      selected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-900/15 bg-white/75 hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={option.value}
                      checked={selected}
                      onChange={() => {
                        setAlarm({ ...alarm, difficulty: option.value });
                        setSaveMessage("");
                      }}
                      className="size-4 accent-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                    />
                    <span>
                      <span className="block text-sm font-semibold">
                        {option.title}
                      </span>
                      <span
                        className={`mt-0.5 block text-xs ${selected ? "text-white/70" : "text-slate-600"}`}
                      >
                        {option.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-900/10 bg-white/55 px-4 py-4">
            <div>
              <label htmlFor="alarm-enabled" className="text-sm font-semibold">
                Alarm enabled
              </label>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                {alarm.enabled ? "Your alarm is on." : "Your alarm is off."}
              </p>
            </div>
            <input
              id="alarm-enabled"
              name="enabled"
              type="checkbox"
              role="switch"
              checked={alarm.enabled}
              onChange={(event) => {
                setAlarm({ ...alarm, enabled: event.target.checked });
                setSaveMessage("");
              }}
              className="size-6 shrink-0 cursor-pointer accent-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
            />
          </div>

          <aside className="rounded-2xl border border-amber-900/10 bg-amber-100/70 px-4 py-4">
            <p className="text-sm font-semibold">A note about web alarms</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              Keep this app open and your device available. The alarm may not
              ring if the browser is closed, the device is asleep, or background
              activity is restricted.
            </p>
          </aside>

          {saveError && (
            <p role="alert" className="text-sm font-medium text-rose-900">
              {saveError}
            </p>
          )}
          {saveMessage && (
            <p role="status" className="text-sm font-medium text-emerald-900">
              {saveMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || Boolean(loadError)}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSaved ? "Save changes" : "Save alarm"}
          </button>
        </form>
      </section>
    </main>
  );
}
