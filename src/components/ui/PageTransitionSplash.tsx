import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import logoBskln from "@/assets/images/diplomasi.png";

type PageTransitionSplashProps = {
  minDuration?: number;
  forceVisible?: boolean;
};

function SplashContent() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -6 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="relative flex h-36 w-64 items-end justify-center md:w-80">
        <div className="relative flex h-full w-full items-end overflow-hidden">
          <motion.div
            className="absolute inset-x-4 bottom-5 h-px bg-linear-to-r from-transparent via-slate-300 to-transparent"
            animate={{ opacity: [0.45, 0.85, 0.45] }}
            transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="relative flex flex-col items-center"
            animate={{ x: ["25%", "75%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          >
            <motion.img
              src={logoBskln}
              alt="Maskot SIDE Kemlu"
              className="h-auto w-20 md:w-24"
              animate={{ y: [0, -1, 0, -0.5, 0] }}
              transition={{
                duration: 0.55,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </div>

      <div className="space-y-1 text-center">
        <p className="text-sm font-semibold tracking-wide text-slate-700 md:text-base">
          Memuat halaman...
        </p>
        <motion.div
          className="text-[11px] text-slate-400 md:text-xs"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.05, repeat: Infinity, ease: "easeInOut" }}
        >
          Mohon tunggu sejenak, sistem sedang menyiapkan data.
        </motion.div>
        <p className="sr-only">Loading</p>
      </div>
    </motion.div>
  );
}

export function PageTransitionSplash({
  minDuration = 700,
  forceVisible = false
}: PageTransitionSplashProps) {
  const location = useLocation();
  const [visible, setVisible] = React.useState(true);
  const timerRef = React.useRef<number | null>(null);
  const lastPathRef = React.useRef(location.pathname);
  const hasMountedRef = React.useRef(false);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showForDuration = React.useCallback(
    (duration: number) => {
      clearTimer();
      setVisible(true);
      timerRef.current = window.setTimeout(() => {
        setVisible(false);
        timerRef.current = null;
      }, duration);
    },
    [clearTimer]
  );

  React.useEffect(() => {
    hasMountedRef.current = true;
    showForDuration(minDuration);

    return () => {
      clearTimer();
    };
  }, [clearTimer, minDuration, showForDuration]);

  React.useEffect(() => {
    if (!hasMountedRef.current) return;
    if (location.pathname === lastPathRef.current) return;

    lastPathRef.current = location.pathname;
    showForDuration(minDuration);
  }, [location.pathname, minDuration, showForDuration]);

  React.useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  React.useEffect(() => {
    if (forceVisible) {
      clearTimer();
      setVisible(true);
      return;
    }

    setVisible(false);
  }, [clearTimer, forceVisible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="page-transition-splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-9999 flex items-center justify-center bg-white"
        >
          <SplashContent />
          <div className="absolute bottom-6 text-[10px] text-slate-400 md:text-xs">
            Kementerian Luar Negeri Republik Indonesia
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
