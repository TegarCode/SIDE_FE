import * as yup from "yup";

export const hsCodeFilterSchema = yup
  .array()
  .of(yup.string().trim().required())
  .min(1, "Pilih minimal satu HS Code sebelum mencari data.")
  .required("Pilih minimal satu HS Code sebelum mencari data.");

export const bilateralHsCodeRouteSchema = yup.object({
  origins: yup
    .array()
    .of(yup.string().trim().required())
    .min(1, "Pilih minimal satu negara/entitas asal.")
    .required(),
  destinations: yup
    .array()
    .of(yup.string().trim().required())
    .min(1, "Pilih minimal satu negara/entitas tujuan.")
    .required(),
  hsCodes: yup
    .array()
    .of(yup.string().trim().required())
    .min(1, "Pilih minimal satu HS Code.")
    .required()
});
