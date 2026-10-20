"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACTIVE_ALARM_UPDATED_EVENT,
  type ActiveAlarm,
  type AlarmResult,
  type PuzzleDifficulty,
  finishActiveAlarm,
  readActiveAlarm,
  readAlarmResult,
  saveActiveAlarm,
} from "@/lib/alarm";

const puzzles: Record<
  PuzzleDifficulty,
  {
    prompt: string;
    hint: string;
    answer: string;
    options: string[];
  }[]
> = {
  easy: [
    {
      prompt: "What comes next? ●, ■, ●, ■, …",
      hint: "The two shapes take turns.",
      answer: "●",
      options: ["●", "▲", "■"],
    },
    {
      prompt: "Complete the pattern: ▲, ▲, ●, ▲, ▲, ●, …",
      hint: "The same group of three repeats.",
      answer: "▲",
      options: ["▲", "●", "■"],
    },
    {
      prompt: "Which number comes next? 1, 2, 1, 2, 1, …",
      hint: "The two numbers alternate.",
      answer: "2",
      options: ["1", "2", "3"],
    },
    {
      prompt: "What completes the pattern? ○, △, □, ○, △, …",
      hint: "The three shapes repeat in order.",
      answer: "□",
      options: ["○", "△", "□"],
    },
    {
      prompt: "Which number comes next? 2, 4, 6, 8, …",
      hint: "Add the same amount each time.",
      answer: "10",
      options: ["9", "10", "12"],
    },
    {
      prompt: "Complete the pattern: A, B, A, B, A, …",
      hint: "The two letters alternate.",
      answer: "B",
      options: ["A", "B", "C"],
    },
    {
      prompt: "What comes next? ↑, →, ↑, →, …",
      hint: "The arrows alternate directions.",
      answer: "↑",
      options: ["↑", "→", "↓"],
    },
    {
      prompt: "Which number comes next? 3, 3, 4, 3, 3, 4, 3, …",
      hint: "A group of three numbers repeats.",
      answer: "3",
      options: ["3", "4", "5"],
    },
  ],
  medium: [
    {
      prompt: "Which number comes next? 4, 8, 16, 32, …",
      hint: "Each number is multiplied by two.",
      answer: "64",
      options: ["48", "56", "64", "66"],
    },
    {
      prompt: "Complete the pattern: 3, 6, 11, 18, 27, …",
      hint: "The amount added increases by two each time.",
      answer: "38",
      options: ["36", "37", "38", "39"],
    },
    {
      prompt: "What comes next? 1, 4, 9, 16, …",
      hint: "These are square numbers.",
      answer: "25",
      options: ["20", "24", "25", "32"],
    },
    {
      prompt: "Which number is missing? 2, 6, 12, 20, 30, …",
      hint: "The amount added increases by two each time.",
      answer: "42",
      options: ["38", "40", "42", "44"],
    },
    {
      prompt: "Complete the pattern: 81, 27, 9, 3, …",
      hint: "Each number is divided by three.",
      answer: "1",
      options: ["0", "1", "2", "3"],
    },
    {
      prompt: "What comes next? 5, 10, 20, 40, …",
      hint: "Each number is multiplied by the same amount.",
      answer: "80",
      options: ["60", "70", "80", "100"],
    },
    {
      prompt: "Which number comes next? 2, 5, 10, 17, 26, …",
      hint: "The amounts added are 3, 5, 7, and 9.",
      answer: "37",
      options: ["35", "36", "37", "38"],
    },
    {
      prompt: "Complete the pattern: 1, 1, 2, 3, 5, 8, …",
      hint: "Add the previous two numbers to get the next one.",
      answer: "13",
      options: ["11", "12", "13", "15"],
    },
  ],
  hard: [
    {
      prompt: "Which number comes next? 2, 3, 5, 9, 17, …",
      hint: "Look at the amount added each time.",
      answer: "33",
      options: ["25", "31", "33", "34"],
    },
    {
      prompt: "Complete the pattern: 1, 2, 6, 24, 120, …",
      hint: "Each step multiplies by the next whole number.",
      answer: "720",
      options: ["600", "620", "720", "840"],
    },
    {
      prompt: "What comes next? 2, 5, 11, 23, 47, …",
      hint: "Multiply by two, then add one.",
      answer: "95",
      options: ["93", "94", "95", "97"],
    },
    {
      prompt: "Which number is missing? 3, 8, 18, 38, 78, …",
      hint: "The same operation is used at each step.",
      answer: "158",
      options: ["148", "156", "158", "160"],
    },
    {
      prompt: "Complete the pattern: 1, 4, 10, 22, 46, …",
      hint: "Multiply by two, then add two.",
      answer: "94",
      options: ["90", "92", "94", "96"],
    },
    {
      prompt: "What comes next? 6, 12, 21, 33, 48, …",
      hint: "The amount added increases by three each time.",
      answer: "66",
      options: ["63", "64", "66", "69"],
    },
    {
      prompt: "Which number comes next? 1, 8, 27, 64, …",
      hint: "Each number is a whole number raised to the third power.",
      answer: "125",
      options: ["100", "121", "125", "128"],
    },
    {
      prompt: "Complete the pattern: 2, 3, 5, 8, 12, 17, …",
      hint: "The amount added increases by one each time.",
      answer: "23",
      options: ["21", "22", "23", "24"],
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

function chooseRandomPuzzleIndex(indexes: number[]): number {
  return indexes[Math.floor(Math.random() * indexes.length)];
}

export default function AlarmScreen() {
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(null);
  const [result, setResult] = useState<AlarmResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showStopConfirmation, setShowStopConfirmation] = useState(false);
  const [showPuzzlePreview, setShowPuzzlePreview] = useState(false);
  const [previewPuzzleIndex, setPreviewPuzzleIndex] = useState(0);
  const [previewFeedback, setPreviewFeedback] = useState("");
  const [soundMessage, setSoundMessage] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundIntervalRef = useRef<number | null>(null);
  const firstOptionRef = useRef<HTMLButtonElement>(null);

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

  const activeScheduledFor = activeAlarm?.scheduledFor;
  const activePuzzleIndex = activeAlarm?.currentPuzzleIndex;

  useEffect(() => {
    if (!activeScheduledFor) return;

    const activationId = window.setTimeout(() => {
      void startSound();
    }, 0);
    return () => {
      window.clearTimeout(activationId);
      stopSound();
    };
  }, [activeScheduledFor, startSound, stopSound]);

  useEffect(() => {
    if (activePuzzleIndex !== undefined) firstOptionRef.current?.focus();
  }, [activePuzzleIndex]);

  function handleAnswer(selectedAnswer: string) {
    if (!activeAlarm) return;

    if (selectedAnswer !== currentPuzzle?.answer) {
      setFeedback("That answer isn’t quite right. Try again.");
      return;
    }

    const solvedPuzzleIndexes = [
      ...activeAlarm.solvedPuzzleIndexes,
      activeAlarm.currentPuzzleIndex,
    ];

    if (solvedPuzzleIndexes.length < activeAlarm.puzzleCount) {
      const availableIndexes = puzzles[activeAlarm.difficulty]
        .map((_, index) => index)
        .filter((index) => !solvedPuzzleIndexes.includes(index));
      const nextIndex = chooseRandomPuzzleIndex(availableIndexes);

      try {
        saveActiveAlarm({
          ...activeAlarm,
          currentPuzzleIndex: nextIndex,
          solvedPuzzleIndexes,
        });
        setFeedback(
          `${solvedPuzzleIndexes.length} of ${activeAlarm.puzzleCount} puzzles solved. Keep going.`,
        );
        setShowStopConfirmation(false);
      } catch {
        setFeedback(
          "Your progress could not be saved because browser storage is unavailable. Try again or use the emergency stop.",
        );
      }
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
      .filter(
        (index) =>
          index !== activeAlarm.currentPuzzleIndex &&
          !activeAlarm.solvedPuzzleIndexes.includes(index),
      );
    const nextIndex = chooseRandomPuzzleIndex(availableIndexes);

    try {
      saveActiveAlarm({
        ...activeAlarm,
        currentPuzzleIndex: nextIndex,
      });
      setFeedback("");
      setShowStopConfirmation(false);
    } catch {
      setFeedback(
        "A new puzzle could not be loaded because browser storage is unavailable.",
      );
    }
  }

  function handlePreviewAnswer(selectedAnswer: string) {
    setPreviewFeedback(
      selectedAnswer === previewPuzzle.answer
        ? "That’s right! This is only a preview, so the alarm stays unchanged."
        : "Not quite. Try another choice.",
    );
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
    ? puzzles[activeAlarm.difficulty][activeAlarm.currentPuzzleIndex]
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
                Solve {activeAlarm.puzzleCount}{" "}
                {activeAlarm.puzzleCount === 1 ? "puzzle" : "puzzles"} to
                dismiss your alarm.
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
              <p className="mt-4 text-sm font-medium text-white/80">
                Tap an answer:
              </p>
              <p className="mt-2 text-xs text-white/45">
                {activeAlarm.solvedPuzzleIndexes.length} of{" "}
                {activeAlarm.puzzleCount} puzzles solved
              </p>
              <button
                type="button"
                onClick={handleAnotherPuzzle}
                className="mt-4 min-h-10 rounded-full border border-white/20 px-4 text-sm font-medium text-white/80 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Try another puzzle
              </button>

              <div
                role="group"
                aria-label="Choose the answer that completes the pattern"
                className="mt-3 grid grid-cols-2 gap-3"
              >
                {currentPuzzle.options.map((option, index) => (
                  <button
                    key={option}
                    ref={index === 0 ? firstOptionRef : undefined}
                    type="button"
                    onClick={() => handleAnswer(option)}
                    aria-label={`Answer ${index + 1}: ${option}`}
                    className="min-h-16 touch-manipulation rounded-2xl border border-white/20 bg-slate-950/50 px-4 py-3 text-xl font-semibold text-white transition hover:border-amber-200/70 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 sm:min-h-20 sm:text-2xl"
                  >
                    {option}
                  </button>
                ))}
              </div>

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
                  onClick={() => {
                    setPreviewPuzzleIndex(
                      (currentIndex) =>
                        (currentIndex + 1) % puzzles.medium.length,
                    );
                    setPreviewFeedback("");
                  }}
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
                <p className="mt-4 text-sm font-medium text-white/80">
                  Tap an answer:
                </p>
                <div
                  role="group"
                  aria-label="Choose the answer that completes the pattern"
                  className="mt-3 grid grid-cols-2 gap-3"
                >
                  {previewPuzzle.options.map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handlePreviewAnswer(option)}
                      aria-label={`Answer ${index + 1}: ${option}`}
                      className="min-h-16 touch-manipulation rounded-2xl border border-white/20 bg-slate-950/50 px-4 py-3 text-xl font-semibold text-white transition hover:border-amber-200/70 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 sm:min-h-20 sm:text-2xl"
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {previewFeedback && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="mt-4 rounded-xl bg-white/10 px-4 py-3 text-sm leading-6 text-amber-100"
                  >
                    {previewFeedback}
                  </p>
                )}
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
