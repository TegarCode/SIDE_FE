import {
  EyeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlayCircleIcon,
  PlusIcon,
  QueueListIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TutorialPlaylistFormModal } from "@/components/admin-dashboard/tutorial-playlist-management/TutorialPlaylistFormModal";
import { AdminManagementLayout } from "@/components/layouts/AdminManagementLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Input } from "@/components/ui/Form/Input";
import { Pagination } from "@/components/ui/Pagination";
import { PageTitle } from "@/components/ui/PageTitle";
import { SortableDataTable } from "@/components/ui/SortableDataTable";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME } from "@/constants/app";
import { useTutorialPlaylistManagementPage } from "@/hooks/admin-dashboard/useTutorialPlaylistManagementPage";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type {
  AdminTutorialPlaylistFormValues,
  AdminTutorialPlaylistRecord,
  AdminTutorialPlaylistSortDirection,
  AdminTutorialPlaylistSortField
} from "@/type/admin-management/adminDashboardTutorialPlaylist";
import { getApiErrorMessage } from "@/utils/apiFormError";

export function AdminTutorialPlaylistManagementPage() {
  useDocumentTitle(`Manajemen Daftar Video Tutorial | ${APP_NAME}`);

  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] =
    useState<AdminTutorialPlaylistSortField>("updated_at");
  const [sortDirection, setSortDirection] =
    useState<AdminTutorialPlaylistSortDirection>("desc");
  const [tableSortKey, setTableSortKey] = useState("updatedAt");
  const [tableSortDirection, setTableSortDirection] =
    useState<AdminTutorialPlaylistSortDirection>("desc");
  const [modalMode, setModalMode] = useState<"create" | "update" | "detail">(
    "create"
  );
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<AdminTutorialPlaylistRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTargetPlaylist, setDeleteTargetPlaylist] =
    useState<AdminTutorialPlaylistRecord | null>(null);

  const {
    tutorialPlaylistsQuery,
    tutorialPlaylistDetailQuery,
    createTutorialPlaylistMutation,
    updateTutorialPlaylistMutation,
    deleteTutorialPlaylistMutation
  } = useTutorialPlaylistManagementPage(
    {
      search: query,
      page,
      perPage: limit === "ALL" ? 9999 : Number(limit),
      sortBy,
      sortDirection
    },
    modalOpen && modalMode !== "create" ? selectedPlaylist?.id : null
  );

  const playlists = useMemo(
    () => tutorialPlaylistsQuery.data?.items ?? [],
    [tutorialPlaylistsQuery.data]
  );
  const activePlaylist =
    modalMode === "create"
      ? null
      : (tutorialPlaylistDetailQuery.data?.data ?? selectedPlaylist);
  const summary = tutorialPlaylistsQuery.data?.summary;
  const totalPlaylists = tutorialPlaylistsQuery.data?.total ?? 0;
  const totalPages = tutorialPlaylistsQuery.data?.lastPage ?? 1;
  const currentPage = tutorialPlaylistsQuery.data?.page ?? page;

  useEffect(() => {
    if (!tutorialPlaylistsQuery.isError) return;

    toast({
      title: "Gagal memuat Daftar Video Tutorial",
      description: getApiErrorMessage(
        tutorialPlaylistsQuery.error,
        "Daftar Daftar Video Tutorial tidak berhasil dimuat."
      ),
      tone: "error"
    });
  }, [toast, tutorialPlaylistsQuery.error, tutorialPlaylistsQuery.isError]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Total Playlist",
        value: String(summary?.totalPlaylist ?? totalPlaylists),
        caption: "Total playlist tutorial yang tersedia di sistem admin.",
        icon: QueueListIcon
      },
      {
        title: "Playlist Terbaru",
        value: summary?.latestPlaylist?.title ?? "-",
        caption:
          summary?.latestPlaylist?.slug || "Belum ada data playlist terbaru.",
        icon: PlayCircleIcon
      }
    ],
    [summary, totalPlaylists]
  );

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedPlaylist(null);
    setModalOpen(true);
  };

  const handleOpenUpdate = (playlist: AdminTutorialPlaylistRecord) => {
    setModalMode("update");
    setSelectedPlaylist(playlist);
    setModalOpen(true);
  };

  const handleOpenDetail = (playlist: AdminTutorialPlaylistRecord) => {
    setModalMode("detail");
    setSelectedPlaylist(playlist);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (
      createTutorialPlaylistMutation.isPending ||
      updateTutorialPlaylistMutation.isPending
    ) {
      return;
    }

    setModalOpen(false);
    setSelectedPlaylist(null);
  };

  const handleSubmit = async (values: AdminTutorialPlaylistFormValues) => {
    try {
      if (modalMode === "create") {
        const result = await createTutorialPlaylistMutation.mutateAsync(values);
        toast({
          title: "Daftar Video Tutorial berhasil ditambahkan",
          description: result.message,
          tone: "success"
        });
      } else if (selectedPlaylist) {
        const result = await updateTutorialPlaylistMutation.mutateAsync({
          playlistId: selectedPlaylist.id,
          values
        });
        toast({
          title: "Daftar Video Tutorial berhasil diperbarui",
          description: result.message,
          tone: "success"
        });
      }

      handleCloseModal();
    } catch (error) {
      toast({
        title: "Gagal menyimpan Daftar Video Tutorial",
        description: getApiErrorMessage(
          error,
          "Perubahan Daftar Video Tutorial tidak berhasil disimpan."
        ),
        tone: "error"
      });
      throw error;
    }
  };

  const handleDeletePlaylist = useCallback(
    async (playlist: AdminTutorialPlaylistRecord) => {
      try {
        await deleteTutorialPlaylistMutation.mutateAsync(playlist.id);
        toast({
          title: "Daftar Video Tutorial berhasil dihapus",
          description: `Playlist ${playlist.title} telah dihapus.`,
          tone: "success"
        });
        setDeleteTargetPlaylist(null);
      } catch (error) {
        toast({
          title: "Gagal menghapus Daftar Video Tutorial",
          description: getApiErrorMessage(
            error,
            "Daftar Video Tutorial tidak berhasil dihapus."
          ),
          tone: "error"
        });
      }
    },
    [deleteTutorialPlaylistMutation, toast]
  );

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(Math.min(Math.max(nextPage, 1), totalPages));
    },
    [totalPages]
  );

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setQuery(searchInput.trim());
      setPage(1);
    },
    [searchInput]
  );

  const handleSortChange = useCallback(
    (sortKey: string, direction: "asc" | "desc") => {
      const nextSortBy = mapTableSortKeyToBackend(sortKey);
      if (!nextSortBy) return;

      setTableSortKey(sortKey);
      setTableSortDirection(direction);
      setSortBy(nextSortBy);
      setSortDirection(direction);
      setPage(1);
    },
    []
  );

  const tableColumns = [
    {
      key: "thumbnail",
      label: "Thumbnail",
      className: "min-w-36",
      sortable: false
    },
    { key: "title", label: "Judul", className: "min-w-56" },
    { key: "slug", label: "Slug", className: "min-w-52" },
    {
      key: "url",
      label: "URL",
      className: "min-w-60",
      sortable: false
    },
    { key: "updatedAt", label: "Terakhir Diubah", className: "min-w-40" },
    {
      key: "actions",
      label: "Aksi",
      className: "min-w-72",
      headerClassName: "text-center",
      align: "center" as const,
      sortable: false
    }
  ];

  const tableRows = useMemo(
    () =>
      playlists.map((playlist) => ({
        thumbnail: {
          display: (
            <div className="h-16 w-28 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
              {playlist.thumbnailUrl ? (
                <img
                  src={playlist.thumbnailUrl}
                  alt={playlist.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                  No Image
                </div>
              )}
            </div>
          ),
          sortValue: playlist.title
        },
        title: {
          display: (
            <div className="min-w-0 font-semibold text-slate-900">
              {playlist.title}
            </div>
          ),
          sortValue: playlist.title
        },
        slug: {
          display: (
            <code className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
              {playlist.slug}
            </code>
          ),
          sortValue: playlist.slug
        },
        url: {
          display: (
            <div className="max-w-md break-words text-sm leading-relaxed text-slate-600">
              <span className="line-clamp-2">{playlist.url}</span>
            </div>
          ),
          sortValue: playlist.url
        },
        updatedAt: {
          display: (
            <div className="text-xs leading-relaxed text-slate-600">
              {formatDateTime(playlist.updatedAt)}
            </div>
          ),
          sortValue: playlist.updatedAt
        },
        actions: {
          display: (
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                rounded="md"
                className="gap-1.5 px-3 py-2 text-xs font-semibold"
                onClick={() => handleOpenDetail(playlist)}
              >
                <EyeIcon className="h-3.5 w-3.5" />
                Detail
              </Button>
              <Button
                type="button"
                variant="primary"
                rounded="md"
                className="gap-1.5 px-3 py-2 text-xs font-semibold"
                onClick={() => handleOpenUpdate(playlist)}
              >
                <PencilSquareIcon className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                type="button"
                variant="danger"
                rounded="md"
                className="gap-1.5 px-3 py-2 text-xs font-semibold shadow-sm"
                onClick={() => setDeleteTargetPlaylist(playlist)}
                disabled={deleteTutorialPlaylistMutation.isPending}
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          ),
          sortValue: playlist.title
        }
      })),
    [deleteTutorialPlaylistMutation.isPending, playlists]
  );

  const isLoading = tutorialPlaylistsQuery.isLoading;
  const isModalLoading =
    createTutorialPlaylistMutation.isPending ||
    updateTutorialPlaylistMutation.isPending ||
    (modalOpen &&
      modalMode !== "create" &&
      tutorialPlaylistDetailQuery.isLoading);

  return (
    <AdminManagementLayout
      title="Manajemen Daftar Video Tutorial"
      description="Kelola playlist tutorial, thumbnail, slug, deskripsi, dan URL video dalam satu halaman admin."
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <PageTitle
          title="Manajemen Daftar Video Tutorial"
          description="Kelola playlist tutorial video dengan upload thumbnail, sorting backend, dan detail playlist dalam satu area admin."
          actions={
            <Button
              type="button"
              variant="primary"
              rounded="md"
              className="gap-2 px-4 py-2 text-sm font-semibold"
              onClick={handleOpenCreate}
            >
              <PlusIcon className="h-4 w-4" />
              Tambah Tutorial
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2">
          {summaryCards.map(({ title, value, caption, icon: Icon }) => (
            <Card key={title} className="rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">
                    {title}
                  </div>
                  <div className="mt-2 break-words text-2xl font-bold text-[#223B8F]">
                    {value}
                  </div>
                  <p className="mt-2 break-words text-sm leading-relaxed text-slate-500">
                    {caption}
                  </p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-blue-50 text-[#223B8F] ring-1 ring-blue-100">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="rounded-lg p-5 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">
                Daftar Daftar Video Tutorial
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Tinjau playlist tutorial, thumbnail, slug, URL, dan data
                pembaruan terakhir dari tabel berikut.
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,320px)_auto] md:items-center">
              <form
                className="flex items-center gap-2"
                onSubmit={handleSearchSubmit}
              >
                <Input
                  id="tutorial-playlist-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Cari judul atau slug tutorial..."
                  className="h-8 rounded-md py-1 text-xs"
                />
                <Button
                  type="submit"
                  variant="primary"
                  rounded="md"
                  className="h-8 shrink-0 gap-1.5 px-3 text-xs font-semibold"
                >
                  <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                  Cari
                </Button>
              </form>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-medium text-slate-500">
                  Tampilkan
                </label>
                <DataLimitSelect
                  value={limit}
                  onChange={(nextLimit) => {
                    setLimit(nextLimit);
                    setPage(1);
                  }}
                  options={["10", "25", "50", "100", "ALL"]}
                  itemLabel="playlist"
                  className="w-28"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="h-4 w-44 rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-full rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-3/4 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : tutorialPlaylistsQuery.isError ? (
              <div className="space-y-4 rounded-lg border border-rose-200 bg-rose-50 p-5">
                <div>
                  <div className="text-sm font-semibold text-rose-700">
                    Gagal memuat daftar Daftar Video Tutorial
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-rose-700">
                    {getApiErrorMessage(
                      tutorialPlaylistsQuery.error,
                      "Data Daftar Video Tutorial belum dapat diambil dari server."
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  rounded="md"
                  className="px-4 py-2 text-sm font-semibold"
                  onClick={() => void tutorialPlaylistsQuery.refetch()}
                >
                  Muat Ulang
                </Button>
              </div>
            ) : playlists.length === 0 ? (
              <EmptyStatePanel
                title="Daftar Video Tutorial tidak ditemukan"
                description="Belum ada Daftar Video Tutorial yang sesuai dengan pencarian saat ini."
                compact
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <SortableDataTable
                  columns={tableColumns}
                  rows={tableRows}
                  className="max-h-140"
                  tableClassName="w-full min-w-[1260px] text-sm"
                  disableDefaultMinWidth
                  showRowNumber
                  controlledSortKey={tableSortKey}
                  controlledSortDirection={tableSortDirection}
                  onSortChange={handleSortChange}
                />
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  showWhenSinglePage
                />
              </div>
            )}
          </div>
        </Card>

        <TutorialPlaylistFormModal
          open={modalOpen}
          mode={modalMode}
          playlist={activePlaylist ?? null}
          loading={isModalLoading}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />

        <ConfirmationModal
          open={Boolean(deleteTargetPlaylist)}
          title="Hapus Daftar Video Tutorial"
          description={`Playlist "${deleteTargetPlaylist?.title ?? "-"}" akan dihapus. Tindakan ini tidak dapat dibatalkan dari halaman ini.`}
          confirmLabel="Hapus Playlist"
          confirmTone="danger"
          loading={deleteTutorialPlaylistMutation.isPending}
          onClose={() => setDeleteTargetPlaylist(null)}
          onConfirm={() => {
            if (!deleteTargetPlaylist) return;
            return handleDeletePlaylist(deleteTargetPlaylist);
          }}
        />
      </div>
    </AdminManagementLayout>
  );
}

function formatDateTime(value: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed);
}

function mapTableSortKeyToBackend(
  sortKey: string
): AdminTutorialPlaylistSortField | null {
  switch (sortKey) {
    case "title":
      return "title";
    case "slug":
      return "slug";
    case "createdAt":
      return "created_at";
    case "updatedAt":
      return "updated_at";
    default:
      return null;
  }
}
