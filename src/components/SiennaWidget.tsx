import { useEffect } from "react";
import { env } from "@/constants/env";

export function SiennaWidget() {
  useEffect(() => {
    const accountKey =
      env.userwayAccountKey?.trim() || "YOUR_USERWAY_ACCOUNT_KEY";

    const existingScript = document.querySelector(
      `script[data-userway-account="${accountKey}"]`
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.userway.org/widget.js";
    script.async = true;
    script.setAttribute("data-userway-account", accountKey);
    script.setAttribute("data-position", "5");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-language", "id");
    script.setAttribute("data-color", "#384AA0");

    document.head.appendChild(script);
  }, []);

  return null;
}
