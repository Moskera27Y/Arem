import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary((locale === "es" ? "es" : "en") as Locale);
  return { title: dict.checkout.title };
}

export default function CheckoutPage() {
  return <CheckoutForm />;
}
