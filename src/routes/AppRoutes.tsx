import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { APP_ROUTES } from "@/constants/routes";
import {
  PERMISSION_GROUPS,
  PERMISSIONS,
  type AppPermission
} from "@/constants/permissions";
import {
  canAccessPermissions,
  canAccessProtectedPages,
  isAccessControlEnabled
} from "@/service/accessControl";
import { FaqPage } from "@/pages/FaqPage";
import { HomePage } from "@/pages/HomePage";
import { AnalisisGeopolitikPerdaganganPage } from "@/pages/analisis/GeopolitikPerdaganganPage";
import { AnalisisIdePage } from "@/pages/analisis/IdePage";
import { AnalisisOperationalRiskPage } from "@/pages/analisis/OperationalRiskPage";
import { AnalisisPotensiDayaSaingPage } from "@/pages/analisis/PotensiDayaSaingPage";
import { AnalisisProdukKomoditasPage } from "@/pages/analisis/ProdukKomoditasPage";
import { DataGeneratorEconomicIndicatorPage } from "@/pages/data-generator/EconomicIndicatorPage";
import { DataGeneratorInvestmentPage } from "@/pages/data-generator/InvestmentPage";
import { DataGeneratorServicePage } from "@/pages/data-generator/ServicePage";
import { DataGeneratorTourismPage } from "@/pages/data-generator/TourismPage";
import { DataGeneratorTradePage } from "@/pages/data-generator/TradePage";
import { IndonesiaDiplomasiEkonomiPage } from "@/pages/indonesia/DiplomasiEkonomiPage";
import { IndonesiaIndikatorEkonomiPage } from "@/pages/indonesia/IndikatorEkonomiPage";
import { IndonesiaInfrastrukturPage } from "@/pages/indonesia/InfrastrukturPage";
import { IndonesiaKerjasamaBilateralPage } from "@/pages/indonesia/KerjasamaBilateralPage";
import { LoginPage } from "@/pages/LoginPage";
import { AdminContactDetailPage } from "@/pages/admin-management/ContactDetailPage";
import { AdminContactManagementPage } from "@/pages/admin-management/ContactManagementPage";
import { AdminApiClientManagementPage } from "@/pages/admin-management/ApiClientManagementPage";
import { AdminManagementDashboardPage } from "@/pages/admin-management/DashboardPage";
import { AdminEconomicIndicatorDetailPage } from "@/pages/admin-management/data-management/economic-indicator-management/detail-page";
import { AdminEconomicIndicatorManagementPage } from "@/pages/admin-management/data-management/economic-indicator-management/management-page";
import { AdminInvestmentDetailPage } from "@/pages/admin-management/data-management/investment-management/detail-page";
import { AdminInvestmentManagementPage } from "@/pages/admin-management/data-management/investment-management/management-page";
import { AdminTourismDetailPage } from "@/pages/admin-management/data-management/tourism-management/detail-page";
import { AdminTourismManagementPage } from "@/pages/admin-management/data-management/tourism-management/management-page";
import { AdminTradeDetailPage } from "@/pages/admin-management/data-management/trade-management/detail-page";
import { AdminTradeManagementPage } from "@/pages/admin-management/data-management/trade-management/management-page";
import { AdminAuthenticationLogManagementPage } from "@/pages/admin-management/AuthenticationLogManagementPage";
import { AdminCacheManagementPage } from "@/pages/admin-management/CacheManagementPage";
import { AdminSidePageViewManagementPage } from "@/pages/admin-management/SidePageViewManagementPage";
import { AdminTutorialPlaylistManagementPage } from "@/pages/admin-management/TutorialPlaylistManagementPage";
import { AdminPermissionManagementPage } from "@/pages/admin-management/PermissionManagementPage";
import { AdminRoleManagementPage } from "@/pages/admin-management/RoleManagementPage";
import { AdminUserManagementPage } from "@/pages/admin-management/UserManagementPage";
import { AdminFaqManagementPage } from "@/pages/admin-management/FaqManagementPage";
import { MitraInvestasiPage } from "@/pages/mitra/InvestasiPage";
import { MitraJasaPage } from "@/pages/mitra/JasaPage";
import { MitraOverviewPage } from "@/pages/mitra/OverviewPage";
import { MitraPariwisataPage } from "@/pages/mitra/PariwisataPage";
import { MitraPerdaganganPage } from "@/pages/mitra/PerdaganganPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { TutorialVideoPage } from "@/pages/TutorialVideoPage";
import { ReportGeneratorKerjasamaPerdaganganPage } from "@/pages/report-generator/KerjasamaPerdaganganPage";
import { ReportGeneratorMarketSharePage } from "@/pages/report-generator/MarketSharePage";
import { ReportGeneratorRcaCmsaPage } from "@/pages/report-generator/RcaCmsaPage";
import { KomoditasUtamaEnergiPage } from "@/pages/sektor/komoditas-utama/EnergiPage";
import { KomoditasUtamaHilirisasiPage } from "@/pages/sektor/komoditas-utama/HilirisasiPage";
import { KomoditasUtamaKesehatanPage } from "@/pages/sektor/komoditas-utama/KesehatanPage";
import { KomoditasUtamaMineralKritisPage } from "@/pages/sektor/komoditas-utama/MineralKritisPage";
import { KomoditasUtamaPanganPage } from "@/pages/sektor/komoditas-utama/PanganPage";
import { KomoditasUtamaPertahananPage } from "@/pages/sektor/komoditas-utama/PertahananPage";
import { KomoditasUtamaTikPage } from "@/pages/sektor/komoditas-utama/TikPage";
import { UnderConstructionPage } from "@/pages/UnderConstructionPage";
import { useAuthAccess } from "@/hooks/auth/useAuthAccess";
import { getUserAccessFromStorage } from "@/utils/access";

function AuthSessionErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md space-y-4 rounded-lg border border-rose-200 bg-rose-50 p-6 text-center">
        <div className="text-base font-semibold text-rose-700">
          Gagal memuat sesi pengguna
        </div>
        <div className="text-sm leading-relaxed text-rose-700">{message}</div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}

function ProtectedRoute({
  children,
  permissions,
  requireSession = false
}: {
  children: React.ReactNode;
  permissions?: readonly AppPermission[];
  requireSession?: boolean;
}) {
  const location = useLocation();
  const { accessUser, isAuthenticated, isAuthResolved, authError } =
    useAuthAccess();

  if (requireSession && !isAuthenticated) {
    return (
      <Navigate
        to={APP_ROUTES.LOGIN}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!requireSession && !canAccessProtectedPages()) {
    return <NotFoundPage />;
  }

  if (isAccessControlEnabled() && isAuthenticated && !isAuthResolved) {
    return null;
  }

  if (isAccessControlEnabled() && isAuthenticated && authError) {
    return <AuthSessionErrorScreen message={authError} />;
  }

  if (permissions?.length && isAccessControlEnabled()) {
    if (!canAccessPermissions(accessUser, permissions)) {
      return <NotFoundPage />;
    }
  }

  return <>{children}</>;
}

function resolveReportGeneratorDefaultPath(
  accessUser: ReturnType<typeof getUserAccessFromStorage>
) {
  if (!isAccessControlEnabled()) {
    return APP_ROUTES.DATABANK.REPORT_GENERATOR.RCA_CMSA;
  }

  if (
    canAccessPermissions(accessUser, [
      PERMISSIONS.DATABANK_RCA_CMSA_REPORT_GENERATOR
    ])
  ) {
    return APP_ROUTES.DATABANK.REPORT_GENERATOR.RCA_CMSA;
  }

  if (
    canAccessPermissions(accessUser, [
      PERMISSIONS.DATABANK_MARKET_SHARE_REPORT_GENERATOR
    ])
  ) {
    return APP_ROUTES.DATABANK.REPORT_GENERATOR.MARKET_SHARE;
  }

  if (
    canAccessPermissions(accessUser, [
      PERMISSIONS.DATABANK_KERJASAMA_PERDAGANGAN_REPORT_GENERATOR
    ])
  ) {
    return APP_ROUTES.DATABANK.REPORT_GENERATOR.KERJASAMA_PERDAGANGAN;
  }

  return APP_ROUTES.DATABANK.REPORT_GENERATOR.RCA_CMSA;
}

function resolveAdminDashboardDefaultPath(
  accessUser: ReturnType<typeof getUserAccessFromStorage>
) {
  if (!isAccessControlEnabled()) {
    return APP_ROUTES.ADMIN_MANAGEMENT.DASHBOARD;
  }

  if (canAccessPermissions(accessUser, [PERMISSIONS.ADMIN_DASHBOARD_MAIN])) {
    return APP_ROUTES.ADMIN_MANAGEMENT.DASHBOARD;
  }

  if (canAccessPermissions(accessUser, [PERMISSIONS.ADMIN_ROLES_READ])) {
    return APP_ROUTES.ADMIN_MANAGEMENT.ROLES;
  }

  if (canAccessPermissions(accessUser, [PERMISSIONS.ADMIN_PERMISSIONS_READ])) {
    return APP_ROUTES.ADMIN_MANAGEMENT.PERMISSIONS;
  }

  if (canAccessPermissions(accessUser, [PERMISSIONS.ADMIN_USERS_READ])) {
    return APP_ROUTES.ADMIN_MANAGEMENT.USERS;
  }

  if (canAccessPermissions(accessUser, [PERMISSIONS.ADMIN_FAQS_READ])) {
    return APP_ROUTES.ADMIN_MANAGEMENT.FAQS;
  }

  if (canAccessPermissions(accessUser, [PERMISSIONS.ADMIN_CONTACTS_READ])) {
    return APP_ROUTES.ADMIN_MANAGEMENT.CONTACTS;
  }

  if (
    canAccessPermissions(accessUser, [PERMISSIONS.ADMIN_SIDE_PAGE_VIEWS_READ])
  ) {
    return APP_ROUTES.ADMIN_MANAGEMENT.SIDE_PAGE_VIEWS;
  }

  if (
    canAccessPermissions(accessUser, [
      PERMISSIONS.ADMIN_TUTORIAL_PLAYLISTS_READ
    ])
  ) {
    return APP_ROUTES.ADMIN_MANAGEMENT.TUTORIAL_PLAYLISTS;
  }

  if (canAccessPermissions(accessUser, [PERMISSIONS.ADMIN_API_CLIENTS_READ])) {
    return APP_ROUTES.ADMIN_MANAGEMENT.API_CLIENTS;
  }

  if (canAccessPermissions(accessUser, [PERMISSIONS.ADMIN_CACHES_READ])) {
    return APP_ROUTES.ADMIN_MANAGEMENT.CACHES;
  }

  if (
    canAccessPermissions(accessUser, [
      PERMISSIONS.ADMIN_AUTHENTICATION_LOGS_READ
    ])
  ) {
    return APP_ROUTES.ADMIN_MANAGEMENT.AUTHENTICATION_LOGS;
  }

  if (
    canAccessPermissions(accessUser, [
      PERMISSIONS.ADMIN_KINERJA_EKONOMI_READ,
      PERMISSIONS.ADMIN_KINERJA_EKONOMI_CURRENT_READ
    ])
  ) {
    return APP_ROUTES.ADMIN_MANAGEMENT.ECONOMIC_INDICATORS;
  }

  if (
    canAccessPermissions(accessUser, [
      PERMISSIONS.ADMIN_INVESTMENT_READ,
      PERMISSIONS.ADMIN_INVESTMENT_CURRENT_READ
    ])
  ) {
    return APP_ROUTES.ADMIN_MANAGEMENT.INVESTMENT_DATA;
  }

  if (
    canAccessPermissions(accessUser, [
      PERMISSIONS.ADMIN_TRADE_READ,
      PERMISSIONS.ADMIN_TRADE_CURRENT_READ
    ])
  ) {
    return APP_ROUTES.ADMIN_MANAGEMENT.TRADE_DATA;
  }

  return APP_ROUTES.ADMIN_MANAGEMENT.DASHBOARD;
}

function AdminDashboardIndexRedirect() {
  const { accessUser, isAuthenticated, isAuthResolved, authError } =
    useAuthAccess();

  if (isAccessControlEnabled() && isAuthenticated && !isAuthResolved) {
    return null;
  }

  if (isAccessControlEnabled() && isAuthenticated && authError) {
    return <AuthSessionErrorScreen message={authError} />;
  }

  return <Navigate to={resolveAdminDashboardDefaultPath(accessUser)} replace />;
}

function ReportGeneratorIndexRedirect() {
  const { accessUser, isAuthenticated, isAuthResolved, authError } =
    useAuthAccess();

  if (isAccessControlEnabled() && isAuthenticated && !isAuthResolved) {
    return null;
  }

  if (isAccessControlEnabled() && isAuthenticated && authError) {
    return <AuthSessionErrorScreen message={authError} />;
  }

  return (
    <Navigate to={resolveReportGeneratorDefaultPath(accessUser)} replace />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path={APP_ROUTES.HOME} element={<HomePage />} />
      <Route path={APP_ROUTES.VIDEO_PANDUAN} element={<TutorialVideoPage />} />
      <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={APP_ROUTES.FAQ} element={<FaqPage />} />
      <Route path={APP_ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.ROOT}
        element={
          <ProtectedRoute
            permissions={PERMISSION_GROUPS.ADMIN_DASHBOARD}
            requireSession
          >
            <AdminDashboardIndexRedirect />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.DASHBOARD}
        element={
          <ProtectedRoute
            permissions={[PERMISSIONS.ADMIN_DASHBOARD_MAIN]}
            requireSession
          >
            <AdminManagementDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.ROLES}
        element={
          <ProtectedRoute
            permissions={[PERMISSIONS.ADMIN_ROLES_READ]}
            requireSession
          >
            <AdminRoleManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.PERMISSIONS}
        element={
          <ProtectedRoute
            permissions={[PERMISSIONS.ADMIN_PERMISSIONS_READ]}
            requireSession
          >
            <AdminPermissionManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.USERS}
        element={
          <ProtectedRoute
            permissions={[PERMISSIONS.ADMIN_USERS_READ]}
            requireSession
          >
            <AdminUserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.FAQS}
        element={
          <ProtectedRoute
            permissions={[PERMISSIONS.ADMIN_FAQS_READ]}
            requireSession
          >
            <AdminFaqManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.CONTACTS}
        element={
          <ProtectedRoute
            permissions={[PERMISSIONS.ADMIN_CONTACTS_READ]}
            requireSession
          >
            <AdminContactManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.CONTACT_DETAIL}
        element={
          <ProtectedRoute
            permissions={[PERMISSIONS.ADMIN_CONTACTS_READ]}
            requireSession
          >
            <AdminContactDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.API_CLIENTS}
        element={
          <ProtectedRoute
            permissions={[PERMISSIONS.ADMIN_API_CLIENTS_READ]}
            requireSession
          >
            <AdminApiClientManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.SIDE_PAGE_VIEWS}
        element={
          <ProtectedRoute
            permissions={[PERMISSIONS.ADMIN_SIDE_PAGE_VIEWS_READ]}
            requireSession
          >
            <AdminSidePageViewManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.TUTORIAL_PLAYLISTS}
        element={
          <ProtectedRoute
            permissions={[PERMISSIONS.ADMIN_TUTORIAL_PLAYLISTS_READ]}
            requireSession
          >
            <AdminTutorialPlaylistManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.ECONOMIC_INDICATORS}
        element={
          <ProtectedRoute
            permissions={[
              PERMISSIONS.ADMIN_KINERJA_EKONOMI_READ,
              PERMISSIONS.ADMIN_KINERJA_EKONOMI_CURRENT_READ
            ]}
            requireSession
          >
            <AdminEconomicIndicatorManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.INVESTMENT_DATA}
        element={
          <ProtectedRoute
            permissions={[
              PERMISSIONS.ADMIN_INVESTMENT_READ,
              PERMISSIONS.ADMIN_INVESTMENT_CURRENT_READ,
              PERMISSIONS.ADMIN_INVESTMENT_CREATE
            ]}
            requireSession
          >
            <AdminInvestmentManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.TOURISM_DATA}
        element={
          <ProtectedRoute>
            <AdminTourismManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.TOURISM_DATA_DETAIL}
        element={
          <ProtectedRoute>
            <AdminTourismDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.TRADE_DATA}
        element={
          <ProtectedRoute
            permissions={[
              PERMISSIONS.ADMIN_TRADE_READ,
              PERMISSIONS.ADMIN_TRADE_CURRENT_READ,
              PERMISSIONS.ADMIN_TRADE_CREATE
            ]}
            requireSession
          >
            <AdminTradeManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.ECONOMIC_INDICATOR_DETAIL}
        element={
          <ProtectedRoute
            permissions={[PERMISSIONS.ADMIN_KINERJA_EKONOMI_READ]}
            requireSession
          >
            <AdminEconomicIndicatorDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.INVESTMENT_DATA_DETAIL}
        element={
          <ProtectedRoute
            permissions={[
              PERMISSIONS.ADMIN_INVESTMENT_READ,
              PERMISSIONS.ADMIN_INVESTMENT_UPDATE,
              PERMISSIONS.ADMIN_INVESTMENT_DELETE
            ]}
            requireSession
          >
            <AdminInvestmentDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.TRADE_DATA_DETAIL}
        element={
          <ProtectedRoute
            permissions={[
              PERMISSIONS.ADMIN_TRADE_READ,
              PERMISSIONS.ADMIN_TRADE_UPDATE,
              PERMISSIONS.ADMIN_TRADE_DELETE
            ]}
            requireSession
          >
            <AdminTradeDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.CACHES}
        element={
          <ProtectedRoute
            permissions={[PERMISSIONS.ADMIN_CACHES_READ]}
            requireSession
          >
            <AdminCacheManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ADMIN_MANAGEMENT.AUTHENTICATION_LOGS}
        element={
          <ProtectedRoute
            permissions={[PERMISSIONS.ADMIN_AUTHENTICATION_LOGS_READ]}
            requireSession
          >
            <AdminAuthenticationLogManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.UNDER_CONSTRUCTION}
        element={<UnderConstructionPage />}
      />
      <Route
        path={APP_ROUTES.ANALISIS.ROOT}
        element={
          <ProtectedRoute>
            <Navigate to={APP_ROUTES.ANALISIS.PRODUK_KOMODITAS} replace />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ANALISIS.PRODUK_KOMODITAS}
        element={
          <ProtectedRoute>
            <AnalisisProdukKomoditasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ANALISIS.POTENSI_DAYA_SAING}
        element={
          <ProtectedRoute>
            <AnalisisPotensiDayaSaingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ANALISIS.IDE}
        element={
          <ProtectedRoute>
            <AnalisisIdePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ANALISIS.GEOPOLITIK_PERDAGANGAN}
        element={
          <ProtectedRoute>
            <AnalisisGeopolitikPerdaganganPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.ANALISIS.OPERATIONAL_RISK}
        element={
          <ProtectedRoute>
            <AnalisisOperationalRiskPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.INDONESIA.DIPLOMASI_EKONOMI}
        element={
          <ProtectedRoute>
            <IndonesiaDiplomasiEkonomiPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.INDONESIA.KERJASAMA_BILATERAL}
        element={
          <ProtectedRoute>
            <IndonesiaKerjasamaBilateralPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.INDONESIA.INDIKATOR_EKONOMI}
        element={
          <ProtectedRoute>
            <IndonesiaIndikatorEkonomiPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.INDONESIA.INFRASTRUKTUR}
        element={
          <ProtectedRoute>
            <IndonesiaInfrastrukturPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.MITRA.ROOT}
        element={
          <ProtectedRoute>
            <Navigate to={APP_ROUTES.MITRA.OVERVIEW} replace />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.MITRA.OVERVIEW}
        element={
          <ProtectedRoute>
            <MitraOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.MITRA.PERDAGANGAN}
        element={
          <ProtectedRoute>
            <MitraPerdaganganPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.MITRA.INVESTASI}
        element={
          <ProtectedRoute>
            <MitraInvestasiPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.MITRA.PARIWISATA}
        element={
          <ProtectedRoute>
            <MitraPariwisataPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.MITRA.JASA}
        element={
          <ProtectedRoute>
            <MitraJasaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.DATABANK.DATA_GENERATOR.ROOT}
        element={
          <ProtectedRoute>
            <Navigate to={APP_ROUTES.DATABANK.DATA_GENERATOR.TRADE} replace />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.DATABANK.DATA_GENERATOR.TRADE}
        element={
          <ProtectedRoute>
            <DataGeneratorTradePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.DATABANK.DATA_GENERATOR.INVESTMENT}
        element={
          <ProtectedRoute>
            <DataGeneratorInvestmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.DATABANK.DATA_GENERATOR.TOURISM}
        element={
          <ProtectedRoute>
            <DataGeneratorTourismPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.DATABANK.DATA_GENERATOR.SERVICE}
        element={
          <ProtectedRoute>
            <DataGeneratorServicePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.DATABANK.DATA_GENERATOR.INDIKATOR_EKONOMI}
        element={
          <ProtectedRoute>
            <DataGeneratorEconomicIndicatorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.DATABANK.REPORT_GENERATOR.ROOT}
        element={
          <ProtectedRoute
            permissions={PERMISSION_GROUPS.DATABANK_REPORT_GENERATOR}
          >
            <ReportGeneratorIndexRedirect />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.DATABANK.REPORT_GENERATOR.RCA_CMSA}
        element={
          <ProtectedRoute
            permissions={[PERMISSIONS.DATABANK_RCA_CMSA_REPORT_GENERATOR]}
          >
            <ReportGeneratorRcaCmsaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.DATABANK.REPORT_GENERATOR.MARKET_SHARE}
        element={
          <ProtectedRoute
            permissions={[PERMISSIONS.DATABANK_MARKET_SHARE_REPORT_GENERATOR]}
          >
            <ReportGeneratorMarketSharePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.DATABANK.REPORT_GENERATOR.KERJASAMA_PERDAGANGAN}
        element={
          <ProtectedRoute
            permissions={[
              PERMISSIONS.DATABANK_KERJASAMA_PERDAGANGAN_REPORT_GENERATOR
            ]}
          >
            <ReportGeneratorKerjasamaPerdaganganPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.SEKTOR.PERDAGANGAN}
        element={
          <ProtectedRoute>
            <UnderConstructionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.SEKTOR.PAREKRAF_OVERVIEW}
        element={
          <ProtectedRoute>
            <UnderConstructionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.SEKTOR.JASA_OVERVIEW}
        element={
          <ProtectedRoute>
            <UnderConstructionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_TIK}
        element={
          <ProtectedRoute>
            <KomoditasUtamaTikPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_ENERGI}
        element={
          <ProtectedRoute>
            <KomoditasUtamaEnergiPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_MINERAL_KRITIS}
        element={
          <ProtectedRoute>
            <KomoditasUtamaMineralKritisPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_KESEHATAN}
        element={
          <ProtectedRoute>
            <KomoditasUtamaKesehatanPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_HILIRISASI}
        element={
          <ProtectedRoute>
            <KomoditasUtamaHilirisasiPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_PANGAN}
        element={
          <ProtectedRoute>
            <KomoditasUtamaPanganPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_PERTAHANAN}
        element={
          <ProtectedRoute>
            <KomoditasUtamaPertahananPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
