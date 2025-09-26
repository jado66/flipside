import { AthleteProfile } from "@/components/athletes/athlete-profile";
import { notFound } from "next/navigation";
import { Athlete } from "@/lib/types/athlete";
import { createServer } from "@/utils/supabase/server";

async function getAthlete(slug: string): Promise<Athlete | null> {
  const supabaseServer = createServer();
  const { data: athlete, error } = await supabaseServer
    .from("athletes")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !athlete) {
    return null;
  }

  return athlete as Athlete;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const athlete = await getAthlete(slug);

  if (!athlete) {
    return {
      title: "Athlete Not Found",
    };
  }

  return {
    title: `${athlete.name} - ${athlete.sport} Athlete | Trickipedia`,
    description:
      athlete.bio ||
      `${athlete.name} is a ${athlete.skill_level} ${athlete.sport} athlete on Trickipedia.`,
    openGraph: {
      title: athlete.name,
      description: athlete.bio,
      images: athlete.profile_image_url ? [athlete.profile_image_url] : [],
    },
  };
}

export default async function AthleteProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const athlete = await getAthlete(slug);

  if (!athlete) {
    notFound();
  }

  return <AthleteProfile athlete={athlete} />;
}
