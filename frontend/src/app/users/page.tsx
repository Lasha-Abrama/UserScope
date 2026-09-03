import { Suspense } from "react";
import { UsersWorkspace } from "@/components/users/users-workspace";

function UsersLoading() { return <div className="skeleton h-[600px] rounded-2xl" />; }

export default function UsersPage() { return <Suspense fallback={<UsersLoading />}><UsersWorkspace /></Suspense>; }
