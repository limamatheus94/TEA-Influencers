import { CreatorSidebar } from "@/components/layout/creator-sidebar";

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <CreatorSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
