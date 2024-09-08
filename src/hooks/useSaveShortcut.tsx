import { useEffect, useMemo } from "react";

export default function useSaveShortcut(onSave: () => void) {
  const isMac = useMemo(
    () => navigator.platform.toUpperCase().indexOf("MAC") >= 0,
    [],
  );

  useEffect(() => {
    const handleSaveShortcut = (event: KeyboardEvent) => {
      if (
        (isMac ? event.metaKey : event.ctrlKey) &&
        !event.shiftKey &&
        !event.altKey &&
        event.key.toLowerCase() === "s"
      ) {
        event.preventDefault();
        onSave();
      }
    };

    window.addEventListener("keydown", handleSaveShortcut);

    return () => {
      window.removeEventListener("keydown", handleSaveShortcut);
    };
  }, [onSave, isMac]);
}
