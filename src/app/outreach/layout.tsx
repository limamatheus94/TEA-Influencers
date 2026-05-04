import { OutreachSidebar } from "@/components/layout/outreach-sidebar";

export default function OutreachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <OutreachSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
