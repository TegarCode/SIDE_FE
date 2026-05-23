import {
  CheckBadgeIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaqFormModal } from "@/components/admin-dashboard/faq-management/FaqFormModal";
import { AdminManagementLayout } from "@/components/layouts/AdminManagementLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Pagination } from "@/components/ui/Pagination";
import { PageTitle } from "@/components/ui/PageTitle";
import { SortableDataTable } from "@/components/ui/SortableDataTable";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME } from "@/constants/app";
import { PERMISSIONS } from "@/constants/permissions";
import { useFaqManagementPage } from "@/hooks/admin-dashboard/useFaqManagementPage";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import type {
  AdminFaqFeaturedFilter,
  AdminFaqFormValues,
  AdminFaqSortDirection,
  AdminFaqSortField,
  AdminFaqTopicRecord
} from "@/type/admin-management/adminDashboardFaq";
import { getUserAccessFromStorage, hasAnyPermission } from "@/utils/access";
import { getApiErrorMessage } from "@/utils/apiFormError";
import { cn } from "@/utils/cn";

const FEATURED_FILTER_OPTIONS: SelectOption[] = [
  { value: "all", label: "Semua Featured" },
  { value: "true", label: "Featured" },
  { value: "false", label: "Tidak Featured" }
];

export function AdminFaqManagementPage() {
  useDocumentTitle(`Manajemen FAQ | ${APP_NAME}`);

  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [featuredFilter, setFeaturedFilter] =
    useState<AdminFaqFeaturedFilter>("all");
  const [featuredFilterInput, setFeaturedFilterInput] =
    useState<AdminFaqFeaturedFilter>("all");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<AdminFaqSortField>("order");
  const [sortDirection, setSortDirection] =
    useState<AdminFaqSortDirection>("desc");
  const [tableSortKey, setTableSortKey] = useState("order");
  const [tableSortDirection, setTableSortDirection] =
    useState<AdminFaqSortDirection>("desc");
  const [modalMode, setModalMode] = useState<"create" | "update" | "detail">(
    "create"
  );
  const [selectedFaq, setSelectedFaq] = useState<AdminFaqTopicRecord | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTargetFaq, setDeleteTargetFaq] =
    useState<AdminFaqTopicRecord | null>(null);
  const accessUser = getUserAccessFromStorage();

  const {
    faqsQuery,
    faqDetailQuery,
    createFaqMutation,
    updateFaqMutation,
    deleteFaqMutation
  } = useFaqManagementPage(
    {
      search: query,
      page,
      perPage: limit === "ALL" ? 9999 : Number(limit),
      isFeatured:
        featuredFilter === "all" ? undefined : featuredFilter === "true",
      sortBy,
      sortDirection
    },
    modalOpen ? selectedFaq?.id : null
  );

  const faqs = useMemo(() => faqsQuery.data?.items ?? [], [faqsQuery.data]);
  const activeFaq =
    modalMode === "create" ? null : (faqDetailQuery.data?.data ?? selectedFaq);

  const canCreateFaq = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_FAQS_CREATE
  ]);
  const canUpdateFaq = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_FAQS_UPDATE
  ]);
  const canDeleteFaq = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_FAQS_DELETE
  ]);

  const totalFaqs = faqsQuery.data?.total ?? 0;
  const totalPages = faqsQuery.data?.lastPage ?? 1;
  const currentPage = faqsQuery.data?.page ?? page;
  const summary = faqsQuery.data?.summary;

  useEffect(() => {
    if (!faqsQuery.isError) return;

    toast({
      title: "Gagal memuat FAQ",
      description: getApiErrorMessage(
        faqsQuery.error,
        "Daftar FAQ tidak berhasil dimuat."
      ),
      tone: "error"
    });
  }, [faqsQuery.error, faqsQuery.isError, toast]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Total FAQ Topic",
        value: String(summary?.totalFaqTopic ?? totalFaqs),
        caption: "Total topik FAQ yang aktif dikelola pada area admin.",
        icon: QuestionMarkCircleIcon
      },
      {
        title: "FAQ Featured",
        value: String(summary?.faqFeatured ?? 0),
        caption: "Jumlah topik FAQ yang saat ini ditandai sebagai featured.",
        icon: CheckBadgeIcon
      },
      {
        title: "Jumlah Item FAQ",
        value: String(faqs.reduce((total, item) => total + item.itemsCount, 0)),
        caption:
          "Total item pertanyaan dan jawaban pada data FAQ yang sedang dimuat.",
        icon: QuestionMarkCircleIcon
      },
      {
        title: "FAQ Terbaru",
        value: summary?.latestFaq?.topic ?? "-",
        caption: summary?.latestFaq?.summary || "Belum ada data FAQ terbaru.",
        icon: QuestionMarkCircleIcon
      }
    ],
    [faqs, summary, totalFaqs]
  );

  const isLoading = faqsQuery.isLoading;
  const isModalLoading =
    createFaqMutation.isPending ||
    updateFaqMutation.isPending ||
    ((modalMode === "detail" || modalMode === "update") &&
      faqDetailQuery.isLoading);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedFaq(null);
    setModalOpen(true);
  };

  const handleOpenDetail = (faq: AdminFaqTopicRecord) => {
    setModalMode("detail");
    setSelectedFaq(faq);
    setModalOpen(true);
  };

  const handleOpenUpdate = (faq: AdminFaqTopicRecord) => {
    setModalMode("update");
    setSelectedFaq(faq);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (createFaqMutation.isPending || updateFaqMutation.isPending) {
      return;
    }

    setModalOpen(false);
    setSelectedFaq(null);
  };

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
      setFeaturedFilter(featuredFilterInput);
      setPage(1);
    },
    [featuredFilterInput, searchInput]
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

  const handleSubmit = async (values: AdminFaqFormValues) => {
    const payload = toFaqPayload(values);

    try {
      if (modalMode === "create") {
        const result = await createFaqMutation.mutateAsync(payload);
        toast({
          title: "FAQ berhasil ditambahkan",
          description: result.message,
          tone: "success"
        });
      } else if (selectedFaq) {
        const result = await updateFaqMutation.mutateAsync({
          faqId: selectedFaq.id,
          payload
        });
        toast({
          title: "FAQ berhasil diperbarui",
          description: result.message,
          tone: "success"
        });
      }

      handleCloseModal();
    } catch (error) {
      toast({
        title: "Gagal menyimpan FAQ",
        description: getApiErrorMessage(
          error,
          "Perubahan FAQ tidak berhasil disimpan."
        ),
        tone: "error"
      });
      throw error;
    }
  };

  const handleDeleteFaq = useCallback(
    async (faq: AdminFaqTopicRecord) => {
      if (!canDeleteFaq) return;

      try {
        await deleteFaqMutation.mutateAsync(faq.id);
        toast({
          title: "FAQ berhasil dihapus",
          description: `Topik "${faq.topic}" telah dihapus.`,
          tone: "success"
        });
        setDeleteTargetFaq(null);
      } catch (error) {
        toast({
          title: "Gagal menghapus FAQ",
          description: getApiErrorMessage(
            error,
            "Topik FAQ tidak berhasil dihapus."
          ),
          tone: "error"
        });
      }
    },
    [canDeleteFaq, deleteFaqMutation, toast]
  );

  const tableColumns = [
    { key: "topic", label: "Topic", className: "min-w-64" },
    {
      key: "summary",
      label: "Summary",
      className: "min-w-72",
      sortable: false
    },
    {
      key: "featured",
      label: "Featured",
      className: "min-w-28",
      headerClassName: "text-center",
      align: "center" as const,
      sortable: false
    },
    {
      key: "itemsCount",
      label: "Total Items",
      className: "min-w-28",
      headerClassName: "text-center",
      align: "center" as const,
      sortable: false
    },
    { key: "order", label: "Order", className: "min-w-24" },
    { key: "updatedAt", label: "Updated At", className: "min-w-40" },
    {
      key: "actions",
      label: "Actions",
      className: "min-w-72",
      headerClassName: "text-center",
      align: "center" as const,
      sortable: false
    }
  ];

  const tableRows = useMemo(
    () =>
      faqs.map((faq) => ({
        topic: {
          display: (
            <div className="min-w-0">
              <div className="break-words font-semibold text-slate-900">
                {faq.topic}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Dibuat {formatDateTime(faq.createdAt)}
              </div>
            </div>
          ),
          sortValue: faq.topic
        },
        summary: {
          display: (
            <div className="max-w-xl break-words text-sm leading-relaxed text-slate-600">
              <span className="line-clamp-3">{faq.summary || "-"}</span>
            </div>
          ),
          sortValue: faq.summary
        },
        featured: {
          display: (
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                faq.isFeatured
                  ? "bg-blue-100 text-[#223B8F]"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {faq.isFeatured ? "Featured" : "Tidak"}
            </span>
          ),
          sortValue: faq.isFeatured ? "Featured" : "Tidak"
        },
        itemsCount: {
          display: (
            <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
              {faq.itemsCount} item
            </span>
          ),
          sortValue: faq.itemsCount
        },
        order: {
          display: (
            <span className="text-sm font-semibold text-slate-700">
              {faq.order}
            </span>
          ),
          sortValue: faq.order
        },
        updatedAt: {
          display: (
            <div className="text-xs leading-relaxed text-slate-600">
              {formatDateTime(faq.updatedAt)}
            </div>
          ),
          sortValue: faq.updatedAt
        },
        actions: {
          display: (
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                rounded="md"
                className="gap-1.5 px-3 py-2 text-xs font-semibold"
                onClick={() => handleOpenDetail(faq)}
              >
                <EyeIcon className="h-3.5 w-3.5" />
                Detail
              </Button>
              {canUpdateFaq ? (
                <Button
                  type="button"
                  variant="primary"
                  rounded="md"
                  className="gap-1.5 px-3 py-2 text-xs font-semibold"
                  onClick={() => handleOpenUpdate(faq)}
                >
                  <PencilSquareIcon className="h-3.5 w-3.5" />
                  Edit
                </Button>
              ) : null}
              {canDeleteFaq ? (
                <Button
                  type="button"
                  variant="danger"
                  rounded="md"
                  className="gap-1.5 px-3 py-2 text-xs font-semibold shadow-sm"
                  onClick={() => setDeleteTargetFaq(faq)}
                  disabled={deleteFaqMutation.isPending}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Delete
                </Button>
              ) : null}
              {!canUpdateFaq && !canDeleteFaq ? (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                  Tidak ada aksi tambahan
                </span>
              ) : null}
            </div>
          ),
          sortValue: faq.topic
        }
      })),
    [canDeleteFaq, canUpdateFaq, deleteFaqMutation.isPending, faqs]
  );

  return (
    <AdminManagementLayout
      title="Manajemen FAQ"
      description="Kelola topik FAQ, item pertanyaan, jawaban, dan prioritas tampil FAQ admin."
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <PageTitle
          title="Manajemen FAQ"
          description="Kelola topik FAQ dan seluruh item pertanyaan-jawaban dalam satu halaman yang siap dipakai."
          actions={
            canCreateFaq ? (
              <Button
                type="button"
                variant="primary"
                rounded="md"
                className="gap-2 px-4 py-2 text-sm font-semibold"
                onClick={handleOpenCreate}
              >
                <PlusIcon className="h-4 w-4" />
                Tambah FAQ
              </Button>
            ) : null
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                Daftar FAQ Topic
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Tinjau topik FAQ, filter featured, urutan tampil, dan lakukan
                perubahan langsung dari tabel berikut.
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <form
                className="grid gap-3 lg:flex-1 lg:grid-cols-[minmax(0,280px)_180px_auto] lg:items-center"
                onSubmit={handleSearchSubmit}
              >
                <Input
                  id="faq-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Cari topik atau ringkasan..."
                  className="h-8 rounded-md py-1 text-xs"
                />
                <Select
                  value={featuredFilterInput}
                  options={FEATURED_FILTER_OPTIONS}
                  onChange={(nextValue) =>
                    setFeaturedFilterInput(nextValue as AdminFaqFeaturedFilter)
                  }
                  size="sm"
                  isSearchable={false}
                  className="min-w-[180px]"
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

              <div className="flex items-center gap-2 lg:shrink-0 lg:justify-end">
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
                  itemLabel="faq topic"
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
            ) : faqsQuery.isError ? (
              <div className="space-y-4 rounded-lg border border-rose-200 bg-rose-50 p-5">
                <div>
                  <div className="text-sm font-semibold text-rose-700">
                    Gagal memuat daftar FAQ
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-rose-700">
                    {getApiErrorMessage(
                      faqsQuery.error,
                      "Data FAQ belum dapat diambil dari server."
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  rounded="md"
                  className="px-4 py-2 text-sm font-semibold"
                  onClick={() => void faqsQuery.refetch()}
                >
                  Muat Ulang
                </Button>
              </div>
            ) : faqs.length === 0 ? (
              <EmptyStatePanel
                title="FAQ tidak ditemukan"
                description="Belum ada topik FAQ yang sesuai dengan filter saat ini."
                compact
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <SortableDataTable
                  columns={tableColumns}
                  rows={tableRows}
                  className="max-h-140"
                  tableClassName="w-full min-w-[1220px] text-sm"
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

        <FaqFormModal
          open={modalOpen}
          mode={modalMode}
          faq={activeFaq}
          loading={isModalLoading}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />

        <ConfirmationModal
          open={Boolean(deleteTargetFaq)}
          title="Hapus FAQ"
          description={`Topik FAQ "${deleteTargetFaq?.topic ?? "-"}" akan dihapus. Tindakan ini tidak dapat dibatalkan dari halaman ini.`}
          confirmLabel="Hapus FAQ"
          confirmTone="danger"
          loading={deleteFaqMutation.isPending}
          onClose={() => setDeleteTargetFaq(null)}
          onConfirm={() => {
            if (!deleteTargetFaq) return;
            return handleDeleteFaq(deleteTargetFaq);
          }}
        />
      </div>
    </AdminManagementLayout>
  );
}

function toFaqPayload(values: AdminFaqFormValues) {
  return {
    topic: values.topic.trim(),
    summary: values.summary.trim() || null,
    is_featured: values.isFeatured,
    order: Number(values.order),
    items: values.items.map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
      ...(item.order.trim() ? { order: Number(item.order) } : {})
    }))
  };
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

function mapTableSortKeyToBackend(sortKey: string): AdminFaqSortField | null {
  switch (sortKey) {
    case "topic":
      return "topic";
    case "order":
      return "order";
    case "createdAt":
      return "created_at";
    case "updatedAt":
      return "updated_at";
    case "summary":
    case "featured":
    case "itemsCount":
    case "actions":
    default:
      return null;
  }
}
