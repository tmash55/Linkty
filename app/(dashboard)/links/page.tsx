import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import LinksTable from "@/components/link-form/LinksTable";

export default function LinksPage() {
  return (
    <main className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Your Links</h1>
        <Button asChild>
          <Link href="/links/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Create New Link
          </Link>
        </Button>
      </div>
      <LinksTable />
    </main>
  );
}
