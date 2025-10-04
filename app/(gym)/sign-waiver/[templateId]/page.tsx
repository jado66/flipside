import { WaiverSigningForm } from "@/components/gym-management/waivers/waiver-signing-form";

interface SignWaiverPageProps {
  params: {
    templateId: string;
  };
}

export default function SignWaiverPage({ params }: SignWaiverPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <WaiverSigningForm templateId={params.templateId} />
    </div>
  );
}
