import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import Dashboard from "./Dashboard";

export default async function DashboardPage() {
  if (isDemoMode) return <Dashboard />;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <Dashboard />;
}
