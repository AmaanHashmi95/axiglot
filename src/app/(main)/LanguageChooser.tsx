"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuPortal,
   DropdownMenuSeparator,
   DropdownMenuSub,
   DropdownMenuSubContent,
   DropdownMenuSubTrigger,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import india from "@/assets/india-flag.png";
import pakistan from "@/assets/pakistan-flag.png";

 interface LanguageChooserProps {
   className?: string;
 }

 export default function UserButton({ className }: LanguageChooserProps) {
   const { user } = useSession();
   const { theme, setTheme } = useTheme();
   const queryClient = useQueryClient();

   return <DropdownMenu>
       <DropdownMenuTrigger asChild>
           <button className={cn("flex-none rounded-full", className)}>
           <p>Choose a language</p>
           </button>
       </DropdownMenuTrigger>
       <DropdownMenuContent>
         <DropdownMenuItem>
         <Image
           src={india}
           alt="Home"
           width={30}
           height={30}
         />
           Punjabi
         </DropdownMenuItem>
         <DropdownMenuItem>
         <Image
           src={pakistan}
           alt="Home"
           width={30}
           height={30}
         />
           Urdu
         </DropdownMenuItem>
       </DropdownMenuContent>
   </DropdownMenu>
 }
