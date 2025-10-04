import { WaiverSigningForm } from "@/components/gym-management/waivers/waiver-signing-form";

interface SignWaiverPageProps {
  params: Promise<{
    templateId: string;
  }>;
}

export default async function SignWaiverPage({ params }: SignWaiverPageProps) {
  const { templateId } = await params;

  return (
    <div className="min-h-screen bg-background">
      <WaiverSigningForm templateId={templateId} />
    </div>
  );
}
