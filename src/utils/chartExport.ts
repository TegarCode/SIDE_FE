export function formatExportCountryList(countries: string[], maxItems = 3) {
  if (countries.length === 0) return "-";
  if (countries.length <= maxItems) return countries.join(", ");
  return `${countries.slice(0, maxItems).join(", ")} +${countries.length - maxItems} lainnya`;
}

export function formatExportRouteLine(
  origins: string[],
  destinations: string[],
  maxItems = 3
) {
  return `Asal: ${formatExportCountryList(origins, maxItems)} -> Tujuan: ${formatExportCountryList(destinations, maxItems)}`;
}
