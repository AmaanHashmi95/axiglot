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
      <h2 className="text-xl font-bold">Manage Subscription</h2>

      {subscriptionStatus ? (
        <div className="space-y-2">
          <p>
            <strong>Status:</strong> {subscriptionStatus.status}
          </p>
          <p>
            <strong>Renews on:</strong> {subscriptionStatus.renewal}
          </p>
        </div>
      ) : (
        <p>Loading subscription info...</p>
      )}

      <Button onClick={openStripePortal} disabled={loading}>
        {loading ? "Redirecting..." : "Manage Billing in Stripe"}
      </Button>
    </div>
  );
}
