// src/components/LogoutButton.tsx
"use client";

import { logout } from "@/app/(auth)/actions";
import { LogOutIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useQueryClient } from "@tanstack/react-query";

export default function LogoutButton() {
  const queryClient = useQueryClient();

  function handleLogout() {
    queryClient.clear();
    logout();
  }

  return (
    <Button variant="destructive" onClick={handleLogout} className="mt-6 w-full">
      <LogOutIcon className="mr-2 size-4" />
      Logout
    </Button>
  );
}
