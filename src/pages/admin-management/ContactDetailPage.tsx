import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  TrashIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ContactFormModal } from "@/components/admin-dashboard/contact-management/ContactFormModal";
import { AdminManagementLayout } from "@/components/layouts/AdminManagementLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME } from "@/constants/app";
import { PERMISSIONS } from "@/constants/permissions";
import { APP_ROUTES } from "@/constants/routes";
import { useContactDetailPage } from "@/hooks/admin-dashboard/useContactDetailPage";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { AdminContactFormValues } from "@/type/admin-management/adminDashboardContact";
import { getUserAccessFromStorage, hasAnyPermission } from "@/utils/access";
import { getApiErrorMessage } from "@/utils/apiFormError";
import { cn } from "@/utils/cn";

export function AdminContactDetailPage() {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const accessUser = getUserAccessFromStorage();
  const canUpdateContact = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_CONTACTS_UPDATE
  ]);
  const canDeleteContact = hasAnyPermission(accessUser, [
    PERMISSIONS.ADMIN_CONTACTS_DELETE
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { contactDetailQuery, updateContactMutation, deleteContactMutation } =
    useContactDetailPage(contactId);

  const contact = contactDetailQuery.data?.data ?? null;

  useDocumentTitle(
    `${contact?.name ? `${contact.name} | ` : ""}Detail Contact | ${APP_NAME}`
  );

  const detailCards = useMemo(
    () =>
      contact
        ? [
            { title: "Nama Pengirim", value: contact.name, icon: UserIcon },
            { title: "Email", value: contact.email, icon: EnvelopeIcon },
            {
              title: "Jenis Pesan",
              value: contact.type,
              icon: ChatBubbleLeftRightIcon
            }
          ]
        : [],
    [contact]
  );

  if (!contactId) {
    return <Navigate to={APP_ROUTES.ADMIN_MANAGEMENT.CONTACTS} replace />;
  }

  const handleSubmit = async (values: AdminContactFormValues) => {
    if (!contact) return;

    try {
      const result = await updateContactMutation.mutateAsync({
        contactId: contact.id,
        payload: {
          nama: values.name.trim(),
          email: values.email.trim(),
          jenis: values.type,
          pesan: values.message.trim()
        }
      });

      toast({
        title: "Contact berhasil diperbarui",
        description: result.message,
        tone: "success"
      });
      setModalOpen(false);
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

  const handleDelete = async () => {
    if (!contact || !canDeleteContact) return;

    try {
      await deleteContactMutation.mutateAsync(contact.id);
      toast({
        title: "Contact berhasil dihapus",
        description: `Pesan dari ${contact.name} telah dihapus.`,
        tone: "success"
      });
      void navigate(APP_ROUTES.ADMIN_MANAGEMENT.CONTACTS);
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
  };

  return (
    <AdminManagementLayout
      title="Detail Contact"
      description="Tinjau detail pesan contact, edit isi pesan, atau hapus data contact dari admin dashboard."
    >
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <PageTitle
          title="Detail Contact"
          description="Halaman detail untuk meninjau seluruh isi pesan contact dari publik secara lengkap."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link to={APP_ROUTES.ADMIN_MANAGEMENT.CONTACTS}>
                <Button
                  type="button"
                  variant="outline"
                  rounded="md"
                  className="gap-1.5 px-4 py-2 text-sm font-semibold"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Kembali
                </Button>
              </Link>
              {canUpdateContact ? (
                <Button
                  type="button"
                  variant="primary"
                  rounded="md"
                  className="gap-1.5 px-4 py-2 text-sm font-semibold"
                  onClick={() => setModalOpen(true)}
                  disabled={updateContactMutation.isPending}
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Edit Contact
                </Button>
              ) : null}
              {canDeleteContact ? (
                <Button
                  type="button"
                  variant="danger"
                  rounded="md"
                  className="gap-1.5 px-4 py-2 text-sm font-semibold"
                  onClick={() => setDeleteOpen(true)}
                  disabled={deleteContactMutation.isPending}
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </Button>
              ) : null}
            </div>
          }
        />

        {contactDetailQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-lg border border-slate-200 bg-white p-5"
              >
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="mt-3 h-8 w-40 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : contactDetailQuery.isError ? (
          <div className="space-y-4 rounded-lg border border-rose-200 bg-rose-50 p-5">
            <div className="text-sm font-semibold text-rose-700">
              Gagal memuat detail contact
            </div>
            <div className="text-sm leading-relaxed text-rose-700">
              {getApiErrorMessage(
                contactDetailQuery.error,
                "Detail contact belum dapat diambil dari server."
              )}
            </div>
          </div>
        ) : !contact ? (
          <EmptyStatePanel
            title="Contact tidak ditemukan"
            description="Data contact yang diminta tidak tersedia atau sudah dihapus."
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {detailCards.map(({ title, value, icon: Icon }) => (
                <Card key={title} className="rounded-lg p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        {title}
                      </div>
                      <div className="mt-2 break-words text-xl font-bold text-[#223B8F]">
                        {value}
                      </div>
                    </div>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-blue-50 text-[#223B8F] ring-1 ring-blue-100">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_320px]">
              <Card className="rounded-lg p-5 shadow-sm">
                <div className="border-b border-slate-200 pb-4">
                  <div className="text-lg font-semibold text-slate-900">
                    Pesan Lengkap
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Isi pesan contact ditampilkan penuh agar mudah ditinjau dan
                    diperbarui bila diperlukan.
                  </div>
                </div>
                <div className="mt-4 whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  {contact.message}
                </div>
              </Card>

              <Card className="rounded-lg p-5 shadow-sm">
                <div className="border-b border-slate-200 pb-4">
                  <div className="text-lg font-semibold text-slate-900">
                    Informasi Waktu
                  </div>
                </div>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Created At
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {formatDateTime(contact.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Updated At
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {formatDateTime(contact.updatedAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status Jenis
                    </dt>
                    <dd className="mt-2">
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
                    </dd>
                  </div>
                </dl>
              </Card>
            </div>
          </>
        )}

        <ContactFormModal
          open={modalOpen}
          contact={contact}
          loading={updateContactMutation.isPending}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />

        <ConfirmationModal
          open={deleteOpen}
          title="Hapus Contact"
          description={`Pesan contact dari "${contact?.name ?? "-"}" akan dihapus. Tindakan ini tidak dapat dibatalkan dari halaman ini.`}
          confirmLabel="Hapus Contact"
          confirmTone="danger"
          loading={deleteContactMutation.isPending}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
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
