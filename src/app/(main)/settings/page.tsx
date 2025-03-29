// src/app/(main)/settings/page.tsx
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SettingsTabs from "./SettingsTabs"; // move tab logic here

export default async function SettingsPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <SettingsTabs />
    </div>
  );
}
