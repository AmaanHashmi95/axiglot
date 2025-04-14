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
    <Button
      onClick={handleLogout}
      className="mt-6 w-full bg-gradient-to-r from-[#ff8a00] to-[#ef2626] text-white hover:opacity-90 transition-opacity"
    >
      <LogOutIcon className="mr-2 size-4" />
      Logout
    </Button>
  );
}
