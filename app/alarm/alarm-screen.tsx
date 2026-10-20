"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  ACTIVE_ALARM_UPDATED_EVENT,
  type ActiveAlarm,
  type AlarmResult,
  type PuzzleDifficulty,
  finishActiveAlarm,
  readActiveAlarm,
  readAlarmResult,
} from "@/lib/alarm";

const puzzles: Record<
  PuzzleDifficulty,
  {
    prompt: string;
    hint: string;
    answer: string;
    placeholder: string;
  }[]
> = {
  easy: [
    {
      prompt: "I have a face and two hands, but no arms or legs. What am I?",
      hint: "You can use me to check the time.",
      answer: "clock",
      placeholder: "Type your answer",
    },
    {
      prompt: "What has keys but no locks, and space but no room?",
      hint: "You might use one to type a message.",
      answer: "keyboard",
      placeholder: "Type your answer",
    },
    {
      prompt: "What gets wetter the more it dries?",
      hint: "You might reach for one after a shower.",
      answer: "towel",
      placeholder: "Type your answer",
    },
    {
      prompt: "What has to be broken before you can use it?",
      hint: "It often comes in a carton and is used for breakfast.",
      answer: "egg",
      placeholder: "Type your answer",
    },
    {
      prompt: "What has a neck but no head?",
      hint: "You might fill it with water.",
      answer: "bottle",
      placeholder: "Type your answer",
    },
    {
      prompt: "What has many teeth but cannot bite?",
      hint: "You might use it to tidy your hair.",
      answer: "comb",
      placeholder: "Type your answer",
    },
    {
      prompt: "What can travel around the world while staying in one corner?",
      hint: "You might stick it on an envelope.",
      answer: "stamp",
      placeholder: "Type your answer",
    },
    {
      prompt: "What goes up but never comes back down?",
      hint: "You get one year older each time it increases.",
      answer: "age",
      placeholder: "Type your answer",
    },
  ],
  medium: [
    {
      prompt: "What number comes next in this pattern? 4, 8, 16, 32, ...",
      hint: "Each number is multiplied by the same amount.",
      answer: "64",
      placeholder: "Enter a number",
    },
    {
      prompt: "What number comes next? 3, 6, 11, 18, 27, ...",
      hint: "Look at how much is added each time.",
      answer: "38",
      placeholder: "Enter a number",
    },
    {
      prompt:
        "A farmer has 12 eggs. All but 4 hatch. How many eggs are left?",
      hint: "Hatching doesn’t make an egg disappear.",
      answer: "12",
      placeholder: "Enter a number",
    },
    {
      prompt: "What number comes next? 2, 6, 12, 20, 30, ...",
      hint: "The amount added increases by 2 each time.",
      answer: "42",
      placeholder: "Enter a number",
    },
    {
      prompt:
        "If 5 machines make 5 toys in 5 minutes, how many toys do 100 machines make in 5 minutes?",
      hint: "Each machine makes one toy in five minutes.",
      answer: "100",
      placeholder: "Enter a number",
    },
    {
      prompt:
        "A book has 120 pages. If you read 15 pages each day, how many days will it take to finish?",
      hint: "Divide the total pages by the pages read each day.",
      answer: "8",
      placeholder: "Enter a number",
    },
    {
      prompt: "What number is missing? 81, 27, 9, 3, ...",
      hint: "Each number is divided by the same amount.",
      answer: "1",
      placeholder: "Enter a number",
    },
    {
      prompt:
        "A movie starts at 2:35 PM and lasts 1 hour 45 minutes. What time does it end?",
      hint: "Add one hour, then add another 45 minutes.",
      answer: "4:20 pm|4:20pm",
      placeholder: "Enter the time",
    },
  ],
  hard: [
    {
      prompt:
        "I am a three-digit number. My tens digit is 5 more than my ones digit. My hundreds digit is 8 less than my tens digit. My digits add up to 14. What number am I?",
      hint: "Write the digits as hundreds, tens, and ones.",
      answer: "194",
      placeholder: "Enter the three-digit number",
    },
    {
      prompt:
        "I am a two-digit number. My tens digit is three times my ones digit, and my digits add up to 12. What number am I?",
      hint: "The two digits add to 12, and the tens digit is three times the ones digit.",
      answer: "93",
      placeholder: "Enter the two-digit number",
    },
    {
      prompt:
        "A snail climbs 3 feet up a 10-foot wall each day, then slips 2 feet overnight. How many days does it take to reach the top?",
      hint: "On the final day, it won’t slide back after reaching the top.",
      answer: "8",
      placeholder: "Enter the number of days",
    },
    {
      prompt:
        "Reversing the digits of a two-digit number makes it 27 larger. Its digits add up to 9. What is the original number?",
      hint: "The reversed number is 27 greater, and the two digits total 9.",
      answer: "36",
      placeholder: "Enter the original number",
    },
    {
      prompt:
        "Three consecutive whole numbers add up to 72. What is the middle number?",
      hint: "The middle number is the average of the three.",
      answer: "24",
      placeholder: "Enter a number",
    },
    {
      prompt:
        "A drawer has 4 black socks and 4 blue socks. How many socks must you take in the dark to guarantee a matching-color pair?",
      hint: "Think about the worst case after taking two socks.",
      answer: "3",
      placeholder: "Enter a number",
    },
    {
      prompt:
        "A clock loses 10 minutes every real hour. It is set correctly at noon. What time will it show after 6 real hours?",
      hint: "In 6 hours it loses a total of 60 minutes.",
      answer: "5 pm|5pm",
      placeholder: "Enter the time",
    },
    {
      prompt:
        "One of 8 identical-looking balls is heavier. What is the fewest number of balance-scale weighings needed to guarantee you find it?",
      hint: "Split the balls into groups and compare equal-sized groups.",
      answer: "2",
      placeholder: "Enter a number",
    },
  ],
};

function formatTime(value: string): string {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function AlarmScreen() {
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(null);
  const [result, setResult] = useState<AlarmResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [answer, setAnswer] = useState("");
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showStopConfirmation, setShowStopConfirmation] = useState(false);
  const [showPuzzlePreview, setShowPuzzlePreview] = useState(false);
  const [previewPuzzleIndex, setPreviewPuzzleIndex] = useState(0);
  const [soundMessage, setSoundMessage] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundIntervalRef = useRef<number | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const stopSound = useCallback(() => {
    if (soundIntervalRef.current !== null) {
      window.clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }

    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    if (audioContext && audioContext.state !== "closed") {
      void audioContext.close();
    }
    setSoundEnabled(false);
  }, []);

  const startSound = useCallback(async () => {
    try {
      const audioContext = new window.AudioContext();
      audioContextRef.current = audioContext;
      await audioContext.resume();
      if (audioContext.state !== "running") {
        throw new Error("Audio playback requires a user gesture.");
      }

      const playTone = () => {
        if (audioContext.state !== "running") return;

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.frequency.value = 660;
        gain.gain.setValueAtTime(0.001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.08,
          audioContext.currentTime + 0.04,
        );
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + 0.35,
        );
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.36);
      };

      playTone();
      soundIntervalRef.current = window.setInterval(playTone, 1200);
      setSoundEnabled(true);
      setSoundMessage("");
    } catch {
      setSoundMessage(
        "Sound could not start. Check your browser's audio permission or continue with the visual alarm.",
      );
      stopSound();
    }
  }, [stopSound]);

  useEffect(() => {
    const syncAlarmState = () => {
      try {
        setActiveAlarm(readActiveAlarm());
        setResult(readAlarmResult());
        setLoadError("");
      } catch {
        setLoadError(
          "Alarm information could not be loaded from this browser. Return to the clock and check your saved settings.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    const frameId = window.requestAnimationFrame(() => {
      syncAlarmState();
    });

    window.addEventListener(ACTIVE_ALARM_UPDATED_EVENT, syncAlarmState);
    window.addEventListener("storage", syncAlarmState);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener(ACTIVE_ALARM_UPDATED_EVENT, syncAlarmState);
      window.removeEventListener("storage", syncAlarmState);
    };
  }, []);

  useEffect(() => {
    if (!activeAlarm) return;

    const activationId = window.setTimeout(() => {
      void startSound();
      firstFieldRef.current?.focus();
    }, 0);
    return () => {
      window.clearTimeout(activationId);
      stopSound();
    };
  }, [activeAlarm, startSound, stopSound]);

  function handleAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeAlarm) return;

    const normalizedAnswer = answer
      .trim()
      .toLocaleLowerCase()
      .replace(/[.!?]+$/g, "")
      .replace(/\s+/g, " ");
    const acceptedAnswers = currentPuzzle?.answer
      .split("|")
      .map((acceptedAnswer) => acceptedAnswer.trim().toLocaleLowerCase());
    if (!acceptedAnswers?.includes(normalizedAnswer)) {
      setFeedback("That answer isn’t quite right. Try again.");
      return;
    }

    try {
      const finishedAlarm = finishActiveAlarm(true);
      if (!finishedAlarm) {
        setFeedback("This alarm is no longer active. Return to the clock.");
        setActiveAlarm(null);
        return;
      }
      setResult(finishedAlarm);
      setActiveAlarm(null);
      setFeedback("");
    } catch {
      setFeedback(
        "The alarm could not be dismissed because browser storage is unavailable. Try again or use the emergency stop.",
      );
    }
  }

  function handleAnotherPuzzle() {
    if (!activeAlarm) return;

    const availableIndexes = puzzles[activeAlarm.difficulty]
      .map((_, index) => index)
      .filter((index) => index !== puzzleIndex);
    const nextIndex =
      availableIndexes[Math.floor(Math.random() * availableIndexes.length)];

    setPuzzleIndex(nextIndex);
    setAnswer("");
    setFeedback("");
    setShowStopConfirmation(false);
    firstFieldRef.current?.focus();
  }

  function handleEmergencyStop() {
    try {
      const finishedAlarm = finishActiveAlarm(false);
      if (!finishedAlarm) {
        setFeedback("This alarm is no longer active. Return to the clock.");
        setActiveAlarm(null);
        return;
      }
      setResult(finishedAlarm);
      setActiveAlarm(null);
      setShowStopConfirmation(false);
      setFeedback("");
    } catch {
      setFeedback(
        "The alarm could not be stopped because browser storage is unavailable.",
      );
    }
  }

  const currentPuzzle = activeAlarm
    ? puzzles[activeAlarm.difficulty][puzzleIndex]
    : null;
  const previewPuzzle = puzzles.medium[previewPuzzleIndex];

  return (
    <main className="relative isolate flex min-h-svh flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 -z-10 size-96 rounded-full bg-indigo-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -right-24 -z-10 size-[30rem] rounded-full bg-amber-400/10 blur-3xl"
      />

      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5 sm:px-8 sm:py-8">
        <span className="text-sm font-semibold tracking-[0.16em]">
          PUZZLE ALARM
        </span>
        {activeAlarm && (
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/20 bg-rose-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-rose-100">
            <span
              aria-hidden="true"
              className="size-2 animate-pulse rounded-full bg-rose-300"
            />
            Alarm ringing
          </span>
        )}
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 pb-10 sm:px-8">
        {isLoading ? (
          <p role="status" className="text-center text-sm text-white/70">
            Loading alarm…
          </p>
        ) : loadError ? (
          <div role="alert" className="rounded-3xl bg-white/10 p-6 text-center">
            <h1 className="text-2xl font-semibold">Alarm unavailable</h1>
            <p className="mt-3 text-sm leading-6 text-white/75">{loadError}</p>
            <Link
              href="/"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Return to clock
            </Link>
          </div>
        ) : activeAlarm && currentPuzzle ? (
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-7 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">
                It&apos;s time to wake up
              </p>
              <p className="mt-3 text-5xl font-light tracking-tight tabular-nums sm:text-6xl">
                {formatTime(activeAlarm.time)}
              </p>
              <p className="mt-3 text-sm text-white/65">
                Solve the puzzle to dismiss your alarm.
              </p>
            </div>

            <section
              aria-labelledby="puzzle-heading"
              className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-8"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                  Your {activeAlarm.difficulty} puzzle
                </p>
                {soundEnabled ? (
                  <span className="text-xs text-white/60">Sound on</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void startSound()}
                    className="min-h-10 rounded-full border border-white/20 px-3 text-xs font-medium text-white/80 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Enable sound
                  </button>
                )}
              </div>

              {soundMessage && (
                <p role="status" className="mt-3 text-sm leading-6 text-amber-100">
                  {soundMessage}
                </p>
              )}

              <h1
                id="puzzle-heading"
                aria-live="polite"
                className="mt-5 text-2xl font-medium leading-snug tracking-tight sm:text-3xl"
              >
                {currentPuzzle.prompt}
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Need a nudge? {currentPuzzle.hint}
              </p>
              <p className="mt-2 text-xs text-white/45">
                {puzzleIndex + 1} of {puzzles[activeAlarm.difficulty].length}{" "}
                puzzles at this difficulty
              </p>
              <button
                type="button"
                onClick={handleAnotherPuzzle}
                className="mt-4 min-h-10 rounded-full border border-white/20 px-4 text-sm font-medium text-white/80 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Try another puzzle
              </button>

              <form onSubmit={handleAnswer} className="mt-7">
                <label
                  htmlFor="puzzle-answer"
                  className="mb-2 block text-sm font-medium text-white/80"
                >
                  Your answer
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    ref={firstFieldRef}
                    id="puzzle-answer"
                    name="answer"
                    value={answer}
                    onChange={(event) => {
                      setAnswer(event.target.value);
                      setFeedback("");
                    }}
                    autoComplete="off"
                    required
                    placeholder={currentPuzzle.placeholder}
                    className="min-h-12 min-w-0 flex-1 rounded-2xl border border-white/20 bg-slate-950/50 px-4 text-base text-white placeholder:text-white/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
                  />
                  <button
                    type="submit"
                    className="min-h-12 rounded-2xl bg-amber-200 px-6 text-sm font-semibold text-slate-950 transition hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
                  >
                    Check answer
                  </button>
                </div>
              </form>

              {feedback && (
                <p
                  role="status"
                  aria-live="polite"
                  className="mt-4 rounded-xl bg-white/10 px-4 py-3 text-sm leading-6 text-amber-100"
                >
                  {feedback}
                </p>
              )}

              <div className="mt-7 border-t border-white/10 pt-5">
                {showStopConfirmation ? (
                  <div
                    role="group"
                    aria-label="Confirm emergency stop"
                    className="rounded-2xl border border-rose-200/20 bg-rose-300/10 p-4"
                  >
                    <p className="text-sm leading-6 text-rose-100">
                      Stop the alarm without solving? This won&apos;t count as
                      completing the puzzle.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleEmergencyStop}
                        className="min-h-11 rounded-full bg-rose-200 px-5 text-sm font-semibold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-200"
                      >
                        Stop alarm
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowStopConfirmation(false)}
                        className="min-h-11 rounded-full border border-white/20 px-5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                      >
                        Keep solving
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowStopConfirmation(true)}
                    className="min-h-11 rounded-full px-4 text-sm font-medium text-white/65 underline decoration-white/25 underline-offset-4 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    Emergency stop
                  </button>
                )}
              </div>
            </section>
          </div>
        ) : result ? (
          <div className="mx-auto w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 text-center shadow-2xl shadow-black/20 backdrop-blur-md sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">
              Alarm dismissed
            </p>
            <h1 className="mt-3 text-3xl font-medium tracking-tight">
              {result.solved ? "Puzzle complete." : "Alarm stopped."}
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/70">
              {result.solved
                ? result.onTime
                  ? "You solved the puzzle within five minutes of your scheduled alarm."
                  : "You solved the puzzle more than five minutes after your scheduled alarm."
                : "The alarm was stopped without completing the puzzle."}
            </p>
            <Link
              href="/"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-amber-200 px-6 text-sm font-semibold text-slate-950 transition hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
            >
              Return to clock
            </Link>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-lg">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 text-center backdrop-blur-md sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">
                All quiet
              </p>
              <h1 className="mt-3 text-3xl font-medium tracking-tight">
                No alarm is ringing.
              </h1>
              <p className="mt-4 text-sm leading-6 text-white/70">
                When an enabled alarm goes off while this app is open, your
                puzzle will appear here.
              </p>
              <button
                type="button"
                onClick={() => setShowPuzzlePreview((visible) => !visible)}
                aria-expanded={showPuzzlePreview}
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-amber-200 px-6 text-sm font-semibold text-slate-950 transition hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
              >
                {showPuzzlePreview ? "Hide puzzle preview" : "Preview a puzzle"}
              </button>
              <div>
                <Link
                  href="/"
                  className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium text-white/70 underline decoration-white/25 underline-offset-4 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Return to clock
                </Link>
              </div>
            </div>

            {showPuzzlePreview && (
              <section
                aria-labelledby="puzzle-preview-heading"
                className="mt-5 rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-8"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                  Puzzle preview · Medium
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewPuzzleIndex(
                      (currentIndex) =>
                        (currentIndex + 1) % puzzles.medium.length,
                    )
                  }
                  className="mt-4 min-h-10 rounded-full border border-white/20 px-4 text-sm font-medium text-white/80 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Try another puzzle
                </button>
                <h2
                  id="puzzle-preview-heading"
                  aria-live="polite"
                  className="mt-5 text-2xl font-medium leading-snug tracking-tight sm:text-3xl"
                >
                  {previewPuzzle.prompt}
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  Need a nudge? {previewPuzzle.hint}
                </p>
                <div className="mt-7">
                  <label
                    htmlFor="puzzle-preview-answer"
                    className="mb-2 block text-sm font-medium text-white/80"
                  >
                    Your answer
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      id="puzzle-preview-answer"
                      type="text"
                      disabled
                      placeholder={previewPuzzle.placeholder}
                      className="min-h-12 min-w-0 flex-1 rounded-2xl border border-white/20 bg-slate-950/50 px-4 text-base text-white placeholder:text-white/35 disabled:cursor-not-allowed disabled:opacity-70"
                    />
                    <button
                      type="button"
                      disabled
                      className="min-h-12 rounded-2xl bg-amber-200 px-6 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Check answer
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-5 text-white/50">
                  Preview only — this won&apos;t start or dismiss an alarm.
                </p>
              </section>
            )}
          </div>
        )}
      </section>

      <footer className="mx-auto w-full max-w-3xl px-5 pb-6 text-center text-xs leading-5 text-white/50 sm:px-8 sm:pb-8 sm:text-sm">
        Web alarms may not ring if the browser is closed, the device is asleep,
        or background activity is restricted.
      </footer>
    </main>
  );
}
