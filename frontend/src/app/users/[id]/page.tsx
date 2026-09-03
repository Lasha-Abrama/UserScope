import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserDetails } from "@/components/users/user-details";

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div className="space-y-6"><Link href="/users" className="inline-flex items-center gap-2 text-sm font-semibold text-[#68748a] hover:text-[#3157d5]"><ArrowLeft size={16} /> Back to users</Link><UserDetails id={id} /></div>;
}
