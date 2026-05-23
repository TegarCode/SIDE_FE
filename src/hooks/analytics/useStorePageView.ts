import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { storePageView } from "@/service/analytics/pageView";
import { resolvePageViewModule } from "@/utils/pageView";

const CLIENT_DEDUP_WINDOW_MS = 10_000;

export function useStorePageView() {
  const location = useLocation();
  const lastTrackedRef = useRef<{
    key: string;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    const path = location.pathname;
    const module = resolvePageViewModule(path);

    if (!module) {
      return;
    }

    const trackingKey = `${path}::${module}`;
    const now = Date.now();
    const lastTracked = lastTrackedRef.current;

    if (
      lastTracked &&
      lastTracked.key === trackingKey &&
      now - lastTracked.timestamp < CLIENT_DEDUP_WINDOW_MS
    ) {
      return;
    }

    lastTrackedRef.current = {
      key: trackingKey,
      timestamp: now
    };

    void storePageView({ path, module }).catch(() => undefined);
  }, [location.pathname]);
}
