import { z } from "zod";

export type FieldType = {
  name: string;
  label?: string;
  type:
  | "text"
  | "number"
  | "email"
  | "password"
  | "phone"
  | "file"
  | "textarea"
  | "radio"
  | "textArea"
  | "images"
  | "select";
  options?: { label: string, value: string }[];
  validation?: z.ZodTypeAny;
  icon?: React.ReactNode;
  placeHolder?: string
  defaultValue?: string | any

};