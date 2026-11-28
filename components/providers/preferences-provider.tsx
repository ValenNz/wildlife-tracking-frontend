"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { translateIdToEn } from "@/lib/auto-translate";
import { DEFAULT_LOCALE, MESSAGES, type AppLocale, type MessageKey } from "@/lib/i18n";
import type { TYPE_USER_ROLE } from "@/types/auth.type";

const LOCALE_STORAGE_KEY = "app-locale";
const LOCALE_EVENT = "app-locale-change";

type PreferencesContextValue = {
  locale: AppLocale;
  setLocale: (next: AppLocale) => void;
  toggleLocale: () => void;
  userRole: TYPE_USER_ROLE | null;
  setUserRole: (role: TYPE_USER_ROLE | null) => void;
  t: (key: MessageKey) => string;
};

const PreferencesContext = createContext<PreferencesContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
  toggleLocale: () => undefined,
  userRole: null,
  setUserRole: () => undefined,
  t: (key) => MESSAGES[DEFAULT_LOCALE][key],
});

const readStoredLocale = (): AppLocale => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY) === "en" ? "en" : "id";
  } catch {
    return DEFAULT_LOCALE;
  }
};

const subscribeLocale = (onStoreChange: () => void) => {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LOCALE_STORAGE_KEY) onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(LOCALE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(LOCALE_EVENT, onStoreChange);
  };
};

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "CODE", "PRE", "NOSCRIPT", "TEXTAREA"]);
const ATTRS = ["placeholder", "title", "aria-label"] as const;

function shouldSkipElement(el: Element | null): boolean {
  let cur: Element | null = el;
  while (cur) {
    if (SKIP_TAGS.has(cur.tagName)) return true;
    if (cur.getAttribute("data-no-translate") === "true") return true;
    cur = cur.parentElement;
  }
  return false;
}

function DomTranslator({ locale }: { locale: AppLocale }) {
  useEffect(() => {
    const root = document.body;
    if (!root) return;

    const textRecords = new WeakMap<Text, { original: string; translated: string }>();
    const attrRecords = new WeakMap<Element, Map<string, { original: string; translated: string }>>();
    const trackedNodes = new Set<Text>();
    const trackedElements = new Set<Element>();

    const processTextNode = (node: Text, targetLocale: AppLocale) => {
      if (shouldSkipElement(node.parentElement)) return;
      const current = node.nodeValue ?? "";
      if (!current.trim()) return;

      const existing = textRecords.get(node);
      if (targetLocale === "id") {
        if (existing && current === existing.translated) {
          node.nodeValue = existing.original;
        }
        return;
      }

      const original = existing && current === existing.translated ? existing.original : current;
      const translated = translateIdToEn(original);
      if (translated !== original) {
        textRecords.set(node, { original, translated });
        trackedNodes.add(node);
        if (current !== translated) {
          node.nodeValue = translated;
        }
      }
    };

    const processElementAttrs = (el: Element, targetLocale: AppLocale) => {
      if (shouldSkipElement(el)) return;
      let map = attrRecords.get(el);

      for (const attr of ATTRS) {
        const current = el.getAttribute(attr);
        if (!current || !current.trim()) continue;
        const existing = map?.get(attr);

        if (targetLocale === "id") {
          if (existing && current === existing.translated) {
            el.setAttribute(attr, existing.original);
          }
          continue;
        }

        const original = existing && current === existing.translated ? existing.original : current;
        const translated = translateIdToEn(original);
        if (translated !== original) {
          if (!map) {
            map = new Map();
            attrRecords.set(el, map);
          }
          map.set(attr, { original, translated });
          trackedElements.add(el);
          if (current !== translated) {
            el.setAttribute(attr, translated);
          }
        }
      }
    };

    const walk = (node: Node, targetLocale: AppLocale) => {
      if (node.nodeType === Node.TEXT_NODE) {
        processTextNode(node as Text, targetLocale);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as Element;
      if (shouldSkipElement(el)) return;
      processElementAttrs(el, targetLocale);
      for (let i = 0; i < el.childNodes.length; i += 1) {
        walk(el.childNodes[i], targetLocale);
      }
    };

    if (locale === "id") {
      return undefined;
    }

    let applying = true;
    walk(root, "en");
    applying = false;

    const observer = new MutationObserver((mutations) => {
      if (applying) return;
      applying = true;
      try {
        for (const mutation of mutations) {
          if (mutation.type === "characterData") {
            processTextNode(mutation.target as Text, "en");
          } else if (mutation.type === "attributes" && mutation.target.nodeType === Node.ELEMENT_NODE) {
            processElementAttrs(mutation.target as Element, "en");
          } else if (mutation.type === "childList") {
            mutation.addedNodes.forEach((added) => walk(added, "en"));
          }
        }
      } finally {
        applying = false;
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRS],
    });

    return () => {
      observer.disconnect();
      applying = true;
      trackedNodes.forEach((node) => {
        if (node.isConnected) {
          const rec = textRecords.get(node);
          if (rec && node.nodeValue === rec.translated) {
            node.nodeValue = rec.original;
          }
        }
      });
      trackedElements.forEach((el) => {
        if (el.isConnected) {
          const map = attrRecords.get(el);
          map?.forEach((rec, attr) => {
            if (el.getAttribute(attr) === rec.translated) {
              el.setAttribute(attr, rec.original);
            }
          });
        }
      });
      applying = false;
    };
  }, [locale]);

  return null;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    readStoredLocale,
    () => DEFAULT_LOCALE,
  );
  const [userRole, setUserRole] = useState<TYPE_USER_ROLE | null>(null);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: AppLocale) => {
    document.documentElement.lang = next;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {

    }
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "id" ? "en" : "id");
  }, [locale, setLocale]);

  const t = useCallback((key: MessageKey) => MESSAGES[locale][key], [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      userRole,
      setUserRole,
      t,
    }),
    [locale, setLocale, toggleLocale, userRole, t],
  );

  return (
    <PreferencesContext.Provider value={value}>
      <DomTranslator locale={locale} />
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => useContext(PreferencesContext);

const UserRoleContext = createContext<TYPE_USER_ROLE | null>(null);

export function UserRoleProvider({ role, children }: { role: TYPE_USER_ROLE; children: ReactNode }) {
  const { setUserRole } = usePreferences();

  useEffect(() => {
    setUserRole(role);
    return () => setUserRole(null);
  }, [role, setUserRole]);

  return <UserRoleContext.Provider value={role}>{children}</UserRoleContext.Provider>;
}

export const useUserRole = () => useContext(UserRoleContext);
