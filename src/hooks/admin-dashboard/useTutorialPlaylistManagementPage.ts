import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminTutorialPlaylist,
  deleteAdminTutorialPlaylist,
  fetchAdminTutorialPlaylistDetail,
  fetchAdminTutorialPlaylists,
  updateAdminTutorialPlaylist
} from "@/service/admin-dashboard/tutorial-playlist";
import type {
  AdminTutorialPlaylistFormValues,
  AdminTutorialPlaylistListParams
} from "@/type/admin-management/adminDashboardTutorialPlaylist";

type UpdateAdminTutorialPlaylistInput = {
  playlistId: string;
  values: AdminTutorialPlaylistFormValues;
};

export function useTutorialPlaylistManagementPage(
  params: AdminTutorialPlaylistListParams,
  selectedPlaylistId?: string | null
) {
  const queryClient = useQueryClient();

  const tutorialPlaylistsQuery = useQuery({
    queryKey: ["admin-dashboard", "tutorial-playlists", params],
    queryFn: () => fetchAdminTutorialPlaylists(params)
  });

  const tutorialPlaylistDetailQuery = useQuery({
    queryKey: [
      "admin-dashboard",
      "tutorial-playlists",
      "detail",
      selectedPlaylistId
    ],
    queryFn: () =>
      fetchAdminTutorialPlaylistDetail(selectedPlaylistId as string),
    enabled: Boolean(selectedPlaylistId)
  });

  const createTutorialPlaylistMutation = useMutation({
    mutationKey: ["admin-dashboard", "tutorial-playlists", "create"],
    mutationFn: createAdminTutorialPlaylist,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "tutorial-playlists"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["home", "tutorial-playlists"]
      });
    }
  });

  const updateTutorialPlaylistMutation = useMutation({
    mutationKey: ["admin-dashboard", "tutorial-playlists", "update"],
    mutationFn: ({ playlistId, values }: UpdateAdminTutorialPlaylistInput) =>
      updateAdminTutorialPlaylist(playlistId, values),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "tutorial-playlists"]
      });
      await queryClient.invalidateQueries({
        queryKey: [
          "admin-dashboard",
          "tutorial-playlists",
          "detail",
          variables.playlistId
        ]
      });
      await queryClient.invalidateQueries({
        queryKey: ["home", "tutorial-playlists"]
      });
    }
  });

  const deleteTutorialPlaylistMutation = useMutation({
    mutationKey: ["admin-dashboard", "tutorial-playlists", "delete"],
    mutationFn: deleteAdminTutorialPlaylist,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", "tutorial-playlists"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["home", "tutorial-playlists"]
      });
    }
  });

  return {
    tutorialPlaylistsQuery,
    tutorialPlaylistDetailQuery,
    createTutorialPlaylistMutation,
    updateTutorialPlaylistMutation,
    deleteTutorialPlaylistMutation
  };
}
