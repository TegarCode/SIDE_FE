import { useQuery } from "@tanstack/react-query";
import {
  fetchAdminSidePageViewDetail,
  fetchAdminSidePageViewModules,
  fetchAdminSidePageViews
} from "@/service/admin-dashboard/side-page-view";
import type { AdminSidePageViewListParams } from "@/type/admin-management/adminDashboardSidePageView";

export function useSidePageViewManagementPage(
  params: AdminSidePageViewListParams,
  selectedPageViewId?: number | null
) {
  const sidePageViewsQuery = useQuery({
    queryKey: ["admin-dashboard", "side-page-views", params],
    queryFn: () => fetchAdminSidePageViews(params)
  });

  const sidePageViewDetailQuery = useQuery({
    queryKey: [
      "admin-dashboard",
      "side-page-views",
      "detail",
      selectedPageViewId
    ],
    queryFn: () => fetchAdminSidePageViewDetail(selectedPageViewId as number),
    enabled: typeof selectedPageViewId === "number" && selectedPageViewId > 0
  });

  const sidePageViewModulesQuery = useQuery({
    queryKey: ["admin-dashboard", "side-page-views", "modules"],
    queryFn: fetchAdminSidePageViewModules
  });

  return {
    sidePageViewsQuery,
    sidePageViewDetailQuery,
    sidePageViewModulesQuery
  };
}
