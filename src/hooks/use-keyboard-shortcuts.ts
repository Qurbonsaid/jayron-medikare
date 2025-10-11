import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ShortcutConfig {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      let shortcutKey = "";
      if (ctrl) shortcutKey += "ctrl+";
      if (shift) shortcutKey += "shift+";
      shortcutKey += key;

      if (shortcuts[shortcutKey]) {
        e.preventDefault();
        shortcuts[shortcutKey]();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [shortcuts, enabled]);
}

export function useGlobalShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    let gPressed = false;
    let timeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Handle 'G' key for navigation shortcuts
      if (key === "g") {
        gPressed = true;
        timeout = setTimeout(() => {
          gPressed = false;
        }, 1000);
        return;
      }

      // Handle 'G + X' combinations
      if (gPressed) {
        e.preventDefault();
        switch (key) {
          case "h":
            navigate("/");
            break;
          case "p":
            navigate("/patients");
            break;
          case "a":
            navigate("/appointments");
            break;
          case "l":
            navigate("/lab-results");
            break;
        }
        gPressed = false;
        clearTimeout(timeout);
      }

      // Handle standalone shortcuts
      if (key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        // This will be handled by the component that shows shortcuts dialog
        window.dispatchEvent(new CustomEvent("show-shortcuts"));
      }

      if (key === "n" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        navigate("/patients/new");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      clearTimeout(timeout);
    };
  }, [navigate]);
}
