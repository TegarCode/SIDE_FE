import type { RefObject } from "react";
import { CAPTCHA_MAX_LENGTH } from "@/constants/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form/Input";

type CaptchaFieldProps = {
  value: string;
  error?: string;
  image: string;
  loading: boolean;
  disabled?: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onRefresh: () => void;
  onPressEnter?: () => void;
};

export function CaptchaField({
  value,
  error,
  image,
  loading,
  disabled = false,
  inputRef,
  onChange,
  onRefresh,
  onPressEnter
}: CaptchaFieldProps) {
  return (
    <div className="mb-5">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Kode Keamanan
      </label>

      <div className="relative">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          {loading ? (
            <div className="grid h-16 place-items-center bg-slate-50 text-xs text-slate-500 md:h-20">
              Memuat CAPTCHA...
            </div>
          ) : image ? (
            <img
              src={image}
              alt="CAPTCHA"
              className="block h-auto w-full select-none"
              onContextMenu={(event) => event.preventDefault()}
              draggable={false}
            />
          ) : (
            <div className="grid h-16 place-items-center bg-slate-50 text-xs text-slate-500 md:h-20">
              CAPTCHA belum tersedia
            </div>
          )}
        </div>

        <Button
          type="button"
          onClick={onRefresh}
          disabled={disabled}
          className="absolute right-2 top-2 inline-flex items-center gap-2 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow ring-1 ring-slate-200 backdrop-blur hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Muat ulang CAPTCHA"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M3 12a9 9 0 1 0 9-9" />
            <path d="M3 4v6h6" />
          </svg>
          Refresh
        </Button>
      </div>

      <div className="mt-2">
        <Input
          ref={inputRef}
          id="captcha"
          name="captcha"
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck="false"
          maxLength={CAPTCHA_MAX_LENGTH}
          value={value}
          onChange={(event) =>
            onChange(event.target.value.toUpperCase().replace(/\s+/g, ""))
          }
          onKeyDown={(event) => {
            if (event.key === "Enter" && onPressEnter) onPressEnter();
          }}
          placeholder="Masukkan kode di atas"
          disabled={disabled}
          error={error}
          helperText={
            !error
              ? "Huruf tidak peka besar/kecil. Klik Refresh bila sulit dibaca."
              : undefined
          }
          className={`px-4 font-mono text-[15px] tracking-widest ${
            !error ? "border-gray-300 focus:ring-blue-500" : ""
          } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
          required
        />
      </div>
    </div>
  );
}
