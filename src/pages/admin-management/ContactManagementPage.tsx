import {
  ChatBubbleLeftRightIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ContactFormModal } from "@/components/admin-dashboard/contact-management/ContactFormModal";
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
import { CONTACT_TYPE_OPTIONS } from "@/constants/home";
import { PERMISSIONS } from "@/constants/permissions";
import { getAdminContactDetailPath } from "@/constants/routes";
import { useContactManagementPage } from "@/hooks/admin-dashboard/useContactManagementPage";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type {
  AdminContactFormValues,
  AdminContactRecord,
  AdminContactSortDirection,
  AdminContactSortField
} from "@/type/admin-management/adminDashboardContact";
import { getUserAccessFromStorage, hasAnyPermission } from "@/utils/access";
import { getApiErrorMessage } from "@/utils/apiFormError";
import { cn } from "@/utils/cn";

export function AdminContactManagementPage() {
  useDocumentTitle(`Manajemen Kontak | ${APP_NAME}`);

  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "" | "PERTANYAAN" | "MASUKAN" | "SARAN"
  >("");
  const [typeFilterInput, setTypeFilterInput] = useState<
    "" | "PERTANYAAN" | "MASUKAN" | "SARAN"
  >("");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<AdminContactSortField>("created_at");
  const [sortDirection, setSortDirection] =
    useState<AdminContactSortDirection>("desc");
  const [tableSortKey, setTableSortKey] = useState("createdAt");
  const [tableSortDirection, setTableSortDirection] =
    useState<AdminContactSortDirection>("desc");
  const [selectedContact, setSelectedContact] =
    useState<AdminContactRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTargetContact, setDeleteTargetContact] =
    useState<AdminContactRecord | null>(null);
  const accessUser = getUserAccessFromStorage();

  const {
    contactsQuery,
    contactDetailQuery,
    updateContactMutation,
    deleteContactMutation
  } = useContactManagementPage(
    {
      search: query,
      page,
      perPage: limit === "ALL" ? 9999 : Number(limit),
      jenis: typeFilter || undefined,
      sortBy,
      sortDirection
    },
    modalOpen ? selectedContact?.id : null
  );

  const contacts = useMemo(
    () => contactsQuery.data?.items ?? [],
    [contactsQuery.data]
  );
  const activeContact = contactDetailQuery.data?.data ?? selectedContact;
  const summary = contactsQuery.data?.summary;
  const totalContacts = contactsQuery.data?.total ?? 0;
  const totalPages = contactsQuery.data?.lastPage ?? 1;
  const currentPage = contactsQuery.data?.page ?? page;

  const canUpdateContact = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_CONTACTS_UPDATE
  ]);
  const canDeleteContact = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_CONTACTS_DELETE
  ]);

  useEffect(() => {
    if (!contactsQuery.isError) return;

    toast({
      title: "Gagal memuat contact",
      description: getApiErrorMessage(
        contactsQuery.error,
        "Daftar contact tidak berhasil dimuat."
      ),
      tone: "error"
    });
  }, [contactsQuery.error, contactsQuery.isError, toast]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Total Contact",
        value: String(summary?.totalContact ?? totalContacts),
        caption: "Total pesan contact publik yang tercatat di sistem admin.",
        icon: ChatBubbleLeftRightIcon
      },
      {
        title: "Jenis Aktif",
        value: String(summary?.activeTypeCount ?? 0),
        caption: "Jumlah jenis pesan yang aktif pada data contact saat ini.",
        icon: ChatBubbleLeftRightIcon
      },
      {
        title: "Contact Terbaru",
        value: summary?.latestContact?.name ?? "-",
        caption:
          summary?.latestContact?.message || "Belum ada data contact terbaru.",
        icon: ChatBubbleLeftRightIcon
      }
    ],
    [summary, totalContacts]
  );

  const handleOpenUpdate = (contact: AdminContactRecord) => {
    setSelectedContact(contact);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (updateContactMutation.isPending) return;

    setModalOpen(false);
    setSelectedContact(null);
  };

  const handleSubmit = async (values: AdminContactFormValues) => {
    if (!selectedContact) return;

    const payload = {
      nama: values.name.trim(),
      email: values.email.trim(),
      jenis: values.type,
      pesan: values.message.trim()
    } as const;

    try {
      const result = await updateContactMutation.mutateAsync({
        contactId: selectedContact.id,
        payload
      });
      toast({
        title: "Contact berhasil diperbarui",
        description: result.message,
        tone: "success"
      });
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Gagal menyimpan contact",
        description: getApiErrorMessage(
          error,
          "Perubahan contact tidak berhasil disimpan."
        ),
        tone: "error"
      });
      throw error;
    }
  };

  const handleDeleteContact = useCallback(
    async (contact: AdminContactRecord) => {
      if (!canDeleteContact) return;

      try {
        await deleteContactMutation.mutateAsync(contact.id);
        toast({
          title: "Contact berhasil dihapus",
          description: `Pesan dari ${contact.name} telah dihapus.`,
          tone: "success"
        });
        setDeleteTargetContact(null);
      } catch (error) {
        toast({
          title: "Gagal menghapus contact",
          description: getApiErrorMessage(
            error,
            "Pesan contact tidak berhasil dihapus."
          ),
          tone: "error"
        });
      }
    },
    [canDeleteContact, deleteContactMutation, toast]
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
      setTypeFilter(typeFilterInput);
      setPage(1);
    },
    [searchInput, typeFilterInput]
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
    { key: "name", label: "Nama", className: "min-w-48" },
    { key: "email", label: "Email", className: "min-w-56" },
    {
      key: "type",
      label: "Jenis",
      className: "min-w-28",
      headerClassName: "text-center",
      align: "center" as const
    },
    {
      key: "message",
      label: "Pesan",
      className: "min-w-72",
      sortable: false
    },
    { key: "createdAt", label: "Created At", className: "min-w-40" },
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
      contacts.map((contact) => ({
        name: {
          display: (
            <div className="min-w-0 font-semibold text-slate-900">
              {contact.name}
            </div>
          ),
          sortValue: contact.name
        },
        email: {
          display: (
            <div className="text-sm text-slate-700">{contact.email}</div>
          ),
          sortValue: contact.email
        },
        type: {
          display: (
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                contact.type === "PERTANYAAN"
                  ? "bg-blue-100 text-[#223B8F]"
                  : contact.type === "MASUKAN"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
              )}
            >
              {contact.type}
            </span>
          ),
          sortValue: contact.type
        },
        message: {
          display: (
            <div className="max-w-xl break-words text-sm leading-relaxed text-slate-600">
              <span className="line-clamp-3">{contact.message}</span>
            </div>
          ),
          sortValue: contact.message
        },
        createdAt: {
          display: (
            <div className="text-xs leading-relaxed text-slate-600">
              {formatDateTime(contact.createdAt)}
            </div>
          ),
          sortValue: contact.createdAt
        },
        updatedAt: {
          display: (
            <div className="text-xs leading-relaxed text-slate-600">
              {formatDateTime(contact.updatedAt)}
            </div>
          ),
          sortValue: contact.updatedAt
        },
        actions: {
          display: (
            <div className="flex items-center justify-center gap-2">
              <Link to={getAdminContactDetailPath(contact.id)}>
                <Button
                  type="button"
                  variant="outline"
                  rounded="md"
                  className="gap-1.5 px-3 py-2 text-xs font-semibold"
                >
                  <EyeIcon className="h-3.5 w-3.5" />
                  Detail
                </Button>
              </Link>
              {canUpdateContact ? (
                <Button
                  type="button"
                  variant="primary"
                  rounded="md"
                  className="gap-1.5 px-3 py-2 text-xs font-semibold"
                  onClick={() => handleOpenUpdate(contact)}
                >
                  <PencilSquareIcon className="h-3.5 w-3.5" />
                  Edit
                </Button>
              ) : null}
              {canDeleteContact ? (
                <Button
                  type="button"
                  variant="danger"
                  rounded="md"
                  className="gap-1.5 px-3 py-2 text-xs font-semibold shadow-sm"
                  onClick={() => setDeleteTargetContact(contact)}
                  disabled={deleteContactMutation.isPending}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Delete
                </Button>
              ) : null}
              {!canUpdateContact && !canDeleteContact ? (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                  Tidak ada aksi tambahan
                </span>
              ) : null}
            </div>
          ),
          sortValue: contact.name
        }
      })),
    [
      canDeleteContact,
      canUpdateContact,
      contacts,
      deleteContactMutation.isPending
    ]
  );

  const isLoading = contactsQuery.isLoading;
  const isModalLoading =
    updateContactMutation.isPending ||
    (modalOpen && contactDetailQuery.isLoading);

  return (
    <AdminManagementLayout
      title="Manajemen Kontak"
      description="Kelola pesan contact dari publik, lihat detail, perbarui data, dan hapus contact yang tidak diperlukan."
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <PageTitle
          title="Manajemen Kontak"
          description="Kelola pesan contact publik dalam satu halaman admin yang fokus pada review, detail, edit, dan penghapusan data."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                Daftar Contact Message
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Tinjau pesan contact dari publik, filter berdasarkan jenis, dan
                lakukan tindak lanjut dari tabel berikut.
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <form
                className="grid gap-3 lg:flex-1 lg:grid-cols-[minmax(0,280px)_180px_auto] lg:items-center"
                onSubmit={handleSearchSubmit}
              >
                <Input
                  id="contact-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Cari nama, email, atau pesan..."
                  className="h-8 rounded-md py-1 text-xs"
                />
                <Select
                  value={typeFilterInput}
                  options={[
                    { value: "", label: "Semua Jenis" },
                    ...CONTACT_TYPE_OPTIONS
                  ]}
                  onChange={(nextValue) =>
                    setTypeFilterInput(
                      nextValue as "" | "PERTANYAAN" | "MASUKAN" | "SARAN"
                    )
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
                  itemLabel="contact"
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
            ) : contactsQuery.isError ? (
              <div className="space-y-4 rounded-lg border border-rose-200 bg-rose-50 p-5">
                <div>
                  <div className="text-sm font-semibold text-rose-700">
                    Gagal memuat daftar contact
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-rose-700">
                    {getApiErrorMessage(
                      contactsQuery.error,
                      "Data contact belum dapat diambil dari server."
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  rounded="md"
                  className="px-4 py-2 text-sm font-semibold"
                  onClick={() => void contactsQuery.refetch()}
                >
                  Muat Ulang
                </Button>
              </div>
            ) : contacts.length === 0 ? (
              <EmptyStatePanel
                title="Contact tidak ditemukan"
                description="Belum ada data contact yang sesuai dengan filter saat ini."
                compact
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <SortableDataTable
                  columns={tableColumns}
                  rows={tableRows}
                  className="max-h-140"
                  tableClassName="w-full min-w-[1280px] text-sm"
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

        <ContactFormModal
          open={modalOpen}
          contact={activeContact ?? null}
          loading={isModalLoading}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />

        <ConfirmationModal
          open={Boolean(deleteTargetContact)}
          title="Hapus Contact"
          description={`Pesan contact dari "${deleteTargetContact?.name ?? "-"}" akan dihapus. Tindakan ini tidak dapat dibatalkan dari halaman ini.`}
          confirmLabel="Hapus Contact"
          confirmTone="danger"
          loading={deleteContactMutation.isPending}
          onClose={() => setDeleteTargetContact(null)}
          onConfirm={() => {
            if (!deleteTargetContact) return;
            return handleDeleteContact(deleteTargetContact);
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
): AdminContactSortField | null {
  switch (sortKey) {
    case "name":
      return "nama";
    case "email":
      return "email";
    case "type":
      return "jenis";
    case "createdAt":
      return "created_at";
    case "updatedAt":
      return "updated_at";
    default:
      return null;
  }
}
