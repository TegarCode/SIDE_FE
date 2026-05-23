import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren
} from "react";
import { APP_NAME, APP_VERSION } from "@/constants/app";

type AppContextValue = {
  appName: string;
  appVersion: string;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const value = useMemo<AppContextValue>(
    () => ({
      appName: APP_NAME,
      appVersion: APP_VERSION
    }),
    []
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return context;
}
