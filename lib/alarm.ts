export const ALARM_STORAGE_KEY = "puzzle-alarm-settings";
export const ACTIVE_ALARM_STORAGE_KEY = "puzzle-alarm-active";
export const HANDLED_ALARM_STORAGE_KEY = "puzzle-alarm-last-handled";
export const ALARM_RESULT_STORAGE_KEY = "puzzle-alarm-last-result";
export const ALARM_UPDATED_EVENT = "puzzle-alarm-settings-updated";
export const ACTIVE_ALARM_UPDATED_EVENT = "puzzle-alarm-active-updated";

export type PuzzleDifficulty = "easy" | "medium" | "hard";

export type ActiveAlarm = {
  scheduledFor: string;
  time: string;
  difficulty: PuzzleDifficulty;
  puzzleCount: number;
  currentPuzzleIndex: number;
  solvedPuzzleIndexes: number[];
};

export type AlarmResult = {
  scheduledFor: string;
  dismissedAt: string;
  solved: boolean;
  onTime: boolean;
};

export type AlarmSettings = {
  time: string;
  repeatDays: number[];
  difficulty: PuzzleDifficulty;
  puzzleCount: number;
  enabled: boolean;
};

type StoredAlarmSettings = Omit<AlarmSettings, "puzzleCount"> & {
  puzzleCount?: number;
};

function isPuzzleDifficulty(value: unknown): value is PuzzleDifficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

function isPuzzleCount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

function isPuzzleIndex(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 7
  );
}

function isAlarmSettings(value: unknown): value is StoredAlarmSettings {
  if (typeof value !== "object" || value === null) return false;

  const alarm = value as Record<string, unknown>;

  return (
    typeof alarm.time === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(alarm.time) &&
    Array.isArray(alarm.repeatDays) &&
    alarm.repeatDays.every(
      (day: unknown) =>
        typeof day === "number" &&
        Number.isInteger(day) &&
        day >= 0 &&
        day <= 6,
    ) &&
    new Set(alarm.repeatDays).size === alarm.repeatDays.length &&
    isPuzzleDifficulty(alarm.difficulty) &&
    (alarm.puzzleCount === undefined || isPuzzleCount(alarm.puzzleCount)) &&
    typeof alarm.enabled === "boolean"
  );
}

export function readAlarmSettings(): AlarmSettings | null {
  const storedValue = window.localStorage.getItem(ALARM_STORAGE_KEY);
  if (storedValue === null) return null;

  const parsedValue: unknown = JSON.parse(storedValue);
  if (!isAlarmSettings(parsedValue)) {
    throw new Error("Saved alarm settings are not in a valid format.");
  }

  return { ...parsedValue, puzzleCount: parsedValue.puzzleCount ?? 1 };
}

export function readActiveAlarm(): ActiveAlarm | null {
  const storedValue = window.localStorage.getItem(ACTIVE_ALARM_STORAGE_KEY);
  if (storedValue === null) return null;

  const parsedValue: unknown = JSON.parse(storedValue);
  if (
    typeof parsedValue !== "object" ||
    parsedValue === null ||
    !("scheduledFor" in parsedValue) ||
    typeof parsedValue.scheduledFor !== "string" ||
    Number.isNaN(Date.parse(parsedValue.scheduledFor)) ||
    !("time" in parsedValue) ||
    typeof parsedValue.time !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(parsedValue.time) ||
    !("difficulty" in parsedValue) ||
    !isPuzzleDifficulty(parsedValue.difficulty)
  ) {
    throw new Error("The active alarm is not in a valid format.");
  }

  const storedAlarm = parsedValue as Record<string, unknown>;
  if (
    (storedAlarm.puzzleCount !== undefined &&
      !isPuzzleCount(storedAlarm.puzzleCount)) ||
    (storedAlarm.currentPuzzleIndex !== undefined &&
      !isPuzzleIndex(storedAlarm.currentPuzzleIndex)) ||
    (storedAlarm.solvedPuzzleIndexes !== undefined &&
      (!Array.isArray(storedAlarm.solvedPuzzleIndexes) ||
        !storedAlarm.solvedPuzzleIndexes.every(isPuzzleIndex) ||
        new Set(storedAlarm.solvedPuzzleIndexes).size !==
          storedAlarm.solvedPuzzleIndexes.length))
  ) {
    throw new Error("The active alarm is not in a valid format.");
  }

  return {
    scheduledFor: parsedValue.scheduledFor,
    time: parsedValue.time,
    difficulty: parsedValue.difficulty,
    puzzleCount: isPuzzleCount(storedAlarm.puzzleCount)
      ? storedAlarm.puzzleCount
      : 1,
    currentPuzzleIndex: isPuzzleIndex(storedAlarm.currentPuzzleIndex)
      ? storedAlarm.currentPuzzleIndex
      : 0,
    solvedPuzzleIndexes: Array.isArray(storedAlarm.solvedPuzzleIndexes)
      ? storedAlarm.solvedPuzzleIndexes.filter(isPuzzleIndex)
      : [],
  };
}

export function saveActiveAlarm(alarm: ActiveAlarm): void {
  window.localStorage.setItem(
    ACTIVE_ALARM_STORAGE_KEY,
    JSON.stringify(alarm),
  );
  window.dispatchEvent(new Event(ACTIVE_ALARM_UPDATED_EVENT));
}

export function finishActiveAlarm(solved: boolean): AlarmResult | null {
  const activeAlarm = readActiveAlarm();
  if (!activeAlarm) return null;

  const dismissedAt = new Date();
  const scheduledAt = new Date(activeAlarm.scheduledFor);
  const result: AlarmResult = {
    scheduledFor: activeAlarm.scheduledFor,
    dismissedAt: dismissedAt.toISOString(),
    solved,
    onTime:
      dismissedAt.getTime() >= scheduledAt.getTime() &&
      dismissedAt.getTime() - scheduledAt.getTime() <= 5 * 60 * 1000,
  };

  window.localStorage.setItem(
    ALARM_RESULT_STORAGE_KEY,
    JSON.stringify(result),
  );
  window.localStorage.removeItem(ACTIVE_ALARM_STORAGE_KEY);
  window.dispatchEvent(new Event(ACTIVE_ALARM_UPDATED_EVENT));
  return result;
}

export function readAlarmResult(): AlarmResult | null {
  const storedValue = window.localStorage.getItem(ALARM_RESULT_STORAGE_KEY);
  if (storedValue === null) return null;

  const parsedValue: unknown = JSON.parse(storedValue);
  if (
    typeof parsedValue !== "object" ||
    parsedValue === null ||
    !("scheduledFor" in parsedValue) ||
    typeof parsedValue.scheduledFor !== "string" ||
    !("dismissedAt" in parsedValue) ||
    typeof parsedValue.dismissedAt !== "string" ||
    !("solved" in parsedValue) ||
    typeof parsedValue.solved !== "boolean" ||
    !("onTime" in parsedValue) ||
    typeof parsedValue.onTime !== "boolean"
  ) {
    throw new Error("The last alarm result is not in a valid format.");
  }

  return {
    scheduledFor: parsedValue.scheduledFor,
    dismissedAt: parsedValue.dismissedAt,
    solved: parsedValue.solved,
    onTime: parsedValue.onTime,
  };
}

export function saveAlarmSettings(alarm: AlarmSettings): void {
  window.localStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(alarm));
}

export function getNextAlarmDate(
  alarm: AlarmSettings,
  from: Date,
): Date | null {
  if (!alarm.enabled) return null;

  const [hours, minutes] = alarm.time.split(":").map(Number);

  if (alarm.repeatDays.length === 0) {
    const date = new Date(from);
    date.setHours(hours, minutes, 0, 0);
    if (date.getTime() <= from.getTime()) {
      date.setDate(date.getDate() + 1);
    }
    return date;
  }

  for (let offset = 0; offset <= 7; offset += 1) {
    const date = new Date(from);
    date.setDate(from.getDate() + offset);
    date.setHours(hours, minutes, 0, 0);

    const isScheduledDay = alarm.repeatDays.includes(date.getDay());

    if (isScheduledDay && date.getTime() > from.getTime()) {
      return date;
    }
  }

  return null;
}

export function formatRepeatDays(days: number[]): string {
  if (days.length === 0) return "Once";
  if (days.length === 7) return "Every day";

  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.map((day) => labels[day]).join(", ");
}
