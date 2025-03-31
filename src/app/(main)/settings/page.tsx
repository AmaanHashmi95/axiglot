// src/app/(main)/settings/page.tsx
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SettingsTabs from "./SettingsTabs";

export default async function SettingsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

  const tab = searchParams.tab ?? "account";

  if (!["account", "subscription", "help"].includes(tab)) {
    redirect("/settings?tab=account");
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <SettingsTabs currentTab={tab as "account" | "subscription" | "help"} />
    </div>
  );
}
