import { useState, useEffect } from "react";
import { quadrantIndex } from "./utils";

export const useFocus = () => {
  const [focus, setFocus] = useState<{ r: number; c: number } | null>(null);

  useEffect(() => {
    if (focus) {
      let id = `r${focus?.r},c${focus?.c},q${quadrantIndex(focus.r, focus.c)}`;
      document.getElementById(id)?.focus();
    }
  }, [focus]);

  return { focus, setFocus };
};
