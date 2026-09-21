import { NextRequest, NextResponse } from "next/server";
import { recommendSimilar, recommendPopular, recommendByCategory } from "@/lib/recommendations/engine";
import type { Locale } from "@/lib/i18n/config";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const product = searchParams.get("product");
  const category = searchParams.get("category");
  const locale = searchParams.get("locale") || "en";
  const limit = Math.min(parseInt(searchParams.get("limit") || "4", 10), 8);
  const exclude = searchParams.get("exclude")?.split(",").filter(Boolean) ?? [];

  if (!["en", "es"].includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const loc = locale as Locale;
  let results;

  if (product) {
    results = recommendSimilar(product, loc, limit, exclude);
  } else if (category) {
    results = recommendByCategory(category, loc, limit, exclude);
  } else {
    results = recommendPopular(loc, limit, exclude);
  }

  return NextResponse.json({ products: results }, {
    headers: {
      // Aggressive caching for recommendations — they refresh on new data
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}
