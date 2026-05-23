import React from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  InfrastrukturMapDetailCard,
  InfrastrukturMapPopupCard,
  InfrastrukturMapTooltipCard
} from "@/components/ui/InfrastrukturMapInfoCard";
import { cn } from "@/utils/cn";
import type { InfrastrukturMarker } from "@/type/indonesiaInfrastruktur";

type InfrastrukturMapProps = {
  markers: InfrastrukturMarker[];
  className?: string;
};

type WorldGeoJson = GeoJSON.GeoJsonObject | null;

const CATEGORY_COLORS: Record<string, string> = {
  KBRI: "#1f2937",
  KJRI: "#0f766e",
  KRI: "#334155",
  ITPC: "#0ea5e9",
  IIPC: "#f59e0b",
  BUMN: "#7c3aed",
  PERBANKAN: "#475569"
};

function getIso3(properties: Record<string, unknown>) {
  const keys = ["ISO_A3", "ADM0_A3", "WB_A3", "ISO3", "iso3"];
  for (const key of keys) {
    const value = properties[key];
    if (typeof value === "string" && value.trim()) return value.toUpperCase();
  }
  return null;
}

function getCountryName(properties: Record<string, unknown>) {
  const keys = ["NAME_LONG", "ADMIN", "NAME_EN", "BRK_NAME", "NAME"];
  for (const key of keys) {
    const value = properties[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "Negara";
}

function buildPinIcon(color = "#3b82f6") {
  const html = `<div class="pin" style="--pin-color:${color}">
      <span class="pin-dot"></span>
    </div>`;

  return L.divIcon({
    className: "pin-wrap",
    html,
    iconSize: [24, 32],
    iconAnchor: [12, 30],
    popupAnchor: [0, -24]
  });
}

function GlobalStyles() {
  return (
    <style>{`
      .pin-wrap {
        transform: translateY(-6px);
      }
      .pin {
        width: 22px;
        height: 22px;
        border-radius: 12px;
        background: radial-gradient(circle at 35% 35%, #ffffff, #f8fafc 60%, #e2e8f0 90%);
        border: 2px solid #fff;
        box-shadow: 0 6px 18px rgba(2, 6, 23, 0.25);
        position: relative;
      }
      .pin::after {
        content: "";
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: -8px;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid var(--pin-color);
        filter: drop-shadow(0 2px 4px rgba(2, 6, 23, 0.18));
      }
      .pin-dot {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 10px;
        height: 10px;
        transform: translate(-50%, -50%);
        background: var(--pin-color);
        border-radius: 999px;
        box-shadow: inset 0 0 0 2px #ffffff;
      }
      .leaflet-tooltip.modern-tooltip {
        background: rgba(255, 255, 255, 0.94);
        color: #0f172a;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        box-shadow: 0 8px 20px rgba(2, 6, 23, 0.08);
        padding: 8px 10px;
        font-size: 11.5px;
      }
      .leaflet-popup-content-wrapper.modern-popup {
        border-radius: 16px;
        box-shadow: 0 14px 32px rgba(15, 23, 42, 0.18);
        padding: 0;
      }
      .leaflet-popup-content.modern-popup-content {
        margin: 0;
        min-width: 230px;
      }
      .leaflet-popup-tip.modern-popup-tip {
        box-shadow: -4px 4px 10px rgba(15, 23, 42, 0.12);
      }
      .leaflet-pane,
      .leaflet-top,
      .leaflet-bottom,
      .leaflet-control {
        z-index: 10 !important;
      }
    `}</style>
  );
}

function AutoFitOnInit({ markers }: { markers: InfrastrukturMarker[] }) {
  const map = useMap();

  React.useEffect(() => {
    if (!markers.length) return;
    const bounds = L.latLngBounds(
      markers.map(
        (marker) => [marker.latitude, marker.longitude] as [number, number]
      )
    );
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [28, 28] });
  }, [map, markers]);

  return null;
}

function ResetMapView({
  markers,
  resetKey
}: {
  markers: InfrastrukturMarker[];
  resetKey: number;
}) {
  const map = useMap();

  React.useEffect(() => {
    if (!markers.length) return;
    const bounds = L.latLngBounds(
      markers.map(
        (marker) => [marker.latitude, marker.longitude] as [number, number]
      )
    );
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [28, 28] });
  }, [map, markers, resetKey]);

  return null;
}

function SelectedMarkerFocus({
  marker
}: {
  marker: InfrastrukturMarker | null;
}) {
  const map = useMap();

  React.useEffect(() => {
    if (!marker) return;
    map.flyTo(
      [marker.latitude, marker.longitude],
      Math.max(map.getZoom(), 12),
      {
        duration: 0.6
      }
    );
  }, [map, marker]);

  return null;
}

function CountryLayer({
  worldGeo,
  countryStats,
  onCountryClick
}: {
  worldGeo: WorldGeoJson;
  countryStats: Record<
    string,
    { total: number; byCat: Record<string, number> }
  >;
  onCountryClick: (iso3: string, name: string) => void;
}) {
  const map = useMap();

  const onEachFeature = React.useCallback(
    (feature: GeoJSON.Feature, layer: L.Layer) => {
      if (!feature.properties || !(layer instanceof L.Path)) return;
      const iso3 = getIso3(feature.properties as Record<string, unknown>);
      const name = getCountryName(
        feature.properties as Record<string, unknown>
      );
      const stats = iso3 ? countryStats[iso3] : null;
      const hasData = Boolean(stats);

      layer.setStyle({
        color: hasData ? "#475569" : "#cbd5e1",
        weight: hasData ? 1.2 : 0.8,
        fillColor: hasData ? "#60a5fa" : "#e5e7eb",
        fillOpacity: hasData ? 0.2 : 0.08
      });

      const rows = [
        `<div style="font-weight:700;margin-bottom:4px">${name}</div>`,
        stats
          ? `<div>Total perwakilan: <b>${stats.total.toLocaleString("id-ID")}</b></div>`
          : `<div>Belum ada data perwakilan</div>`
      ];

      layer.bindTooltip(`<div style="font-size:12px">${rows.join("")}</div>`, {
        sticky: true,
        opacity: 0.98,
        direction: "top",
        className: "modern-tooltip"
      });

      layer.on({
        mouseover: () => {
          layer.setStyle({
            color: "#0ea5e9",
            weight: 2,
            fillColor: "#38bdf8",
            fillOpacity: 0.3
          });
          layer.openTooltip();
        },
        mouseout: () => {
          layer.setStyle({
            color: hasData ? "#475569" : "#cbd5e1",
            weight: hasData ? 1.2 : 0.8,
            fillColor: hasData ? "#60a5fa" : "#e5e7eb",
            fillOpacity: hasData ? 0.2 : 0.08
          });
        },
        click: () => {
          const bounds = (
            layer as L.Path & { getBounds?: () => L.LatLngBounds }
          ).getBounds?.();
          if (bounds?.isValid()) map.fitBounds(bounds, { padding: [28, 28] });
          if (iso3) onCountryClick(iso3, name);
        }
      });
    },
    [countryStats, map, onCountryClick]
  );

  if (!worldGeo) return null;
  return <GeoJSON data={worldGeo} onEachFeature={onEachFeature} />;
}

function CountryPanel({
  countryName,
  markers,
  onClose,
  onSelectMarker
}: {
  countryName: string;
  markers: InfrastrukturMarker[];
  onClose: () => void;
  onSelectMarker: (marker: InfrastrukturMarker) => void;
}) {
  return (
    <div className="absolute left-3 top-3 z-500 max-w-xs sm:max-w-sm">
      <div className="overflow-hidden rounded-xl bg-white/95 shadow ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
          <div className="truncate pr-2 text-sm font-semibold">
            {countryName}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-slate-100 px-2 py-1 text-[11px] hover:bg-slate-200"
          >
            Tutup
          </button>
        </div>
        <div className="p-3">
          {!markers.length ? (
            <div className="text-[12px] text-slate-600">
              Belum ada perwakilan yang dipetakan.
            </div>
          ) : (
            <div className="space-y-2">
              {markers.map((marker) => (
                <button
                  key={marker.id}
                  type="button"
                  onClick={() => onSelectMarker(marker)}
                  className="w-full rounded-lg p-2 text-left ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: marker.color }}
                    />
                    <div className="text-[12px]">
                      <div className="font-semibold">{marker.name}</div>
                      <div className="text-slate-600">
                        {marker.categoryCode} • {marker.countries[0] ?? "-"}
                      </div>
                      {marker.address ? (
                        <div className="mt-0.5 line-clamp-2 text-slate-700">
                          {marker.address}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Legend() {
  const entries = Object.entries(CATEGORY_COLORS);
  return (
    <div className="absolute bottom-3 left-3 z-500">
      <div className="rounded-lg bg-white/95 p-2 text-[11px] shadow ring-1 ring-slate-200">
        <div className="mb-1 font-semibold">Kategori</div>
        <div className="grid grid-cols-2 gap-2">
          {entries.map(([key, color]) => (
            <div key={key} className="inline-flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: color }}
              />
              <span>{key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InfrastrukturMap({
  markers,
  className
}: InfrastrukturMapProps) {
  const [worldGeo, setWorldGeo] = React.useState<WorldGeoJson>(null);
  const [selectedCountry, setSelectedCountry] = React.useState<{
    iso3: string;
    name: string;
  } | null>(null);
  const [selectedMarker, setSelectedMarker] =
    React.useState<InfrastrukturMarker | null>(null);
  const [resetViewKey, setResetViewKey] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const response = await fetch("/assets/world-countries.geojson");
        const data = (await response.json()) as GeoJSON.GeoJsonObject;
        if (mounted) setWorldGeo(data);
      } catch {
        if (mounted) setWorldGeo(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const center = React.useMemo<[number, number]>(() => {
    if (!markers.length) return [10, 15];
    const latitude =
      markers.reduce((sum, item) => sum + item.latitude, 0) / markers.length;
    const longitude =
      markers.reduce((sum, item) => sum + item.longitude, 0) / markers.length;
    return [latitude, longitude];
  }, [markers]);

  const countryStats = React.useMemo(() => {
    const stats: Record<
      string,
      { total: number; byCat: Record<string, number> }
    > = {};

    markers.forEach((marker) => {
      marker.countryAlpha3s.forEach((alpha3) => {
        if (!stats[alpha3]) stats[alpha3] = { total: 0, byCat: {} };
        stats[alpha3].total += 1;
        stats[alpha3].byCat[marker.categoryCode] =
          (stats[alpha3].byCat[marker.categoryCode] ?? 0) + 1;
      });
    });

    return stats;
  }, [markers]);

  const countryMarkers = React.useMemo(() => {
    if (!selectedCountry) return [];
    return markers.filter((marker) =>
      marker.countryAlpha3s.includes(selectedCountry.iso3)
    );
  }, [markers, selectedCountry]);

  const handleResetSelection = React.useCallback(() => {
    setSelectedCountry(null);
    setSelectedMarker(null);
    setResetViewKey((current) => current + 1);
  }, []);

  if (!markers.length) {
    return (
      <div className="flex h-full min-h-96 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
        Data lokasi perwakilan belum tersedia untuk filter aktif.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-slate-200",
        className
      )}
    >
      <GlobalStyles />
      <MapContainer
        center={center}
        zoom={2}
        scrollWheelZoom
        className="h-full w-full"
        worldCopyJump
        minZoom={2}
        maxZoom={20}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoFitOnInit markers={markers} />
        <ResetMapView markers={markers} resetKey={resetViewKey} />
        <SelectedMarkerFocus marker={selectedMarker} />
        <CountryLayer
          worldGeo={worldGeo}
          countryStats={countryStats}
          onCountryClick={(iso3, name) => {
            setSelectedMarker(null);
            setSelectedCountry({ iso3, name });
          }}
        />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={buildPinIcon(marker.color)}
            eventHandlers={{
              click: () => {
                setSelectedCountry(null);
                setSelectedMarker(marker);
              }
            }}
          >
            {selectedMarker?.id === marker.id ? (
              <Popup
                closeButton={false}
                autoClose={false}
                closeOnClick={false}
                className="modern-popup"
                offset={[0, -24]}
              >
                <InfrastrukturMapPopupCard
                  marker={marker}
                  onClose={handleResetSelection}
                />
              </Popup>
            ) : null}
            {selectedMarker?.id === marker.id ? (
              <Tooltip
                direction="top"
                opacity={0.98}
                permanent
                interactive
                className="modern-tooltip"
              >
                <InfrastrukturMapTooltipCard
                  marker={marker}
                  onClose={handleResetSelection}
                />
              </Tooltip>
            ) : null}
          </Marker>
        ))}
      </MapContainer>

      <Legend />
      {selectedCountry ? (
        <CountryPanel
          countryName={selectedCountry.name}
          markers={countryMarkers}
          onClose={handleResetSelection}
          onSelectMarker={(marker) => {
            setSelectedCountry(null);
            setSelectedMarker(marker);
          }}
        />
      ) : null}
      {selectedMarker ? (
        <InfrastrukturMapDetailCard
          marker={selectedMarker}
          onClose={handleResetSelection}
          className="absolute left-3 top-3 z-500 max-w-xs sm:max-w-sm"
        />
      ) : null}
    </div>
  );
}
