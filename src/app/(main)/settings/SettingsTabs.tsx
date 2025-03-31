// src/app/(main)/settings/SettingsTabs.tsx
import Account from "./Account";
import Subscription from "./Subscription";
import Help from "./Help";

interface Props {
  currentTab: "account" | "subscription" | "help";
}

export default function SettingsTabs({ currentTab }: Props) {
  return (
    <div>
      <div className="flex gap-2 border-b pb-2">
        <a
          href="?tab=account"
          className={`px-4 py-2 font-medium ${
            currentTab === "account"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          Account
        </a>
        <a
          href="?tab=subscription"
          className={`px-4 py-2 font-medium ${
            currentTab === "subscription"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          Subscription
        </a>
        <a
          href="?tab=help"
          className={`px-4 py-2 font-medium ${
            currentTab === "help"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          Help
        </a>
      </div>

      <div className="mt-4">
        {currentTab === "account" && <Account />}
        {currentTab === "subscription" && <Subscription />}
        {currentTab === "help" && <Help />}
      </div>
    </div>
  );
}
