import { useCallback, useEffect, useState } from "react";
import { QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";

export type GuidedTourStep = {
  selector: string;
  title: string;
  description: string;
};

type GuidedTourProps = {
  steps: readonly GuidedTourStep[];
  storageKey: string;
  launcherLabel?: string;
  coachmarkLabel?: string;
  viewportGap?: number;
  spotlightZIndex?: number;
  coachmarkZIndex?: number;
  launcherZIndex?: number;
};

function getHeaderSafeTop(viewportGap: number) {
  if (typeof window === "undefined") {
    return 72;
  }

  const header = document.querySelector("header");
  const headerHeight =
    header instanceof HTMLElement ? header.getBoundingClientRect().height : 56;

  return headerHeight + viewportGap;
}

function getSpotlightStyle(rect: DOMRect | null, viewportGap: number) {
  if (!rect || typeof window === "undefined") {
    return { opacity: 0 };
  }

  const safeTop = getHeaderSafeTop(viewportGap);
  const top = Math.max(rect.top - 10, safeTop);
  const left = Math.max(rect.left - 10, 12);
  const width = Math.min(rect.width + 20, window.innerWidth - left - 12);
  const height = Math.max(rect.bottom - top + 10, 36);

  return {
    top,
    left,
    width,
    height,
    opacity: 1
  };
}

function getCoachmarkStyle(rect: DOMRect | null, viewportGap: number) {
  const fallbackWidth =
    typeof window === "undefined" ? 360 : Math.min(360, window.innerWidth - 32);

  if (!rect || typeof window === "undefined") {
    return {
      top: 88,
      left: 16,
      width: fallbackWidth
    };
  }

  const safeTop = getHeaderSafeTop(viewportGap);
  const width = Math.min(360, window.innerWidth - 32);
  const prefersBottom = rect.bottom + 260 < window.innerHeight;
  const top = prefersBottom
    ? Math.max(rect.bottom + 18, safeTop)
    : Math.max(rect.top - 220, safeTop);
  const left = Math.min(
    Math.max(rect.left, 16),
    Math.max(window.innerWidth - width - 16, 16)
  );

  return { top, left, width };
}

export function GuidedTour({
  steps,
  storageKey,
  launcherLabel = "Tur Halaman",
  coachmarkLabel = "Panduan halaman",
  viewportGap = 16,
  spotlightZIndex = 60,
  coachmarkZIndex = 70,
  launcherZIndex = 40
}: GuidedTourProps) {
  const [isTourOpen, setIsTourOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(storageKey) !== "true";
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [activeRect, setActiveRect] = useState<DOMRect | null>(null);
  const [isLauncherVisible, setIsLauncherVisible] = useState(true);

  const currentStep = steps[stepIndex];

  const updateActiveRect = useCallback(() => {
    if (!isTourOpen || !currentStep) {
      setActiveRect(null);
      return;
    }

    const element = document.querySelector(currentStep.selector);
    if (!(element instanceof HTMLElement)) {
      setActiveRect(null);
      return;
    }

    setActiveRect(element.getBoundingClientRect());
  }, [currentStep, isTourOpen]);

  useEffect(() => {
    if (!isTourOpen || !currentStep) return;

    const element = document.querySelector(currentStep.selector);
    if (element instanceof HTMLElement) {
      element.scrollIntoView({
        behavior: "smooth",
        block: stepIndex === 0 ? "start" : "center"
      });

      const safeTop = getHeaderSafeTop(viewportGap);
      const nextTop = element.getBoundingClientRect().top;

      if (nextTop < safeTop) {
        window.scrollBy({
          top: nextTop - safeTop - viewportGap,
          behavior: "smooth"
        });
      }
    }

    const timer = window.setTimeout(updateActiveRect, 280);
    return () => window.clearTimeout(timer);
  }, [currentStep, isTourOpen, stepIndex, updateActiveRect, viewportGap]);

  useEffect(() => {
    if (!isTourOpen) return;

    const frame = window.requestAnimationFrame(() => {
      updateActiveRect();
    });

    const handleViewportChange = () => updateActiveRect();

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isTourOpen, updateActiveRect]);

  const closeTour = useCallback(
    (markCompleted: boolean) => {
      setIsTourOpen(false);
      setActiveRect(null);
      setStepIndex(0);

      if (markCompleted) {
        window.localStorage.setItem(storageKey, "true");
      }
    },
    [storageKey]
  );

  const openTour = useCallback(() => {
    setStepIndex(0);
    setIsTourOpen(true);
  }, []);

  const handleNextStep = useCallback(() => {
    if (stepIndex === steps.length - 1) {
      closeTour(true);
      return;
    }

    setStepIndex((previous) => previous + 1);
  }, [closeTour, stepIndex, steps.length]);

  if (steps.length === 0 || !currentStep) {
    return null;
  }

  return (
    <>
      {!isTourOpen && isLauncherVisible ? (
        <div
          className="fixed bottom-28 right-3 flex items-center gap-1.5 rounded-full border border-[#D7DEFF] bg-white/95 p-1 shadow-[0_10px_30px_rgba(17,27,79,0.12)] backdrop-blur sm:bottom-35 sm:right-4"
          style={{ zIndex: launcherZIndex }}
        >
          <Button
            type="button"
            onClick={openTour}
            rounded="full"
            className="rounded-full bg-transparent px-3 py-2 text-xs font-semibold text-[#162360] transition hover:bg-[#EEF2FF]"
          >
            <QuestionMarkCircleIcon className="mr-1.5 h-4 w-4" />
            {launcherLabel}
          </Button>
          <Button
            type="button"
            onClick={() => setIsLauncherVisible(false)}
            rounded="full"
            variant="ghost"
            className="h-7 w-7 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup tombol tur halaman"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : null}

      {isTourOpen ? (
        <>
          <div
            className="pointer-events-none fixed rounded-2xl border-2 border-white/90 bg-transparent transition-all duration-300"
            style={{
              ...getSpotlightStyle(activeRect, viewportGap),
              zIndex: spotlightZIndex,
              boxShadow: activeRect
                ? "0 0 0 9999px rgba(15, 23, 42, 0.45)"
                : undefined
            }}
          />

          <div
            className="fixed rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl transition-all duration-300"
            style={{
              ...getCoachmarkStyle(activeRect, viewportGap),
              zIndex: coachmarkZIndex
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#5E7ADD]">
                  {coachmarkLabel}
                </p>
                <h2 className="mt-2 text-xl font-bold text-[#162360]">
                  {currentStep.title}
                </h2>
              </div>
              <Button
                type="button"
                onClick={() => closeTour(true)}
                rounded="full"
                variant="ghost"
                className="h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100"
                aria-label="Tutup panduan"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {currentStep.description}
            </p>

            <div className="mt-5 flex items-center gap-2">
              {steps.map((step, index) => (
                <span
                  key={step.selector}
                  className={`h-2.5 rounded-full transition-all ${
                    index === stepIndex
                      ? "w-7 bg-[#162360]"
                      : "w-2.5 bg-slate-300"
                  }`}
                />
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <Button
                type="button"
                onClick={() => closeTour(true)}
                variant="ghost"
                className="text-sm font-semibold text-slate-500"
              >
                Lewati
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() =>
                    setStepIndex((previous) => Math.max(previous - 1, 0))
                  }
                  variant="outline"
                  rounded="xl"
                  disabled={stepIndex === 0}
                  className="px-4 py-2 text-sm font-semibold"
                >
                  Kembali
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  rounded="xl"
                  className="bg-[#162360] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#111b4f]"
                >
                  {stepIndex === steps.length - 1 ? "Selesai" : "Lanjut"}
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
