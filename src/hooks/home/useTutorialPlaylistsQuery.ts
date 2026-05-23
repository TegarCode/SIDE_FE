import { useQuery } from "@tanstack/react-query";
import { fetchTutorialPlaylists } from "@/service/homeService";

export function useTutorialPlaylistsQuery() {
  return useQuery({
    queryKey: ["home", "tutorial-playlists"],
    queryFn: fetchTutorialPlaylists,
    staleTime: 1000 * 60 * 5
  });
}
