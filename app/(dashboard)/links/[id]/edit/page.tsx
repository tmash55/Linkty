"use client";

import { EditLinkForm } from "@/components/link-form/EditLinkForm";
import { useParams } from "next/navigation";

export default function EditLinkPage() {
  const params = useParams();
  const linkId = params.id as string;
  return (
    <div className="container mx-auto py-8">
      <EditLinkForm linkId={linkId} />
    </div>
  );
}
