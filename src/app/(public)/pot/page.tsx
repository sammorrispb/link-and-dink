import { redirect } from "next/navigation";
import { getFeaturedEventSlug } from "@/lib/events";

export const dynamic = "force-dynamic";

// /pot with no slug -> current P3 popup.
export default async function PotIndexPage() {
  const slug = await getFeaturedEventSlug();
  redirect(slug ? `/pot/${slug}` : "/");
}
