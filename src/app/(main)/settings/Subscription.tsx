"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Subscription() {
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<null | {
    renewal: string;
    status: string;
  }>(null);

  useEffect(() => {
    fetch("/api/stripe/subscription-status")
      .then((res) => res.json())
      .then(setSubscriptionStatus)
      .catch(() => setSubscriptionStatus(null));
  }, []);

  const openStripePortal = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/create-customer-portal-session", {
      method: "POST",
    });
    const data = await res.json();
    if (data?.url) window.location.href = data.url;
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Button onClick={openStripePortal} disabled={loading}>
        {loading ? "Redirecting..." : "Manage Subscription"}
      </Button>
    </div>
  );
}
