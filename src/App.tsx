import { AppProvider } from "@/context/AppContext";
import { Layout } from "@/components/layouts/Layout";
import { ChatBot } from "@/components/ChatBot/ChatBot";
import { SiennaWidget } from "@/components/SiennaWidget";
import {
  APP_ROUTES,
  isAdminManagementPath,
  isProtectedAppPath
} from "@/constants/routes";
import { PageTransitionSplash } from "@/components/ui/PageTransitionSplash";
import { ToastProvider } from "@/components/ui/Toast";
import { useStorePageView } from "@/hooks/analytics/useStorePageView";
import { useAuthAccess } from "@/hooks/auth/useAuthAccess";
import { useAuthSessionRefresh } from "@/hooks/auth/useAuthSessionRefresh";
import { AppRoutes } from "@/routes/AppRoutes";
import {
  canAccessProtectedPages,
  isAccessControlEnabled
} from "@/service/accessControl";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  useAuthSessionRefresh();
  useStorePageView();
  const { isAuthenticated, isAuthResolved } = useAuthAccess();
  const canAccessProtected = canAccessProtectedPages();
  const shouldShowChatBot = true;
  const shouldForcePreload =
    isAccessControlEnabled() && isAuthenticated && !isAuthResolved;
  const shouldUseLayout =
    !isAdminManagementPath(location.pathname) &&
    location.pathname !== APP_ROUTES.NOT_FOUND &&
    (canAccessProtected || !isProtectedAppPath(location.pathname));

  const appContent = (
    <>
      <PageTransitionSplash forceVisible={shouldForcePreload} />
      <AppRoutes />
    </>
  );

  return (
    <ToastProvider>
      <AppProvider>
        {shouldUseLayout ? <Layout>{appContent}</Layout> : appContent}
        {shouldShowChatBot ? <ChatBot key={location.pathname} /> : null}
        <SiennaWidget />
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
