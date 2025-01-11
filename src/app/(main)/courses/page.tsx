import { Metadata } from "next";
import Image from "next/image";
import india from "@/assets/india-flag.png";
import pakistan from "@/assets/pakistan-flag.png";
import Link from "next/link";


export const metadata: Metadata = {
   title: "Courses",
 };


export default function Page() {
 return (
   <main className="flex w-full min-w-0 justify-center">
     <div className="w-full min-w-0 space-y-5 max-w-5xl">
       <div className="rounded-2xl bg-card p-5 shadow-sm">
         <h1 className="text-center text-2xl font-bold">Courses</h1>
       </div>
     </div>
   </main>
 );
}
