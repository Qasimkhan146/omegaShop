// import { z } from "zod";

// export const contactSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   email: z.string().email("Invalid email address"),
//   phone: z.string().min(1, "Phone number is required"),
//   subject: z.string().min(1, "Subject is required"),
//   message: z.string().min(1, "Message is required"),
// });

// export type ContactSchema = z.infer<typeof contactSchema>;

import { z } from "zod";
import { useLanguage } from "../../context/LanguageContext";
import { languageData } from "@/utils/languageData";

export const contactSchema = () => {
  const { language } = useLanguage();
  const t = languageData[language]?.schema ?? {};

  return z.object({
    name: z.string().min(1, t.name || "Name is required"),
    email: z.string().email(t.email || "Invalid email address"),
    phone: z.string().min(1, t.phone || "Phone number is required"),
    subject: z.string().min(1, t.subject || "Subject is required"),
    message: z.string().min(1, t.message || "Message is required"),
  });
};

export type ContactSchema = z.infer<ReturnType<typeof contactSchema>>;
