// src/app/(main)/settings/page.tsx
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SettingsTabs from "./SettingsTabs";

type SettingsSearch = { tab?: string };

export default async function SettingsPage(
  { searchParams }: { searchParams: Promise<SettingsSearch> }
) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const { tab } = await searchParams;
  const current =
    tab === "account" || tab === "subscription" || tab === "help"
      ? tab
      : "account";

  // If you want to hard-redirect bad values instead of coercing:
  // if (current !== (tab ?? "")) redirect("/settings?tab=account");

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <SettingsTabs currentTab={current as "account" | "subscription" | "help"} />
    </div>
  );
}
