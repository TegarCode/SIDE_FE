import { cn } from "@/utils/cn";

type CountryFlagProps = {
  alpha2?: string | null;
  countryName?: string;
  className?: string;
};

function toFlagEmoji(alpha2?: string | null) {
  if (!alpha2) return null;
  const value = alpha2.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(value)) return null;

  const codePoints = Array.from(value).map(
    (char) => 127397 + char.charCodeAt(0)
  );
  return String.fromCodePoint(...codePoints);
}

function shouldHideFlag(alpha2?: string | null, countryName?: string) {
  const normalizedAlpha2 = (alpha2 ?? "").trim().toUpperCase();
  if (normalizedAlpha2 === "IL" || normalizedAlpha2 === "TW") return true;

  const normalizedCountryName = (countryName ?? "").trim().toUpperCase();
  return (
    normalizedCountryName === "ISRAEL" || normalizedCountryName === "TAIWAN"
  );
}

function fallbackLabel(countryName?: string) {
  const source = (countryName ?? "").trim();
  if (!source) return "?";
  const words = source.split(/\s+/).slice(0, 2);
  return words.map((word) => word[0]?.toUpperCase() ?? "").join("") || "?";
}

export function CountryFlag({
  alpha2,
  countryName,
  className
}: CountryFlagProps) {
  const hiddenFlag = shouldHideFlag(alpha2, countryName);
  const flagEmoji = hiddenFlag ? null : toFlagEmoji(alpha2);

  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-none bg-transparent text-sm",
        className
      )}
      aria-label={countryName ?? alpha2 ?? "Negara"}
      title={countryName ?? alpha2 ?? "Negara"}
    >
      {flagEmoji ? (
        <span className="leading-none">{flagEmoji}</span>
      ) : hiddenFlag ? null : (
        <span className="text-[10px] font-semibold text-slate-600">
          {fallbackLabel(countryName)}
        </span>
      )}
    </span>
  );
}
