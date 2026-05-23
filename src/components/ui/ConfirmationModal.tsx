import {
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/cn";

type ConfirmationModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: "danger" | "primary";
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmationModal({
  open,
  title,
  subtitle = "Pastikan informasi sudah benar sebelum melanjutkan.",
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  confirmTone = "danger",
  loading = false,
  onClose,
  onConfirm
}: ConfirmationModalProps) {
  const isDanger = confirmTone === "danger";

  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      title={title}
      subtitle={subtitle}
      size="lg"
      bodyClassName="bg-slate-50"
    >
      <div className="space-y-5">
        <div
          className={cn(
            "rounded-2xl border bg-white p-6 text-center shadow-sm",
            isDanger ? "border-rose-100" : "border-blue-100"
          )}
        >
          <span
            className={cn(
              "mx-auto grid h-14 w-14 place-items-center rounded-2xl ring-1",
              isDanger
                ? "bg-rose-50 text-rose-600 ring-rose-100"
                : "bg-blue-50 text-[#223B8F] ring-blue-100"
            )}
          >
            {isDanger ? (
              <ExclamationTriangleIcon className="h-7 w-7" />
            ) : (
              <CheckCircleIcon className="h-7 w-7" />
            )}
          </span>

          <div className="mx-auto mt-4 max-w-xl">
            <p className="text-base font-semibold leading-relaxed text-slate-900">
              {description}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {subtitle}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Tindakan ini akan diproses setelah tombol konfirmasi ditekan.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            rounded="lg"
            className="px-4 py-2.5 text-sm font-semibold"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmTone}
            rounded="lg"
            className="gap-2 px-4 py-2.5 text-sm font-semibold"
            onClick={onConfirm}
            disabled={loading}
          >
            {!loading ? (
              isDanger ? (
                <ExclamationTriangleIcon className="h-4 w-4" />
              ) : (
                <CheckCircleIcon className="h-4 w-4" />
              )
            ) : null}
            {loading ? "Memproses..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
