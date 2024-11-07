import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
import config from "@/config";
import SideNav from "@/components/side-nav/SideNav";
import { Toaster } from "@/components/ui/toaster";

export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(config.auth.loginUrl);
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
      <SideNav />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="container mx-auto p-4 md:p-8">
          {children}
          <Toaster />
        </div>
      </main>
    </div>
  );
}
