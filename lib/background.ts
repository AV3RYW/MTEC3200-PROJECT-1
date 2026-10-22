export const BACKGROUND_SETTINGS_STORAGE_KEY = "puzzle-alarm-background";
export const BACKGROUND_SETTINGS_UPDATED_EVENT =
  "puzzle-alarm-background-updated";

export type BackgroundSettings = {
  backgroundColor: string;
  orbColor: string;
  orbOpacity: number;
  orbSpeed: number;
};

export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
  backgroundColor: "#090817",
  orbColor: "#8b5cf6",
  orbOpacity: 85,
  orbSpeed: 100,
};

function isBackgroundSettings(value: unknown): value is BackgroundSettings {
  if (typeof value !== "object" || value === null) return false;

  const settings = value as Record<string, unknown>;

  return (
    typeof settings.backgroundColor === "string" &&
    /^#[\da-f]{6}$/i.test(settings.backgroundColor) &&
    typeof settings.orbColor === "string" &&
    /^#[\da-f]{6}$/i.test(settings.orbColor) &&
    typeof settings.orbOpacity === "number" &&
    Number.isInteger(settings.orbOpacity) &&
    settings.orbOpacity >= 0 &&
    settings.orbOpacity <= 100 &&
    (settings.orbSpeed === undefined ||
      (typeof settings.orbSpeed === "number" &&
        Number.isInteger(settings.orbSpeed) &&
        settings.orbSpeed >= 50 &&
        settings.orbSpeed <= 200))
  );
}

export function readBackgroundSettings(): BackgroundSettings {
  const storedValue = window.localStorage.getItem(
    BACKGROUND_SETTINGS_STORAGE_KEY,
  );
  if (storedValue === null) return DEFAULT_BACKGROUND_SETTINGS;

  const parsedValue: unknown = JSON.parse(storedValue);
  if (!isBackgroundSettings(parsedValue)) {
    throw new Error("Saved background settings are not in a valid format.");
  }

  return {
    ...parsedValue,
    orbSpeed: parsedValue.orbSpeed ?? DEFAULT_BACKGROUND_SETTINGS.orbSpeed,
  };
}

export function saveBackgroundSettings(
  settings: BackgroundSettings,
): void {
  if (!isBackgroundSettings(settings)) {
    throw new Error("Background settings are not in a valid format.");
  }

  window.localStorage.setItem(
    BACKGROUND_SETTINGS_STORAGE_KEY,
    JSON.stringify(settings),
  );
  window.dispatchEvent(new Event(BACKGROUND_SETTINGS_UPDATED_EVENT));
}
