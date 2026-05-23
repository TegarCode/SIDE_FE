import { useEffect, useState } from "react";
import {
  AUTH_SESSION_CHANGED_EVENT,
  getAuthSessionError,
  getAuthUserFromSession,
  hasActiveAuthSession,
  isAuthUserResolved
} from "@/service/authSession";
import { getUserAccessFromStorage, type AccessUser } from "@/utils/access";
import type { AuthUser } from "@/type/auth";

type AuthAccessState = {
  accessUser: AccessUser;
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isAuthResolved: boolean;
  authError: string | null;
};

function readAuthAccessState(): AuthAccessState {
  return {
    accessUser: getUserAccessFromStorage(),
    authUser: getAuthUserFromSession(),
    isAuthenticated: hasActiveAuthSession(),
    isAuthResolved: isAuthUserResolved(),
    authError: getAuthSessionError()
  };
}

export function useAuthAccess() {
  const [state, setState] = useState<AuthAccessState>(readAuthAccessState);

  useEffect(() => {
    const sync = () => {
      setState(readAuthAccessState());
    };

    sync();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  return state;
}
