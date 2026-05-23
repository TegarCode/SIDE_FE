export const APP_ROUTES = {
  HOME: "/",
  VIDEO_PANDUAN: "/video-panduan",
  LOGIN: "/login",
  FAQ: "/faq",
  NOT_FOUND: "/not-found",
  UNDER_CONSTRUCTION: "/under-contruction",
  ADMIN_MANAGEMENT: {
    ROOT: "/admin-management",
    DASHBOARD: "/admin-management/dashboard",
    ROLES: "/admin-management/roles",
    PERMISSIONS: "/admin-management/permissions",
    USERS: "/admin-management/users",
    FAQS: "/admin-management/faqs",
    CONTACTS: "/admin-management/contacts",
    CONTACT_DETAIL: "/admin-management/contacts/:contactId",
    API_CLIENTS: "/admin-management/api-clients",
    SIDE_PAGE_VIEWS: "/admin-management/analytics/page-view",
    TUTORIAL_PLAYLISTS: "/admin-management/tutorial-playlists",
    ECONOMIC_INDICATORS: "/admin-management/economic-indicators",
    ECONOMIC_INDICATOR_DETAIL: "/admin-management/economic-indicators/:batchId",
    INVESTMENT_DATA: "/admin-management/investment-data",
    INVESTMENT_DATA_DETAIL: "/admin-management/investment-data/:batchId",
    TOURISM_DATA: "/admin-management/tourism-data",
    TOURISM_DATA_DETAIL: "/admin-management/tourism-data/:batchId",
    TRADE_DATA: "/admin-management/trade-data",
    TRADE_DATA_DETAIL: "/admin-management/trade-data/:batchId",
    CACHES: "/admin-management/caches",
    AUTHENTICATION_LOGS: "/admin-management/authentication-logs"
  },
  INDONESIA: {
    ROOT: "/indonesia",
    DIPLOMASI_EKONOMI: "/indonesia/diplomasi-ekonomi",
    KERJASAMA_BILATERAL: "/indonesia/kerjasama-bilateral",
    INDIKATOR_EKONOMI: "/indonesia/indikator-ekonomi",
    INFRASTRUKTUR: "/indonesia/infrastruktur"
  },
  MITRA: {
    ROOT: "/negara-mitra",
    OVERVIEW: "/negara-mitra/overview",
    PERDAGANGAN: "/negara-mitra/perdagangan",
    INVESTASI: "/negara-mitra/investasi",
    PARIWISATA: "/negara-mitra/pariwisata",
    JASA: "/negara-mitra/jasa"
  },
  SEKTOR: {
    ROOT: "/sektor",
    PERDAGANGAN: "/sektor/perdagangan",
    KOMODITAS_UTAMA_TIK: "/sektor/komoditas-utama/tik",
    KOMODITAS_UTAMA_ENERGI: "/sektor/komoditas-utama/energi",
    KOMODITAS_UTAMA_MINERAL_KRITIS: "/sektor/komoditas-utama/mineral-kritis",
    KOMODITAS_UTAMA_KESEHATAN: "/sektor/komoditas-utama/farmasi",
    KOMODITAS_UTAMA_HILIRISASI: "/sektor/komoditas-utama/hilirisasi",
    KOMODITAS_UTAMA_PANGAN: "/sektor/komoditas-utama/pangan",
    KOMODITAS_UTAMA_PERTAHANAN: "/sektor/komoditas-utama/pertahanan",
    PAREKRAF_OVERVIEW: "/sektor/parekraf/overview",
    JASA_OVERVIEW: "/sektor/jasa/overview"
  },
  ANALISIS: {
    ROOT: "/analisis",
    PRODUK_KOMODITAS: "/analisis/produk-komoditas",
    POTENSI_DAYA_SAING: "/analisis/potensi-daya-saing",
    IDE: "/analisis/ide",
    OPERATIONAL_RISK: "/analisis/operational-risk",
    GEOPOLITIK_PERDAGANGAN: "/analisis/geopolitik-perdagangan"
  },
  DATABANK: {
    DATA_GENERATOR: {
      ROOT: "/databank/data-generator",
      TRADE: "/databank/data-generator/trade",
      TOURISM: "/databank/data-generator/tourism",
      INVESTMENT: "/databank/data-generator/investment",
      SERVICE: "/databank/data-generator/service",
      INDIKATOR_EKONOMI: "/databank/data-generator/indikator-ekonomi"
    },
    REPORT_GENERATOR: {
      ROOT: "/databank/report-generator",
      RCA_CMSA: "/databank/report-generator/rca-cmsa",
      MARKET_SHARE: "/databank/report-generator/market-share",
      KERJASAMA_PERDAGANGAN: "/databank/report-generator/kerjasama-perdagangan"
    }
  }
} as const;

export const EXTERNAL_ROUTES = {
  INVESTOLINK: "https://investolink-demo.example",
  KSPI: "https://kspi.bskln.id"
} as const;

const PROTECTED_ROUTE_PREFIXES = [
  APP_ROUTES.ANALISIS.ROOT,
  APP_ROUTES.ADMIN_MANAGEMENT.ROOT,
  APP_ROUTES.INDONESIA.ROOT,
  APP_ROUTES.MITRA.ROOT,
  APP_ROUTES.SEKTOR.ROOT,
  APP_ROUTES.DATABANK.DATA_GENERATOR.ROOT,
  APP_ROUTES.DATABANK.REPORT_GENERATOR.ROOT
] as const;

export function isProtectedAppPath(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (routePrefix) =>
      pathname === routePrefix || pathname.startsWith(`${routePrefix}/`)
  );
}

export function isAdminManagementPath(pathname: string) {
  return (
    pathname === APP_ROUTES.ADMIN_MANAGEMENT.ROOT ||
    pathname.startsWith(`${APP_ROUTES.ADMIN_MANAGEMENT.ROOT}/`)
  );
}

export function getAdminEconomicIndicatorDetailPath(batchId: string) {
  return `/admin-management/economic-indicators/${batchId}`;
}

export function getAdminTradeDetailPath(batchId: string) {
  return `/admin-management/trade-data/${batchId}`;
}

export function getAdminInvestmentDetailPath(batchId: string) {
  return `/admin-management/investment-data/${batchId}`;
}

export function getAdminTourismDetailPath(batchId: string) {
  return `/admin-management/tourism-data/${batchId}`;
}

export function getAdminContactDetailPath(contactId: string) {
  return `/admin-management/contacts/${contactId}`;
}
