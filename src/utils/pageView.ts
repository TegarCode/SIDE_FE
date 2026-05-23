import { APP_ROUTES } from "@/constants/routes";

type PageViewRouteMatch = {
  prefix: string;
  module: string;
};

const PAGE_VIEW_ROUTE_MATCHES: PageViewRouteMatch[] = [
  {
    prefix: APP_ROUTES.ADMIN_MANAGEMENT.ROOT,
    module: "manajemen-admin"
  },
  {
    prefix: APP_ROUTES.ANALISIS.ROOT,
    module: "Analisis"
  },
  {
    prefix: APP_ROUTES.DATABANK.DATA_GENERATOR.ROOT,
    module: "Data Generator"
  },
  {
    prefix: APP_ROUTES.DATABANK.REPORT_GENERATOR.ROOT,
    module: "Report Generator"
  },
  {
    prefix: "/sektor/jasa",
    module: "Sektor Jasa"
  },
  {
    prefix: "/sektor/parekraf",
    module: "Sektor Pariwisata"
  },
  {
    prefix: "/sektor/komoditas-utama",
    module: "Sektor Komoditas Utama"
  },
  {
    prefix: APP_ROUTES.INDONESIA.ROOT,
    module: "Indonesia"
  },
  {
    prefix: APP_ROUTES.MITRA.ROOT,
    module: "Mitra"
  }
];

function isMatchingPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function resolvePageViewModule(pathname: string) {
  if (pathname === APP_ROUTES.HOME) {
    return "Home";
  }

  if (pathname === APP_ROUTES.FAQ) {
    return "FAQ";
  }

  const routeMatch = PAGE_VIEW_ROUTE_MATCHES.find(({ prefix }) =>
    isMatchingPath(pathname, prefix)
  );

  return routeMatch?.module ?? null;
}
