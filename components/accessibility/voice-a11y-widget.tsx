"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Contrast,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Square,
  Type,
  Volume2,
  X,
} from "lucide-react";

import { usePreferences } from "@/components/providers/preferences-provider";
import { EmergencyCallModal } from "@/components/tourism/emergency-call-modal";
import { useLogout } from "@/hooks/use-logout";
import { getRoleLabel } from "@/lib/i18n";
import {
  clickMatchingElement,
  extractPageSummary,
  fillMatchingInput,
  interpretConfirmation,
  interpretVoiceCommand,
  summarizeAllowedRoutesForRole,
} from "@/lib/voice-assistant";
import { cn } from "@/lib/utils";
import type { TYPE_EMERGENCY_CONTACT } from "@/types/tourism.type";

const PRIMARY_EMERGENCY_CONTACT: TYPE_EMERGENCY_CONTACT = {
  name: "Posko Komando BBTNGL Bukit Lawang",
  role: "Koordinator Resort & Ranger Lapangan",
  phone: "+62-61-8821-0112",
  radio_channel: "VHF 156.800 MHz (Ch. 16)",
  available: "24 hours",
  location: "Gerbang Utama Bukit Lawang, Langkat",
  notes: "Pusat koordinasi evakuasi jalur & laporan darurat satwa liar.",
};

const STORAGE_VOICE = "app-a11y-voice";
const STORAGE_RATE = "app-a11y-rate";
const STORAGE_FONT = "app-a11y-font";
const STORAGE_CONTRAST = "app-a11y-contrast";
const STORAGE_READABLE = "app-a11y-readable";
const STORAGE_AUTOREAD = "app-a11y-autoread";

type FontScale = "md" | "lg" | "xl";

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = {
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

const RATE_PRESETS = [0.75, 1.0, 1.25, 1.5] as const;

function sortVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return [...voices].sort((a, b) => {
    const score = (lang: string) => {
      const l = lang.toLowerCase();
      if (l.startsWith("id")) return 0;
      if (l.startsWith("en")) return 1;
      return 2;
    };
    const diff = score(a.lang) - score(b.lang);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });
}

function VoiceA11yEmblem({ listening, className }: { listening: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-6", className)}
    >
      {/* Head */}
      <circle cx="11.5" cy="7.5" r="2.7" fill="currentColor" />
      {/* Open arms & torso (universal accessibility posture) */}
      <path
        d="M4.5 13.2C7.2 11.9 15.8 11.9 18.5 13.2"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M11.5 12.6V19.6M11.5 19.6L8 26.8M11.5 19.6L15 26.8"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Acoustic voice-wave arcs */}
      <path
        d="M21.2 11.8C23.1 13.9 23.1 18.1 21.2 20.2"
        stroke={listening ? "#fda4af" : "#fbbf24"}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M24.6 8.8C27.8 12.6 27.8 19.4 24.6 23.2"
        stroke={listening ? "#fda4af" : "#fbbf24"}
        strokeWidth="2.2"
        strokeLinecap="round"
        className={listening ? "animate-pulse" : undefined}
      />
    </svg>
  );
}

export function VoiceA11yWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale, userRole, t } = usePreferences();
  const logout = useLogout();

  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [rate, setRate] = useState(1.0);
  const [fontScale, setFontScale] = useState<FontScale>("md");
  const [highContrast, setHighContrast] = useState(false);
  const [readableSpacing, setReadableSpacing] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [textCommand, setTextCommand] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);

  const [activeEmergencyCall, setActiveEmergencyCall] = useState<TYPE_EMERGENCY_CONTACT | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const rateRef = useRef(rate);
  const voiceUriRef = useRef(selectedVoiceURI);
  const autoReadRef = useRef(autoRead);
  const wantListeningRef = useRef(false);
  const conversationActiveRef = useRef(false);
  const pendingEmergencyRef = useRef<{ emergencyType: string; transcript: string } | null>(null);
  const startListeningRef = useRef<() => void>(() => undefined);
  const activeEmergencyCallRef = useRef<TYPE_EMERGENCY_CONTACT | null>(null);
  const fatalErrorRef = useRef(false);
  const latestTranscriptRef = useRef("");
  const restartTimerRef = useRef<number | null>(null);
  const resumeListenTimerRef = useRef<number | null>(null);

  useEffect(() => {
    activeEmergencyCallRef.current = activeEmergencyCall;
  }, [activeEmergencyCall]);

  useEffect(() => {
    return () => {
      if (resumeListenTimerRef.current !== null) {
        window.clearTimeout(resumeListenTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    voiceUriRef.current = selectedVoiceURI;
  }, [selectedVoiceURI]);

  useEffect(() => {
    autoReadRef.current = autoRead;
  }, [autoRead]);

  // Hydrate persisted preferences & speech voices without synchronous setState in effect
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const list = sortVoices(window.speechSynthesis.getVoices());
      if (list.length > 0) {
        setVoices(list);
        setSelectedVoiceURI((prev) => {
          if (prev && list.some((v) => v.voiceURI === prev)) return prev;
          const stored = window.localStorage.getItem(STORAGE_VOICE);
          if (stored && list.some((v) => v.voiceURI === stored)) return stored;
          const preferred =
            list.find((v) => v.lang.toLowerCase().startsWith(locale)) ?? list[0];
          return preferred?.voiceURI ?? "";
        });
      }
    };

    queueMicrotask(() => {
      try {
        const storedRate = Number(window.localStorage.getItem(STORAGE_RATE));
        if (Number.isFinite(storedRate) && storedRate >= 0.5 && storedRate <= 2.0) {
          setRate(storedRate);
        }
        const storedFont = window.localStorage.getItem(STORAGE_FONT);
        if (storedFont === "md" || storedFont === "lg" || storedFont === "xl") {
          setFontScale(storedFont);
        }
        if (window.localStorage.getItem(STORAGE_CONTRAST) === "high") {
          setHighContrast(true);
        }
        if (window.localStorage.getItem(STORAGE_READABLE) === "true") {
          setReadableSpacing(true);
        }
        if (window.localStorage.getItem(STORAGE_AUTOREAD) === "true") {
          setAutoRead(true);
        }
      } catch {
        // Ignore storage errors
      }

      const win = window as SpeechWindow;
      if (!win.SpeechRecognition && !win.webkitSpeechRecognition) {
        setSpeechSupported(false);
      }
      loadVoices();
    });

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      };
    }
    return undefined;
  }, [locale]);

  // Sync visual accessibility attributes on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (fontScale === "md") {
      delete root.dataset.a11yFont;
    } else {
      root.dataset.a11yFont = fontScale;
    }

    if (highContrast) {
      root.dataset.a11yContrast = "high";
    } else {
      delete root.dataset.a11yContrast;
    }

    if (readableSpacing) {
      root.dataset.a11yReadable = "true";
    } else {
      delete root.dataset.a11yReadable;
    }
  }, [fontScale, highContrast, readableSpacing]);

  const stopSpeaking = useCallback(() => {
    if (resumeListenTimerRef.current !== null) {
      window.clearTimeout(resumeListenTimerRef.current);
      resumeListenTimerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (message: string, overrideRate?: number, options?: { resumeAfter?: boolean }) => {
      if (resumeListenTimerRef.current !== null) {
        window.clearTimeout(resumeListenTimerRef.current);
        resumeListenTimerRef.current = null;
      }
      setFeedback(message);

      const scheduleResumeAfterSpeech = () => {
        if (
          conversationActiveRef.current &&
          options?.resumeAfter !== false &&
          !activeEmergencyCallRef.current
        ) {
          resumeListenTimerRef.current = window.setTimeout(() => {
            resumeListenTimerRef.current = null;
            if (conversationActiveRef.current && !activeEmergencyCallRef.current) {
              startListeningRef.current();
            }
          }, 280);
        }
      };

      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        scheduleResumeAfterSpeech();
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const allVoices = window.speechSynthesis.getVoices();
        const chosen = allVoices.find((v) => v.voiceURI === voiceUriRef.current);

        // Split long text (e.g. full page readouts) into ~180-char chunks so browsers never silently drop them
        const sentences = message
          .split(/(?<=[.!?])\s+/)
          .flatMap((part) => (part.length > 180 ? part.match(/.{1,180}(?:\s|$)/g) ?? [part] : [part]))
          .map((s) => s.trim())
          .filter(Boolean);

        const chunks = sentences.length > 0 ? sentences : [message];
        chunks.forEach((chunk, index) => {
          const utterance = new SpeechSynthesisUtterance(chunk);
          utterance.lang = chosen ? chosen.lang : locale === "en" ? "en-US" : "id-ID";
          utterance.rate = overrideRate ?? rateRef.current;
          if (chosen) utterance.voice = chosen;

          if (index === 0) {
            utterance.onstart = () => setSpeaking(true);
          }
          if (index === chunks.length - 1) {
            utterance.onend = () => {
              setSpeaking(false);
              scheduleResumeAfterSpeech();
            };
            utterance.onerror = () => {
              setSpeaking(false);
              scheduleResumeAfterSpeech();
            };
          }
          window.speechSynthesis.speak(utterance);
        });
      } catch {
        setSpeaking(false);
        scheduleResumeAfterSpeech();
      }
    },
    [locale],
  );

  // Auto-announce page change when enabled
  useEffect(() => {
    if (!autoReadRef.current) return;
    const timer = window.setTimeout(() => {
      const summary = extractPageSummary(locale);
      if (summary) speak(summary);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [pathname, locale, speak]);

  const updateRate = useCallback((next: number) => {
    const clamped = Math.round(Math.max(0.5, Math.min(2.0, next)) * 100) / 100;
    setRate(clamped);
    try {
      window.localStorage.setItem(STORAGE_RATE, String(clamped));
    } catch {
      // Ignore
    }
    return clamped;
  }, []);

  const updateFontScale = useCallback((next: FontScale) => {
    setFontScale(next);
    try {
      window.localStorage.setItem(STORAGE_FONT, next);
    } catch {
      // Ignore
    }
  }, []);

  const updateContrast = useCallback((next: boolean) => {
    setHighContrast(next);
    try {
      if (next) {
        window.localStorage.setItem(STORAGE_CONTRAST, "high");
      } else {
        window.localStorage.removeItem(STORAGE_CONTRAST);
      }
    } catch {
      // Ignore
    }
  }, []);

  const updateReadable = useCallback((next: boolean) => {
    setReadableSpacing(next);
    try {
      if (next) {
        window.localStorage.setItem(STORAGE_READABLE, "true");
      } else {
        window.localStorage.removeItem(STORAGE_READABLE);
      }
    } catch {
      // Ignore
    }
  }, []);

  const resetAllA11y = useCallback(() => {
    updateFontScale("md");
    updateContrast(false);
    updateReadable(false);
  }, [updateContrast, updateFontScale, updateReadable]);

  const executeCommand = useCallback(
    (rawText: string) => {
      if (pendingEmergencyRef.current) {
        const confirmation = interpretConfirmation(rawText);
        if (confirmation === "yes") {
          pendingEmergencyRef.current = null;
          conversationActiveRef.current = false;
          setActiveEmergencyCall(PRIMARY_EMERGENCY_CONTACT);
          speak(
            locale === "en"
              ? "Calling BBTNGL Emergency Command Post now. Help is being connected."
              : "Menghubungkan panggilan darurat ke Posko Komando BBTNGL sekarang.",
            undefined,
            { resumeAfter: false },
          );
          return;
        }
        if (confirmation === "no") {
          pendingEmergencyRef.current = null;
          speak(
            locale === "en"
              ? "Emergency call cancelled. I am still listening if you need anything else."
              : "Panggilan darurat dibatalkan. Saya masih mendengarkan jika Anda membutuhkan hal lain.",
          );
          return;
        }
        speak(
          locale === "en"
            ? "Please say yes to call emergency services now, or say cancel to abort."
            : "Mohon ucapkan ya untuk menghubungi posko darurat sekarang, atau ucapkan batal untuk membatalkan.",
        );
        return;
      }

      const action = interpretVoiceCommand(rawText, locale, userRole);
      switch (action.type) {
        case "stop_speech":
          conversationActiveRef.current = false;
          pendingEmergencyRef.current = null;
          stopSpeaking();
          setFeedback(locale === "en" ? "Speech stopped." : "Suara dihentikan.");
          return;
        case "emergency_distress": {
          conversationActiveRef.current = true;
          pendingEmergencyRef.current = {
            emergencyType: action.emergencyType,
            transcript: action.transcript,
          };
          speak(
            locale === "en"
              ? "Emergency detected! Do you want me to call the BBTNGL Emergency Command Post right now? Please say yes or cancel."
              : "Keadaan darurat terdeteksi! Apakah Anda ingin saya langsung menelepon Posko Komando Darurat BBTNGL sekarang? Ucapkan ya atau batal.",
          );
          return;
        }
        case "list_commands":
          speak(summarizeAllowedRoutesForRole(userRole, locale));
          return;
        case "auth_required":
          speak(
            locale === "en"
              ? `Please sign in first before opening ${action.label}.`
              : `Silakan login terlebih dahulu untuk membuka halaman ${action.label}.`,
          );
          return;
        case "access_denied":
          speak(
            locale === "en"
              ? `Sorry, your role${userRole ? ` (${getRoleLabel("en", userRole)})` : ""} does not have access to ${action.label}.`
              : `Maaf, role Anda${userRole ? ` (${getRoleLabel("id", userRole)})` : ""} tidak memiliki izin untuk membuka halaman ${action.label}.`,
          );
          return;
        case "logout":
          if (!userRole) {
            speak(locale === "en" ? "You are not signed in yet." : "Anda belum masuk ke akun mana pun.");
            return;
          }
          conversationActiveRef.current = false;
          speak(
            locale === "en" ? "Signing you out now." : "Mengeluarkan Anda dari akun sekarang.",
            undefined,
            { resumeAfter: false },
          );
          void logout();
          return;
        case "read_page": {
          const summary = extractPageSummary(locale);
          speak(
            summary ||
              (locale === "en"
                ? "Unable to read page content."
                : "Konten halaman tidak ditemukan."),
          );
          return;
        }
        case "navigate":
          speak(
            locale === "en"
              ? `Navigating to ${action.label}.`
              : `Mengarahkan ke ${action.label}.`,
          );
          router.push(action.href);
          return;
        case "history":
          if (action.direction === "back") {
            speak(locale === "en" ? "Going back." : "Kembali ke halaman sebelumnya.");
            router.back();
          } else {
            speak(locale === "en" ? "Going forward." : "Maju ke halaman berikutnya.");
            router.forward();
          }
          return;
        case "scroll":
          if (action.direction === "top") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            speak(locale === "en" ? "Scrolled to top." : "Digulir ke paling atas.");
          } else if (action.direction === "bottom") {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
            speak(locale === "en" ? "Scrolled to bottom." : "Digulir ke paling bawah.");
          } else {
            window.scrollBy({
              top: action.direction === "down" ? 420 : -420,
              behavior: "smooth",
            });
            speak(
              action.direction === "down"
                ? locale === "en"
                  ? "Scrolled down."
                  : "Menggulir ke bawah."
                : locale === "en"
                  ? "Scrolled up."
                  : "Menggulir ke atas.",
            );
          }
          return;
        case "set_theme": {
          try {
            window.localStorage.setItem("color-scheme", action.scheme);
          } catch {
            // Ignore
          }
          const meta = document.querySelector('meta[name="color-scheme"]');
          if (meta) meta.setAttribute("content", action.scheme);
          speak(
            action.scheme === "dark"
              ? locale === "en"
                ? "Dark mode enabled."
                : "Mode gelap diaktifkan."
              : locale === "en"
                ? "Light mode enabled."
                : "Mode terang diaktifkan.",
          );
          return;
        }
        case "set_locale":
          setLocale(action.locale);
          speak(
            action.locale === "en"
              ? "Language switched to English."
              : "Bahasa diganti ke Bahasa Indonesia.",
          );
          return;
        case "set_rate": {
          const next = action.exact ?? rateRef.current + (action.delta ?? 0);
          const applied = updateRate(next);
          speak(
            locale === "en"
              ? `Speech speed set to ${applied} times.`
              : `Kecepatan bicara diatur ke ${applied} kali.`,
            applied,
          );
          return;
        }
        case "set_contrast":
          updateContrast(action.high);
          speak(
            action.high
              ? locale === "en"
                ? "High contrast enabled."
                : "Kontras tinggi diaktifkan."
              : locale === "en"
                ? "Normal contrast restored."
                : "Kontras normal dikembalikan.",
          );
          return;
        case "set_font_scale":
          updateFontScale(action.scale);
          speak(
            locale === "en"
              ? `Text size set to ${action.scale === "xl" ? "extra large" : action.scale === "lg" ? "large" : "normal"}.`
              : `Ukuran tulisan diatur ke ${action.scale === "xl" ? "ekstra besar" : action.scale === "lg" ? "besar" : "normal"}.`,
          );
          return;
        case "reset_a11y":
          resetAllA11y();
          speak(
            locale === "en"
              ? "Visual accessibility settings reset."
              : "Pengaturan tampilan aksesibilitas direset.",
          );
          return;
        case "click_element": {
          const clicked = clickMatchingElement(action.query);
          speak(
            clicked
              ? locale === "en"
                ? `Clicked ${clicked}.`
                : `Menekan ${clicked}.`
              : locale === "en"
                ? `Could not find button or link matching ${action.query}.`
                : `Tidak menemukan tombol atau tautan bernama ${action.query}.`,
          );
          return;
        }
        case "fill_input": {
          const filled = fillMatchingInput(action.field, action.value);
          speak(
            filled
              ? locale === "en"
                ? `Filled ${filled}.`
                : `Mengisi kolom ${filled}.`
              : locale === "en"
                ? `Could not find field ${action.field}.`
                : `Kolom ${action.field} tidak ditemukan.`,
          );
          return;
        }
        case "unknown":
          speak(
            locale === "en"
              ? `I heard "${action.transcript}", but did not recognize that command. Say help for available commands.`
              : `Saya mendengar "${action.transcript}", namun perintah belum dikenali. Ucapkan bantuan untuk daftar perintah.`,
          );
      }
    },
    [
      locale,
      logout,
      resetAllA11y,
      router,
      setLocale,
      speak,
      stopSpeaking,
      updateContrast,
      updateFontScale,
      updateRate,
      userRole,
    ],
  );

  const stopListening = useCallback(() => {
    conversationActiveRef.current = false;
    pendingEmergencyRef.current = null;
    wantListeningRef.current = false;
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (resumeListenTimerRef.current !== null) {
      window.clearTimeout(resumeListenTimerRef.current);
      resumeListenTimerRef.current = null;
    }
    const current = recognitionRef.current;
    recognitionRef.current = null;
    if (current) {
      current.onstart = null;
      current.onend = null;
      current.onerror = null;
      current.onresult = null;
      try {
        current.stop();
      } catch {
        // Ignore
      }
    }
    setListening(false);
    const captured = latestTranscriptRef.current.trim();
    latestTranscriptRef.current = "";
    if (captured) {
      executeCommand(captured);
    }
  }, [executeCommand]);

  const startListening = useCallback(() => {
    conversationActiveRef.current = true;
    const win = window as SpeechWindow;
    const Ctor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!Ctor) {
      setSpeechSupported(false);
      speak(
        locale === "en"
          ? "Speech recognition is not supported in this browser. Please type your command below."
          : "Pengenalan suara tidak didukung di browser ini. Silakan ketik perintah Anda di kolom bawah.",
      );
      return;
    }

    stopSpeaking();
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    const previous = recognitionRef.current;
    recognitionRef.current = null;
    if (previous) {
      previous.onstart = null;
      previous.onend = null;
      previous.onerror = null;
      previous.onresult = null;
      try {
        previous.abort();
      } catch {
        // Ignore
      }
    }

    const recognition = new Ctor();
    recognition.lang = locale === "en" ? "en-US" : "id-ID";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    wantListeningRef.current = true;
    fatalErrorRef.current = false;
    latestTranscriptRef.current = "";
    recognitionRef.current = recognition;
    setListening(true);
    setTranscript("");
    setFeedback(
      locale === "en" ? "Listening... Speak now." : "Mendengarkan... Silakan bicara.",
    );

    recognition.onstart = () => {
      if (recognitionRef.current !== recognition) return;
      setListening(true);
    };

    recognition.onresult = (event) => {
      if (recognitionRef.current !== recognition) return;
      let combined = "";
      let isFinal = false;
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        if (res[0]?.transcript) {
          combined += res[0].transcript;
        }
        if (res.isFinal) isFinal = true;
      }
      latestTranscriptRef.current = combined;
      setTranscript(combined);
      if (isFinal && combined.trim()) {
        wantListeningRef.current = false;
        latestTranscriptRef.current = "";
        recognitionRef.current = null;
        recognition.onstart = null;
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;
        try {
          recognition.stop();
        } catch {
          // Ignore
        }
        setListening(false);
        executeCommand(combined);
      }
    };

    recognition.onerror = (event) => {
      if (recognitionRef.current !== recognition) return;

      if (event.error === "aborted") {
        return;
      }

      if (event.error === "no-speech") {
        setFeedback(
          locale === "en"
            ? "No speech detected yet, still listening..."
            : "Belum ada suara terdeteksi, masih mendengarkan...",
        );
        return;
      }

      fatalErrorRef.current = true;
      wantListeningRef.current = false;
      setListening(false);

      let errMsg: string;
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        errMsg =
          locale === "en"
            ? "Microphone permission was denied. Please allow microphone access in your browser."
            : "Izin mikrofon ditolak. Harap izinkan akses mikrofon di browser Anda.";
      } else if (event.error === "audio-capture") {
        errMsg =
          locale === "en"
            ? "No microphone device was found on this computer."
            : "Perangkat mikrofon tidak ditemukan pada komputer ini.";
      } else if (event.error === "network") {
        errMsg =
          locale === "en"
            ? "Browser speech service is offline or blocked here. Use Google Chrome/Edge or type commands below."
            : "Layanan suara browser tidak terhubung di sini. Gunakan Chrome/Edge atau ketik perintah di kolom bawah.";
      } else {
        errMsg =
          locale === "en"
            ? "Could not hear clearly. Please try again."
            : "Suara tidak terdengar jelas. Silakan coba lagi.";
      }
      speak(errMsg);
    };

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;

      if (wantListeningRef.current && !fatalErrorRef.current) {
        restartTimerRef.current = window.setTimeout(() => {
          restartTimerRef.current = null;
          if (!wantListeningRef.current || recognitionRef.current !== recognition) return;
          try {
            recognition.start();
          } catch {
            wantListeningRef.current = false;
            setListening(false);
          }
        }, 150);
        return;
      }

      recognitionRef.current = null;
      setListening(false);
    };

    try {
      recognition.start();
    } catch {
      wantListeningRef.current = false;
      recognitionRef.current = null;
      setListening(false);
    }
  }, [executeCommand, locale, speak, stopSpeaking]);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      setOpen(true);
      startListening();
    }
  }, [listening, startListening, stopListening]);

  // Global keyboard shortcuts: Alt+A (toggle panel), Alt+V (toggle voice), Escape (stop/close)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.altKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        toggleListening();
      } else if (e.key === "Escape") {
        stopSpeaking();
        stopListening();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stopListening, stopSpeaking, toggleListening]);

  const toggleBtnLabel =
    locale === "en"
      ? "Accessibility & Voice AI Assistant (Alt+A)"
      : "Aksesibilitas & Asisten Suara AI (Alt+A)";

  return (
    <>
      {/* Unique Right-Edge Docked Accessibility & Voice AI Tab */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="a11y-voice-dialog"
        aria-label={toggleBtnLabel}
        title={toggleBtnLabel}
        className={cn(
          "group fixed bottom-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))] right-0 z-50 flex flex-col items-center gap-1 rounded-l-2xl rounded-r-none border-y border-l border-r-0 bg-primary py-2.5 pl-2.5 pr-2 text-white shadow-2xl transition-all duration-200 hover:pl-3.5 hover:pr-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/50 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2",
          listening
            ? "border-rose-400 ring-4 ring-rose-500/40"
            : "border-amber-400/55 hover:bg-primary-dark",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-2.5 left-1 w-1 rounded-full transition-colors",
            listening ? "bg-rose-400 animate-pulse" : "bg-amber-400",
          )}
        />
        <VoiceA11yEmblem listening={listening} className="ml-1.5" />
        <span className="ml-1.5 font-mono text-[9px] font-bold tracking-widest text-amber-200">
          {locale === "en" ? "VOICE" : "SUARA"}
        </span>
      </button>

      {/* Accessible Voice & Visual Aids Panel */}
      {open ? (
        <section
          id="a11y-voice-dialog"
          role="dialog"
          aria-modal="false"
          aria-label={
            locale === "en"
              ? "Accessibility & Voice AI Assistant"
              : "Aksesibilitas & Asisten Suara AI"
          }
          className="fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-50 flex max-h-[min(85dvh,calc(100dvh-1rem))] flex-col gap-3 overflow-y-auto overscroll-contain rounded-2xl border border-line bg-surface p-4 text-ink shadow-2xl sm:inset-x-auto sm:bottom-auto sm:right-16 sm:top-1/2 sm:max-h-[calc(100dvh-2.5rem)] sm:w-[min(23rem,calc(100vw-4.5rem))] sm:-translate-y-1/2"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-line pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                <VoiceA11yEmblem listening={listening} className="size-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-ink">
                  {locale === "en" ? "Voice & Accessibility AI" : "Asisten Suara & Disabilitas"}
                </h2>
                <p className="text-[11px] text-muted">
                  Alt+A {locale === "en" ? "panel" : "panel"} · Alt+V {locale === "en" ? "mic" : "mikrofon"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("closeNav")}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-line text-ink-soft hover:bg-surface-muted"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          {/* Voice Mic Primary Control */}
          <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface-muted p-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-white transition",
                  listening
                    ? "bg-rose-600 hover:bg-rose-500"
                    : "bg-primary hover:bg-primary-dark",
                )}
              >
                {listening ? (
                  <>
                    <MicOff aria-hidden="true" className="size-4" />
                    <span>{locale === "en" ? "Stop Listening" : "Berhenti Mendengarkan"}</span>
                  </>
                ) : (
                  <>
                    <Mic aria-hidden="true" className="size-4" />
                    <span>{locale === "en" ? "Start Speaking (Alt+V)" : "Mulai Bicara (Alt+V)"}</span>
                  </>
                )}
              </button>
              {speaking ? (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  aria-label={locale === "en" ? "Stop speaking" : "Hentikan suara"}
                  className="inline-flex size-9 items-center justify-center rounded-xl border border-line bg-surface text-ink hover:bg-danger-soft hover:text-danger"
                >
                  <Square aria-hidden="true" className="size-4" />
                </button>
              ) : null}
            </div>

            {!speechSupported ? (
              <p className="text-[11px] text-warning">
                {locale === "en"
                  ? "Mic speech recognition is unavailable in this browser; use text commands below."
                  : "Mikrofon suara tidak tersedia di browser ini; gunakan kolom perintah teks di bawah."}
              </p>
            ) : null}

            {/* Live Transcript & Spoken Feedback */}
            <div
              aria-live="polite"
              className="rounded-lg border border-line bg-surface px-2.5 py-2 text-xs leading-relaxed text-ink-soft"
            >
              {transcript ? (
                <p className="mb-1 font-medium text-ink">
                  &ldquo;{transcript}&rdquo;
                </p>
              ) : null}
              <p>
                {feedback ||
                  (locale === "en"
                    ? 'Press Start Speaking and say e.g. "open user manual", "read this page", or "help".'
                    : 'Tekan Mulai Bicara lalu ucapkan mis. "buka panduan pengguna", "bacakan halaman", atau "bantuan".')}
              </p>
            </div>

            {/* Text command fallback */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!textCommand.trim()) return;
                const cmd = textCommand.trim();
                setTranscript(cmd);
                setTextCommand("");
                executeCommand(cmd);
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={textCommand}
                onChange={(e) => setTextCommand(e.target.value)}
                placeholder={
                  locale === "en"
                    ? 'Type command (e.g. "read page")...'
                    : 'Ketik perintah (mis. "bacakan halaman")...'
                }
                aria-label={locale === "en" ? "Text voice command" : "Perintah teks asisten"}
                className="ui-input h-9 text-xs"
              />
              <button
                type="submit"
                aria-label={locale === "en" ? "Run command" : "Jalankan perintah"}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-dark"
              >
                <Send aria-hidden="true" className="size-3.5" />
              </button>
            </form>
          </div>

          {/* Voice Model & Speed Controls (jatimbissa.id style) */}
          <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-surface p-3">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="a11y-voice-select" className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <Volume2 aria-hidden="true" className="size-3.5 text-primary" />
                <span>{locale === "en" ? "Voice Model" : "Model Suara"}</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  speak(
                    locale === "en"
                      ? "Hello, this is the Wildlife Monitoring System voice assistant."
                      : "Halo, ini adalah asisten suara Sistem Monitoring Satwa Liar.",
                  )
                }
                className="rounded-md border border-line px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-surface-muted"
              >
                {locale === "en" ? "Test Voice" : "Uji Suara"}
              </button>
            </div>

            <select
              id="a11y-voice-select"
              value={selectedVoiceURI}
              onChange={(e) => {
                const uri = e.target.value;
                setSelectedVoiceURI(uri);
                voiceUriRef.current = uri;
                try {
                  window.localStorage.setItem(STORAGE_VOICE, uri);
                } catch {
                  // Ignore
                }
              }}
              className="ui-input h-9 text-xs"
            >
              {voices.length === 0 ? (
                <option value="">
                  {locale === "en" ? "Default System Voice" : "Suara Bawaan Sistem"}
                </option>
              ) : (
                voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))
              )}
            </select>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="a11y-rate-slider" className="font-semibold text-ink-soft">
                  {locale === "en" ? "Speech Speed" : "Kecepatan Bicara"}
                </label>
                <span className="font-mono text-xs font-bold text-primary">
                  {rate.toFixed(2)}×
                </span>
              </div>
              <input
                id="a11y-rate-slider"
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={rate}
                onChange={(e) => updateRate(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="grid grid-cols-4 gap-1">
                {RATE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={Math.abs(rate - preset) < 0.03}
                    onClick={() => updateRate(preset)}
                    className={cn(
                      "rounded-md border py-1 font-mono text-[11px] font-semibold transition",
                      Math.abs(rate - preset) < 0.03
                        ? "border-primary bg-primary text-white"
                        : "border-line bg-surface-muted text-ink-soft hover:border-primary",
                    )}
                  >
                    {preset}×
                  </button>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 pt-0.5 text-xs text-ink-soft">
              <input
                type="checkbox"
                checked={autoRead}
                onChange={(e) => {
                  const next = e.target.checked;
                  setAutoRead(next);
                  try {
                    if (next) {
                      window.localStorage.setItem(STORAGE_AUTOREAD, "true");
                    } else {
                      window.localStorage.removeItem(STORAGE_AUTOREAD);
                    }
                  } catch {
                    // Ignore
                  }
                }}
                className="size-4 rounded border-line accent-primary"
              />
              <span>
                {locale === "en"
                  ? "Auto-read page when navigating"
                  : "Bacakan halaman otomatis saat berpindah"}
              </span>
            </label>
          </div>

          {/* Quick Page Reading & Visual Accessibility Aids */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => executeCommand("bacakan halaman")}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-surface-muted px-2.5 py-2 text-xs font-semibold text-ink hover:border-primary"
            >
              <BookOpen aria-hidden="true" className="size-3.5 text-primary" />
              <span>{locale === "en" ? "Read Page" : "Bacakan Halaman"}</span>
            </button>
            <button
              type="button"
              onClick={() => executeCommand("bantuan")}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-surface-muted px-2.5 py-2 text-xs font-semibold text-ink hover:border-primary"
            >
              <Volume2 aria-hidden="true" className="size-3.5 text-primary" />
              <span>{locale === "en" ? "Commands" : "Daftar Perintah"}</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <Type aria-hidden="true" className="size-3.5 text-primary" />
                <span>{locale === "en" ? "Visual Aids" : "Bantuan Tampilan"}</span>
              </span>
              <button
                type="button"
                onClick={resetAllA11y}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted hover:text-ink"
              >
                <RotateCcw aria-hidden="true" className="size-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "md", label: "100%" },
                  { id: "lg", label: "115%" },
                  { id: "xl", label: "130%" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={fontScale === opt.id}
                  onClick={() => updateFontScale(opt.id)}
                  className={cn(
                    "rounded-lg border py-1.5 text-xs font-bold transition",
                    fontScale === opt.id
                      ? "border-primary bg-primary text-white"
                      : "border-line bg-surface-muted text-ink-soft hover:border-primary",
                  )}
                >
                  A {opt.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                aria-pressed={highContrast}
                onClick={() => updateContrast(!highContrast)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition",
                  highContrast
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-surface-muted text-ink-soft hover:border-primary",
                )}
              >
                <Contrast aria-hidden="true" className="size-3.5" />
                <span>{locale === "en" ? "High Contrast" : "Kontras Tinggi"}</span>
              </button>
              <button
                type="button"
                aria-pressed={readableSpacing}
                onClick={() => updateReadable(!readableSpacing)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition",
                  readableSpacing
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-surface-muted text-ink-soft hover:border-primary",
                )}
              >
                <Type aria-hidden="true" className="size-3.5" />
                <span>{locale === "en" ? "Spaced Text" : "Spasi Lega"}</span>
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <EmergencyCallModal
        key={activeEmergencyCall ? activeEmergencyCall.phone : "closed"}
        contact={activeEmergencyCall}
        onClose={() => setActiveEmergencyCall(null)}
      />
    </>
  );
}
