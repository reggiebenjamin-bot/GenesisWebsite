import { inquiryMessages } from "./aiEmployees.ts";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AiEmployeeInquiry = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

export type InquiryParse =
  | { ok: true; honeypot: true }
  | { ok: true; honeypot: false; inquiry: AiEmployeeInquiry }
  | { ok: false; message: (typeof inquiryMessages)["invalid"] };

const text = (value: unknown, max: number) =>
  (typeof value === "string" ? value.trim() : "").slice(0, max);

export function parseInquiry(data: Record<string, unknown>): InquiryParse {
  if (text(data.website, 200)) return { ok: true, honeypot: true };

  const name = text(data.name, 120);
  const email = text(data.email, 200);
  const phone = text(data.phone, 40);
  const digits = phone.replace(/\D/g, "");

  if (name.length < 2 || !emailPattern.test(email) || digits.length < 7 || digits.length > 15) {
    return { ok: false, message: inquiryMessages.invalid };
  }

  return {
    ok: true,
    honeypot: false,
    inquiry: {
      name,
      email,
      phone,
      company: text(data.company, 160),
      message: text(data.message, 2000),
    },
  };
}
