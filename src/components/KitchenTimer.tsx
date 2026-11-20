"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Minus, Pause, Play, Plus, RotateCcw, X } from "lucide-react";

interface KitchenTimerProps {
  defaultCookMins: number;
  dishTitle: string;
}

type SelectedPreset = number | "cook" | "custom";
type AudioContextConstructor = new () => AudioContext;

const PRESET_MINUTES = [5, 10, 15, 30] as const;
const MIN_SECONDS = 60;
const MAX_SECONDS = 3 * 60 * 60;
const CHIME_NOTES = [523.25, 659.25, 783.99] as const;

function clampSeconds(value: number) {
  return Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, Math.round(value)));
}

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function playCompletionChime() {
  try {
    const audioWindow = window as Window & { webkitAudioContext?: AudioContextConstructor };
    const AudioContextClass = window.AudioContext ?? audioWindow.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const now = context.currentTime;
    void context.resume().catch(() => undefined);

    CHIME_NOTES.forEach((frequency, index) => {
      const start = now + index * 0.18;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.18);
    });

    window.setTimeout(() => {
      try {
        void context.close().catch(() => undefined);
      } catch {
        return;
      }
    }, 900);
  } catch {
    return;
  }
}

export function KitchenTimer({ defaultCookMins, dishTitle }: KitchenTimerProps) {
  const cookSeconds = clampSeconds(defaultCookMins * 60);
  const timerId = useId();
  const [durationSeconds, setDurationSeconds] = useState(cookSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(cookSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<SelectedPreset>("cook");
  const chimePlayedRef = useRef(false);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (isRunning || remainingSeconds > 0) {
      return;
    }

    setIsComplete(true);
    if (!chimePlayedRef.current) {
      chimePlayedRef.current = true;
      playCompletionChime();
    }
  }, [isRunning, remainingSeconds]);

  const applyDuration = (seconds: number, preset: SelectedPreset) => {
    setIsRunning(false);
    setDurationSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsComplete(false);
    setSelectedPreset(preset);
    chimePlayedRef.current = false;
  };

  const adjustTimer = (deltaSeconds: number) => {
    setIsRunning(false);
    setDurationSeconds(clampSeconds(durationSeconds + deltaSeconds));
    setRemainingSeconds(clampSeconds(remainingSeconds + deltaSeconds));
    setIsComplete(false);
    setSelectedPreset("custom");
    chimePlayedRef.current = false;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(durationSeconds);
    setIsComplete(false);
    chimePlayedRef.current = false;
  };

  const toggleTimer = () => {
    if (isComplete || remainingSeconds <= 0) {
      chimePlayedRef.current = false;
      setIsComplete(false);
      setRemainingSeconds(durationSeconds);
      setIsRunning(true);
      return;
    }

    setIsRunning((current) => !current);
  };

  const presetName = `${timerId}-preset`;

  return (
    <section
      aria-labelledby={`${timerId}-heading`}
      className="no-print print:hidden rounded-3xl border border-adobo/15 bg-white p-6 shadow-card sm:p-8"
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-adobo">Kitchen guide</p>
      <h2 id={`${timerId}-heading`} className="mt-2 text-2xl font-black tracking-tight">
        Kain Na! Kitchen Timer
      </h2>
      <p className="mt-1 text-sm font-semibold text-charcoal/75">For {dishTitle}</p>

      <div className="mt-6 rounded-3xl bg-charcoal px-6 py-8 text-center sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cream/60">
          Time remaining
        </p>
        <p
          role="timer"
          aria-label="Time remaining"
          aria-live="off"
          className="mt-3 text-6xl font-black tabular-nums tracking-[0.08em] text-white sm:text-7xl"
        >
          {formatSeconds(remainingSeconds)}
        </p>
        <p className="mt-3 text-xs font-semibold text-cream/60">
          {Math.round(durationSeconds / 60)} minute timer
        </p>

        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={toggleTimer}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-adobo px-5 text-sm font-extrabold text-white transition-colors hover:bg-adobo-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {isRunning ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
            {isRunning ? "Pause" : isComplete ? "Start Again" : "Start"}
          </button>
          <button
            type="button"
            onClick={resetTimer}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-cream/30 px-5 text-sm font-extrabold text-white transition-colors hover:border-cream hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Reset
          </button>
        </div>

        {isRunning ? null : (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => adjustTimer(-60)}
              disabled={remainingSeconds <= MIN_SECONDS && durationSeconds <= MIN_SECONDS}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-cream/25 px-3 text-xs font-bold text-cream transition-colors hover:border-cream hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Minus size={14} aria-hidden="true" />
              -1m
            </button>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-cream/50">
              Fine-tune
            </span>
            <button
              type="button"
              onClick={() => adjustTimer(60)}
              disabled={remainingSeconds >= MAX_SECONDS && durationSeconds >= MAX_SECONDS}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-cream/25 px-3 text-xs font-bold text-cream transition-colors hover:border-cream hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Plus size={14} aria-hidden="true" />
              +1m
            </button>
          </div>
        )}
      </div>

      <fieldset disabled={isRunning} className="mt-5">
        <legend className="text-xs font-bold uppercase tracking-[0.14em] text-adobo-dark">
          Quick presets
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESET_MINUTES.map((minutes) => {
            const presetId = `${timerId}-preset-${minutes}`;
            return (
              <label key={minutes} htmlFor={presetId} className="cursor-pointer">
                <input
                  id={presetId}
                  type="radio"
                  name={presetName}
                  checked={selectedPreset === minutes}
                  onChange={() => applyDuration(clampSeconds(minutes * 60), minutes)}
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-11 items-center rounded-full border border-adobo/20 bg-white px-3 text-xs font-extrabold text-charcoal/75 transition-colors hover:border-adobo/50 hover:text-adobo peer-checked:border-adobo peer-checked:bg-adobo peer-checked:text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-adobo">
                  {minutes}m
                </span>
              </label>
            );
          })}
          <label htmlFor={`${timerId}-cook`} className="cursor-pointer">
            <input
              id={`${timerId}-cook`}
              type="radio"
              name={presetName}
              checked={selectedPreset === "cook"}
              onChange={() => applyDuration(cookSeconds, "cook")}
              className="peer sr-only"
            />
                          <span className="inline-flex min-h-11 items-center rounded-full border border-adobo/20 bg-white px-3 text-xs font-extrabold text-charcoal/75 transition-colors hover:border-adobo/50 hover:text-adobo peer-checked:border-adobo peer-checked:bg-adobo peer-checked:text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-adobo">
              Cook Time ({Math.round(cookSeconds / 60)}m)
            </span>
          </label>
        </div>
      </fieldset>

      <div role="status" aria-live="polite" aria-atomic="true">
        {isComplete ? (
          <div className="mt-5 rounded-2xl border border-calamansi/30 bg-calamansi-soft p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-black text-calamansi">Luto Na! Kain Na! 🍚</p>
                <p className="mt-1 text-sm font-semibold text-charcoal/75">
                  {dishTitle} is ready to serve.
                </p>
              </div>
              <button
                type="button"
                onClick={resetTimer}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-calamansi px-3 text-xs font-extrabold text-white transition-colors hover:bg-calamansi/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calamansi"
              >
                <X size={14} aria-hidden="true" />
                Dismiss / Reset
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
