import { useEffect, useState } from "react";
import axios from "axios";
import { isAccessControlEnabled } from "@/service/accessControl";
import {
  AUTH_SESSION_CHANGED_EVENT,
  clearAuthSession,
  hasActiveAuthSession,
  isAuthUserResolved,
  markAuthSessionResolved,
  setAuthSessionError,
  updateAuthSessionUser
} from "@/service/authSession";
import { fetchCurrentUser } from "@/service/authService";

let activeRefreshPromise: Promise<void> | null = null;

export function useAuthSessionRefresh() {
  const [, setSessionVersion] = useState(0);

  useEffect(() => {
    const syncView = () => {
      setSessionVersion((value) => value + 1);
    };

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, syncView);
    window.addEventListener("storage", syncView);

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, syncView);
      window.removeEventListener("storage", syncView);
    };
  }, []);

  useEffect(() => {
    if (
      !isAccessControlEnabled() ||
      !hasActiveAuthSession() ||
      isAuthUserResolved()
    ) {
      return;
    }

    const syncCurrentUser = () => {
      if (activeRefreshPromise) {
        return activeRefreshPromise;
      }

      activeRefreshPromise = (async () => {
        try {
          const user = await fetchCurrentUser();
          updateAuthSessionUser(user);
        } catch (error) {
          const status = axios.isAxiosError(error)
            ? error.response?.status
            : null;
          if (status === 401 || status === 403) {
            clearAuthSession();
            return;
          }

          const message = axios.isAxiosError(error)
            ? error.code === "ECONNABORTED"
              ? "Permintaan sesi ke server melewati batas waktu."
              : error.response?.data?.message ||
                error.message ||
                "Hak akses tidak berhasil dimuat."
            : "Hak akses tidak berhasil dimuat.";
          setAuthSessionError(message);
          markAuthSessionResolved();
        } finally {
          activeRefreshPromise = null;
        }
      })();

      return activeRefreshPromise;
    };

    void syncCurrentUser();
  });
}
