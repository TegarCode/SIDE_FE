import { useMemo, useState } from "react";
import { ArrowLeftIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import { PlayCircleIcon as PlayCircleSolidIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { APP_NAME } from "@/constants/app";
import { APP_ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { useTutorialPlaylistsQuery } from "@/hooks/home/useTutorialPlaylistsQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

function withoutAutoplay(url: string) {
  if (!url) return url;

  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.delete("autoplay");
    parsedUrl.searchParams.delete("auto_play");
    parsedUrl.searchParams.set("autoplay", "0");
    return parsedUrl.toString();
  } catch {
    return url
      .replace(/([?&])autoplay=1(&?)/gi, "$1")
      .replace(/([?&])auto_play=1(&?)/gi, "$1")
      .replace(/[?&]$/, "");
  }
}

const VIDEO_PANDUAN_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: "[data-video-tour='page-intro']",
    title: "Kenali halaman video panduan",
    description:
      "Halaman ini berisi kumpulan tutorial SIDE untuk membantu pengguna memahami alur penggunaan fitur dan eksplorasi data."
  },
  {
    selector: "[data-video-tour='video-player-card']",
    title: "Tonton video aktif",
    description:
      "Area ini menampilkan tutorial yang sedang dipilih. Pengguna bisa menonton materi utama langsung dari bagian ini."
  },
  {
    selector: "[data-video-tour='playlist-card']",
    title: "Pilih materi dari playlist",
    description:
      "Daftar di samping memuat materi tutorial yang tersedia. Klik salah satu item untuk membuka topik yang ingin dipelajari."
  },
  {
    selector: "[data-video-tour='active-video-title']",
    title: "Baca konteks video",
    description:
      "Judul dan ringkasan ini membantu pengguna memahami isi tutorial yang sedang dibuka sebelum mulai menonton."
  },
  {
    selector: "[data-video-tour='back-home-link']",
    title: "Kembali ke beranda",
    description:
      "Gunakan tombol ini untuk kembali ke beranda setelah selesai melihat tutorial."
  }
];

export function TutorialVideoPage() {
  useDocumentTitle(`Video Panduan | ${APP_NAME}`);

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const {
    data: tutorialVideos = [],
    isLoading,
    isError
  } = useTutorialPlaylistsQuery();

  const activeVideo = useMemo(() => {
    if (tutorialVideos.length === 0) {
      return null;
    }

    if (!activeVideoId) {
      return tutorialVideos[0];
    }

    return (
      tutorialVideos.find((video) => video.id === activeVideoId) ??
      tutorialVideos[0]
    );
  }, [activeVideoId, tutorialVideos]);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-linear-to-br from-white via-blue-50 to-white px-6 pb-10 pt-16 lg:px-12">
        <div className="absolute left-4 top-4 h-48 w-48 rounded-full bg-linear-to-br from-[#F5C75C] to-[#E3E7F8] opacity-30 blur-3xl" />
        <div className="absolute bottom-8 right-8 h-64 w-64 rounded-full bg-linear-to-br from-[#162360] to-[#3F51B5] opacity-20 blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-360">
          <Link
            to={APP_ROUTES.HOME}
            data-video-tour="back-home-link"
            className="inline-flex items-center gap-2 rounded-full border border-[#162360] bg-white/80 px-4 py-2 text-sm font-semibold text-[#162360] transition hover:bg-[#162360] hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Kembali ke Beranda
          </Link>

          <div className="mt-6 max-w-3xl" data-video-tour="page-intro">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#5E7ADD]">
              Seri Tutorial
            </p>
            <h1 className="mt-4 text-4xl font-extrabold text-[#162360] sm:text-5xl">
              Video Panduan SIDE
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              Pilih video dari playlist untuk memahami alur penggunaan SIDE,
              mulai dari pengenalan fitur sampai eksplorasi data.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 lg:px-12">
        <div className="mx-auto grid w-full max-w-360 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="p-5 lg:p-7" data-video-tour="video-player-card">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-linear-to-r from-[#5E7ADD] to-[#384AA0] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white shadow-sm">
                Video Aktif
              </span>
              {activeVideo && (
                <span className="inline-flex items-center gap-2 text-xs text-slate-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Sedang diputar
                </span>
              )}
            </div>

            <h2
              className="text-2xl font-bold text-slate-900"
              data-video-tour="active-video-title"
            >
              {isLoading
                ? "Memuat video..."
                : activeVideo?.title || "Playlist belum tersedia"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {isError
                ? "Video panduan gagal dimuat. Coba lagi nanti."
                : activeVideo?.description ||
                  "Klik salah satu video di daftar playlist untuk mulai menonton."}
            </p>

            <div className="mt-5 aspect-video w-full overflow-hidden rounded-xl bg-slate-100 ring-1 ring-black/5">
              {activeVideo?.url ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={withoutAutoplay(activeVideo.url)}
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
                  {isLoading
                    ? "Memuat playlist video panduan..."
                    : "Belum ada video panduan yang tersedia."}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4 lg:p-5" data-video-tour="playlist-card">
            <Card className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-none">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5E7ADD]">
                    Daftar Video
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">
                    Playlist Panduan
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Pilih panduan yang ingin dipelajari lebih dulu.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                  {isLoading ? "..." : `${tutorialVideos.length} video`}
                </span>
              </div>
            </Card>

            <div className="grid gap-3">
              {isLoading &&
                Array.from({ length: 4 }).map((_, index) => (
                  <Card
                    key={`tutorial-skeleton-${index}`}
                    className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-none"
                  >
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
                      <div className="h-20 rounded-xl bg-slate-200" />
                      <div className="space-y-2 pt-1">
                        <div className="h-4 w-3/4 rounded-full bg-slate-200" />
                        <div className="h-3 w-full rounded-full bg-slate-200" />
                        <div className="h-3 w-5/6 rounded-full bg-slate-200" />
                      </div>
                    </div>
                  </Card>
                ))}

              {!isLoading && tutorialVideos.length === 0 && (
                <Card className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 shadow-none">
                  {isError
                    ? "Playlist gagal dimuat."
                    : "Playlist belum tersedia."}
                </Card>
              )}

              {tutorialVideos.map((video, index) => {
                const isActive = activeVideo?.id === video.id;

                return (
                  <Button
                    key={video.id}
                    type="button"
                    onClick={() => setActiveVideoId(video.id)}
                    className={`group relative w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left transition ${
                      isActive
                        ? "border-[#5E7ADD]/50 bg-[#EEF2FF] shadow-sm"
                        : "border-slate-200 bg-white hover:border-[#5E7ADD]/30 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl ${
                        isActive ? "bg-[#5E7ADD]" : "bg-transparent"
                      }`}
                    />

                    <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
                      <div className="relative h-14 overflow-hidden rounded-md bg-slate-100 ring-1 ring-black/5">
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#5E7ADD]/20 to-[#384AA0]/20">
                            <PlayCircleIcon className="h-5 w-5 text-[#384AA0]" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-linear-to-t from-slate-900/35 via-slate-900/5 to-transparent" />

                        <div className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 backdrop-blur">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        {isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#162360]/20">
                            <div className="rounded-full bg-white/95 p-1.5 shadow-sm">
                              <PlayCircleSolidIcon className="h-5 w-5 text-[#384AA0]" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
                            {video.title}
                          </p>
                          {isActive && (
                            <span className="shrink-0 rounded-full bg-[#DCE6FF] px-2 py-0.5 text-[10px] font-medium text-[#384AA0]">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs leading-4 text-slate-500">
                          {video.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </Card>
        </div>
      </section>

      <GuidedTour
        steps={VIDEO_PANDUAN_TOUR_STEPS}
        storageKey="side-video-panduan-tour-completed"
        launcherLabel="Tur Video"
        coachmarkLabel="Panduan video"
      />
    </div>
  );
}
