import React from "react";

export function InfrastrukturTabPlaceholder({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <h3 className="font-semibold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </>
  );
}
