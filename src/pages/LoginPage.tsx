import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { APP_NAME } from "@/constants/app";
import { AUTH_LOGIN_BG_URL, AUTH_LOGO_URL } from "@/constants/auth";
import { APP_ROUTES } from "@/constants/routes";
import { CaptchaField } from "@/components/auth/CaptchaField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form/Input";
import { useToast } from "@/components/ui/Toast";
import { useCaptchaQuery } from "@/hooks/auth/useCaptchaQuery";
import { useLoginMutation } from "@/hooks/auth/useLoginMutation";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { saveAuthSession } from "@/service/authSession";
import type { LoginFormValues } from "@/type/auth";
import { validateLoginForm } from "@/validators/login";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function extractErrorMessage(error: unknown) {
  if (!error || typeof error !== "object")
    return "Gagal masuk. Silakan coba lagi.";

  const err = error as {
    message?: unknown;
    response?: { data?: { message?: unknown } };
  };

  return (
    asString(err.response?.data?.message) ||
    asString(err.message) ||
    "Gagal masuk. Silakan coba lagi."
  );
}

export function LoginPage() {
  useDocumentTitle(`Login | ${APP_NAME}`);

  const navigate = useNavigate();
  const { toast } = useToast();
  const loginMutation = useLoginMutation();
  const { captchaId, captchaImage, isCaptchaLoading, refreshCaptcha } =
    useCaptchaQuery();
  const captchaInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<LoginFormValues>({
    email: "",
    password: "",
    captcha: ""
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormValues, string>>
  >({});
  const [showPassword, setShowPassword] = useState(false);

  const isSubmitting = loginMutation.isPending;

  const notify = (
    title: string,
    tone: "info" | "success" | "warning" | "error" = "error",
    description?: string
  ) => {
    toast({ title, tone, description });
  };

  const normalizedCaptchaImage = useMemo(() => captchaImage, [captchaImage]);

  const handleFieldChange = (field: keyof LoginFormValues, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: undefined }));
    }
  };

  const submitLogin = async () => {
    const validationErrors = await validateLoginForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    if (!captchaId) {
      notify("CAPTCHA belum siap", "warning", "Silakan refresh dan coba lagi.");
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({
        email: form.email,
        password: form.password,
        captcha_id: captchaId,
        captcha: form.captcha
      });

      if (!result.token && !result.user) {
        throw new Error("Respons login tidak valid.");
      }

      saveAuthSession({
        token: result.token,
        tokenType: result.tokenType,
        user: result.user,
        remember: false
      });

      notify("Berhasil masuk", "success", "Anda akan diarahkan ke beranda.");
      navigate(APP_ROUTES.HOME);
    } catch (error) {
      const message = extractErrorMessage(error);
      const lower = message.toLowerCase();

      if (lower.includes("captcha")) {
        await refreshCaptcha();
        setForm((previous) => ({ ...previous, captcha: "" }));
        setErrors((previous) => ({
          ...previous,
          captcha: "Kode CAPTCHA salah atau kedaluwarsa."
        }));
        notify(
          "CAPTCHA tidak valid",
          "error",
          "Kode CAPTCHA salah atau kedaluwarsa."
        );
        setTimeout(() => captchaInputRef.current?.focus(), 0);
        return;
      }

      if (
        lower.includes("email") ||
        lower.includes("password") ||
        lower.includes("kata sandi")
      ) {
        notify("Login gagal", "error", "Email atau kata sandi salah.");
        return;
      }

      notify("Login gagal", "error", message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-slate-900">
      <div
        className="absolute inset-0 -z-10 bg-fixed"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(56,74,160,0.92) 0%, rgba(56,74,160,0.88) 55%, rgba(255,185,0,0.20) 125%), url(${AUTH_LOGIN_BG_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div
          className="absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(255,185,0,0.35) 0%, rgba(255,185,0,0) 70%)"
          }}
        />
        <div
          className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(255,185,0,0.22) 0%, rgba(255,185,0,0) 70%)"
          }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] ring-2 ring-white/20">
            <img
              src={AUTH_LOGO_URL}
              alt="Kementerian Luar Negeri Republik Indonesia"
              className="h-12 w-12 object-contain"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="mt-3 text-2xl font-bold text-white drop-shadow-sm">
            Masuk ke Sistem Informasi Diplomasi Ekonomi
          </h1>
          <p className="mt-1 text-sm text-white/85">
            Gunakan akun Anda untuk melanjutkan.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/95 p-5 shadow-xl backdrop-blur md:p-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submitLogin();
            }}
            noValidate
            aria-busy={isSubmitting}
          >
            <div className="mb-4">
              <Input
                id="email"
                name="email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="nama@domain.go.id"
                value={form.email}
                onChange={(event) =>
                  handleFieldChange("email", event.target.value)
                }
                disabled={isSubmitting}
                error={errors.email}
                className={isSubmitting ? "cursor-not-allowed opacity-70" : ""}
              />
            </div>

            <div className="mb-4">
              <Input
                id="password"
                name="password"
                label="Kata Sandi"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="********"
                value={form.password}
                onChange={(event) =>
                  handleFieldChange("password", event.target.value)
                }
                disabled={isSubmitting}
                error={errors.password}
                className={isSubmitting ? "cursor-not-allowed opacity-70" : ""}
                rightSlot={
                  <Button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    disabled={isSubmitting}
                    aria-label={
                      showPassword
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                    className="text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <svg
                      aria-hidden
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      {showPassword ? (
                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zm10 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                      ) : (
                        <>
                          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
                          <circle cx="12" cy="12" r="3.5" />
                          <path d="M3 3l18 18" />
                        </>
                      )}
                    </svg>
                  </Button>
                }
              />
            </div>

            <CaptchaField
              value={form.captcha}
              error={errors.captcha}
              image={normalizedCaptchaImage}
              loading={isCaptchaLoading}
              disabled={isSubmitting}
              inputRef={captchaInputRef}
              onChange={(value) => handleFieldChange("captcha", value)}
              onRefresh={() => {
                void refreshCaptcha();
                handleFieldChange("captcha", "");
                setTimeout(() => captchaInputRef.current?.focus(), 0);
              }}
              onPressEnter={() => {
                void submitLogin();
              }}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full rounded-xl bg-linear-to-r from-[#384AA0] to-[#FFB900] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(56,74,160,0.35)] ring-2 ring-transparent hover:opacity-95 focus:outline-none focus:ring-[#FFB900] disabled:opacity-60"
            >
              <span className="pointer-events-none absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-[#FFB900] to-transparent opacity-90" />
              {isSubmitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
