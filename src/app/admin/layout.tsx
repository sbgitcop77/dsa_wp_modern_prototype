import Image from "next/image";
import AdminContentArea from "@/components/AdminContentArea";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Image strip that sits behind the fixed transparent navbar (same height as navbar) */}
      <div className="h-16 lg:h-20 relative overflow-hidden">
        <Image
          src="/images/indoor-training-facility.webp"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>
      <AdminContentArea>{children}</AdminContentArea>
    </div>
  );
}
