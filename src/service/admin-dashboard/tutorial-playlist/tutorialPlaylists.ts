import { apiClient } from "@/service/httpClient";
import type {
  AdminTutorialPlaylistDetailResponse,
  AdminTutorialPlaylistFormValues,
  AdminTutorialPlaylistListParams,
  AdminTutorialPlaylistListResponse,
  AdminTutorialPlaylistMutationResponse,
  BackendDeleteTutorialPlaylistResponse,
  BackendSuccessResponse,
  BackendTutorialPlaylistItem,
  BackendTutorialPlaylistsPayload
} from "@/type/admin-management/adminDashboardTutorialPlaylist";
import {
  assertSuccess,
  normalizeTutorialPlaylistDetailResponse,
  normalizeTutorialPlaylistMutationResponse,
  normalizeTutorialPlaylistsResponse
} from "./shared";

export async function fetchAdminTutorialPlaylists(
  params: AdminTutorialPlaylistListParams = {}
): Promise<AdminTutorialPlaylistListResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendTutorialPlaylistsPayload>
  >("/api/admin-dashboard/tutorial-playlists", {
    params: {
      search: params.search?.trim() || undefined,
      page: params.page ?? 1,
      per_page: params.perPage ?? 10,
      sort_by: params.sortBy ?? "updated_at",
      sort_direction: params.sortDirection ?? "desc"
    }
  });

  return normalizeTutorialPlaylistsResponse(assertSuccess(response.data));
}

export async function fetchAdminTutorialPlaylistDetail(
  playlistId: string
): Promise<AdminTutorialPlaylistDetailResponse> {
  const response = await apiClient.get<
    BackendSuccessResponse<BackendTutorialPlaylistItem>
  >(`/api/admin-dashboard/tutorial-playlists/${playlistId}`);

  return normalizeTutorialPlaylistDetailResponse(assertSuccess(response.data));
}

function toFormData(values: AdminTutorialPlaylistFormValues) {
  const formData = new FormData();
  formData.append("title", values.title.trim());
  formData.append("slug", values.slug.trim());
  formData.append("desc", values.description.trim());
  formData.append("url", values.url.trim());

  if (values.thumbnailFile) {
    formData.append("thumbnail", values.thumbnailFile);
  }

  return formData;
}

export async function createAdminTutorialPlaylist(
  values: AdminTutorialPlaylistFormValues
): Promise<AdminTutorialPlaylistMutationResponse> {
  const response = await apiClient.post<
    BackendSuccessResponse<BackendTutorialPlaylistItem>
  >("/api/admin-dashboard/tutorial-playlists", toFormData(values), {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return normalizeTutorialPlaylistMutationResponse(
    assertSuccess(response.data)
  );
}

export async function updateAdminTutorialPlaylist(
  playlistId: string,
  values: AdminTutorialPlaylistFormValues
): Promise<AdminTutorialPlaylistMutationResponse> {
  const response = await apiClient.post<
    BackendSuccessResponse<BackendTutorialPlaylistItem>
  >(
    `/api/admin-dashboard/tutorial-playlists/${playlistId}`,
    toFormData(values),
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return normalizeTutorialPlaylistMutationResponse(
    assertSuccess(response.data)
  );
}

export async function deleteAdminTutorialPlaylist(
  playlistId: string
): Promise<BackendDeleteTutorialPlaylistResponse> {
  const response =
    await apiClient.delete<BackendDeleteTutorialPlaylistResponse>(
      `/api/admin-dashboard/tutorial-playlists/${playlistId}`
    );

  return assertSuccess(response.data);
}
