import { notFound } from "next/navigation";
import { getHomepage } from "@/lib/content";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { SectionRenderer } from "@/components/home/SectionRenderer";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const homepage = getHomepage(locale);
  return (
    <>
      {homepage.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} locale={locale} />
      ))}
    </>
  );
}
