import { api } from "@/services/api";
import type { AppLocale } from "@/lib/i18n";
import type { ApiResponse } from "@/types/api.type";

export type VoiceChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type VoiceChatAction =
  | { type: "none" }
  | { type: "navigate"; href: string; label?: string }
  | { type: "set_theme"; scheme: "light" | "dark" }
  | { type: "set_locale"; locale: AppLocale }
  | { type: "set_font_scale"; scale: "md" | "lg" | "xl" }
  | { type: "set_contrast"; high: boolean }
  | { type: "reset_a11y" }
  | { type: "scroll"; direction: "up" | "down" | "top" | "bottom" }
  | { type: "history"; direction: "back" | "forward" }
  | { type: "read_page" }
  | { type: "click_element"; query: string }
  | { type: "fill_input"; field: string; value: string }
  | { type: "trigger_sos"; emergency_type?: string }
  | { type: "logout" };

export type VoiceChatPayload = {
  message: string;
  locale: AppLocale;
  current_path?: string;
  page_context?: string;
  allowed_routes?: Array<{ href: string; label: string }>;
  history?: VoiceChatHistoryItem[];
};

export type VoiceChatData = {
  reply: string;
  action: VoiceChatAction;
  model?: string | null;
  fallback: boolean;
};

export async function sendVoiceChat(
  payload: VoiceChatPayload,
): Promise<VoiceChatData | null> {
  try {
    const response = await api.post<ApiResponse<VoiceChatData>>(
      "/voice-assistant/chat",
      { body: payload, timeoutMs: 15000 },
    );

    if (!response?.data) {
      return null;
    }

    return response.data;
  } catch {
    return null;
  }
}
