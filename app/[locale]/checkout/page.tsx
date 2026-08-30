import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Checkout" };
}

export default function CheckoutPage() {
  return <CheckoutForm />;
}
