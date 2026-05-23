import React from "react";
import {
  ArrowTopRightOnSquareIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import type { InfrastrukturMarker } from "@/type/indonesiaInfrastruktur";

export function InfrastrukturMapPopupCard({
  marker,
  onClose
}: {
  marker: InfrastrukturMarker;
  onClose: () => void;
}) {
  return (
    <div className="modern-popup-content rounded-2xl bg-white p-4 text-[12px] text-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-slate-900">
            {marker.name}
          </div>
          <div className="truncate text-slate-600">
            {marker.countries.join(", ") || "-"}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Tutup popup marker"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2">
        <span className="font-semibold">Kategori:</span> {marker.categoryCode}
      </div>
    </div>
  );
}

export function InfrastrukturMapTooltipCard({
  marker,
  onClose
}: {
  marker: InfrastrukturMarker;
  onClose?: () => void;
}) {
  return (
    <div className="text-[11px]">
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold">{marker.name}</div>
        {onClose ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onClose();
            }}
            className="rounded-sm p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup tooltip marker"
          >
            <XMarkIcon className="h-3.5 w-3.5 shrink-0" />
          </button>
        ) : (
          <XMarkIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        )}
      </div>
      <div className="text-slate-700">{marker.countries[0] || "-"}</div>
      <div className="mt-1">
        <span className="font-semibold">Kategori:</span> {marker.categoryCode}
      </div>
    </div>
  );
}

export function InfrastrukturMapDetailCard({
  marker,
  onClose,
  className
}: {
  marker: InfrastrukturMarker;
  onClose: () => void;
  className?: string;
}) {
  const mapsUrl = `https://www.google.com/maps?q=${marker.latitude},${marker.longitude}`;
  const embedUrl = `https://www.google.com/maps?q=${marker.latitude},${marker.longitude}&z=12&output=embed`;
  const primaryCountry = marker.countries[0] ?? "-";
  const primaryIso3 = marker.countryAlpha3s[0] ?? "-";

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-xl bg-white/95 shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
          <div className="truncate pr-2 text-sm font-semibold">
            {marker.name}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-slate-100 p-1 text-slate-600 hover:bg-slate-200"
            aria-label="Tutup detail marker"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2 p-3 text-[12px] text-slate-800">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: marker.color }}
            />
            <span className="font-semibold">{marker.categoryCode}</span>
          </div>
          <div>
            <b>Negara:</b> {primaryCountry}
          </div>
          <div>
            <b>ISO3:</b> {primaryIso3}
          </div>
          <div>
            <b>Koordinat:</b>{" "}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
            </a>
          </div>
          {marker.address ? (
            <div>
              <b>Alamat:</b> {marker.address}
            </div>
          ) : null}
          {marker.website ? (
            <div>
              <b>Situs:</b>{" "}
              <a
                href={marker.website}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {marker.website}
              </a>
            </div>
          ) : null}
          <div className="pt-1">
            <div className="mb-1 text-[11px] text-slate-600">
              Tampilan detail (Google Maps - embed)
            </div>
            <div className="overflow-hidden rounded-lg ring-1 ring-slate-200">
              <iframe
                src={embedUrl}
                width="100%"
                height="200"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title={`Google Maps ${marker.name}`}
              />
            </div>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-2 rounded-md bg-blue-50 px-2 py-1 text-[11px] text-blue-700 hover:bg-blue-100"
          >
            Buka di Google Maps
            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
