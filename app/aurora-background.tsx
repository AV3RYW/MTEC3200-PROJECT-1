"use client";

import { useEffect, useState, type CSSProperties } from "react";
import {
  BACKGROUND_SETTINGS_UPDATED_EVENT,
  DEFAULT_BACKGROUND_SETTINGS,
  readBackgroundSettings,
} from "@/lib/background";

type AuroraStyle = CSSProperties & {
  "--aurora-background": string;
  "--aurora-orb-color": string;
  "--aurora-opacity": number;
  "--aurora-duration-violet": string;
  "--aurora-duration-blue": string;
  "--aurora-duration-pink": string;
  "--aurora-duration-teal": string;
  "--aurora-duration-accent-one": string;
  "--aurora-duration-accent-two": string;
  "--aurora-duration-accent-three": string;
};

export default function AuroraBackground() {
  const [settings, setSettings] = useState(DEFAULT_BACKGROUND_SETTINGS);

  useEffect(() => {
    function syncSettings() {
      try {
        setSettings(readBackgroundSettings());
      } catch (error) {
        console.error("Could not load saved background settings.", error);
      }
    }

    syncSettings();
    window.addEventListener("storage", syncSettings);
    window.addEventListener(BACKGROUND_SETTINGS_UPDATED_EVENT, syncSettings);

    return () => {
      window.removeEventListener("storage", syncSettings);
      window.removeEventListener(
        BACKGROUND_SETTINGS_UPDATED_EVENT,
        syncSettings,
      );
    };
  }, []);

  const style: AuroraStyle = {
    "--aurora-background": settings.backgroundColor,
    "--aurora-orb-color": settings.orbColor,
    "--aurora-opacity": settings.orbOpacity / 100,
    "--aurora-duration-violet": `${(27 * 100) / settings.orbSpeed}s`,
    "--aurora-duration-blue": `${(31 * 100) / settings.orbSpeed}s`,
    "--aurora-duration-pink": `${(34 * 100) / settings.orbSpeed}s`,
    "--aurora-duration-teal": `${(29 * 100) / settings.orbSpeed}s`,
    "--aurora-duration-accent-one": `${(20 * 100) / settings.orbSpeed}s`,
    "--aurora-duration-accent-two": `${(24 * 100) / settings.orbSpeed}s`,
    "--aurora-duration-accent-three": `${(22 * 100) / settings.orbSpeed}s`,
  };

  return (
    <div
      aria-hidden="true"
      className="aurora-background"
      style={style}
    >
      <div className="aurora-effects">
        <span className="aurora-blob aurora-blob--violet" />
        <span className="aurora-blob aurora-blob--blue" />
        <span className="aurora-blob aurora-blob--pink" />
        <span className="aurora-blob aurora-blob--teal" />
        <span className="aurora-accent aurora-accent--one" />
        <span className="aurora-accent aurora-accent--two" />
        <span className="aurora-accent aurora-accent--three" />
      </div>
    </div>
  );
}
