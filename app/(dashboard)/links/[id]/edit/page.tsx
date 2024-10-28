"use client";

import { EditLinkForm } from "@/components/link-form/EditLinkForm";
import { useParams } from "next/navigation";

export default function EditLinkPage() {
  const params = useParams();
  const linkId = params.id as string;
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Link</h1>
      <EditLinkForm linkId={linkId} />
    </div>
  );
}
