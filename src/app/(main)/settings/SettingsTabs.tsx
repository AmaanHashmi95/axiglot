"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const Account = dynamic(() => import("./Account"));
const Subscription = dynamic(() => import("./Subscription"));
const Help = dynamic(() => import("./Help")); // ← import Help tab

export default function SettingsTabs() {
  const [tab, setTab] = useState<"account" | "subscription" | "help">("account");

  return (
    <div>
      <div className="flex gap-2 border-b pb-2">
        <button
          className={`px-4 py-2 font-medium ${
            tab === "account"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => setTab("account")}
        >
          Account
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            tab === "subscription"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => setTab("subscription")}
        >
          Subscription
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            tab === "help"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => setTab("help")}
        >
          Help
        </button>
      </div>

      <div className="mt-4">
        {tab === "account" && <Account />}
        {tab === "subscription" && <Subscription />}
        {tab === "help" && <Help />}
      </div>
    </div>
  );
}
