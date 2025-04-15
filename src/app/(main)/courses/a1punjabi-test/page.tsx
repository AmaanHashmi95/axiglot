import { Metadata } from "next";
import Image from "next/image";
import india from "@/assets/india-flag.png";
import Link from "next/link";


export const metadata: Metadata = {
   title: "Courses",
 };


export default function Page() {
 return (
   <main className="flex w-full min-w-0 justify-center">
     <div className="w-full min-w-0 space-y-5 max-w-5xl">
       <div className="rounded-2xl bg-card p-5 shadow-sm">
       <div className="flex items-center mb-5">
         <h1 className="text-center text-2xl font-bold">A1 Punjabi</h1>
         <Image
             src={india}
             alt="Punjabi Icon"
             width={30}
             height={30}
             className="ml-3"
           />
           </div>
       </div>
       <div className="rounded-2xl bg-card p-5 shadow-sm bg-gradient-to-r from-[#00bf63] to-[#ff8a00]">
       <div className="flex items-center mb-5">
           <h1 className="text-left text-2xl font-bold">Alphabet</h1>
           </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
         <Link href="/courses/lessons/gurmukhi1">
           <div className="rounded-2xl bg-white text-black p-5 shadow-sm w-full">
             <h1 className="text-left text-xl font-bold">ਓ, ਅ, ੲ, ਸ, ਹ</h1>
           </div>
           </Link>
           <div className="rounded-2xl bg-white text-black p-5 shadow-sm w-full">
             <h1 className="text-left text-xl font-bold">ਕ, ਖ, ਗ, ਘ, ਙ</h1>
           </div>
           <div className="rounded-2xl bg-white text-black p-5 shadow-sm w-full">
             <h1 className="text-left text-xl font-bold">ਕ, ਖ, ਗ, ਘ, ਙ</h1>
           </div>
           <div className="rounded-2xl bg-white text-black p-5 shadow-sm w-full">
             <h1 className="text-left text-xl font-bold">ਕ, ਖ, ਗ, ਘ, ਙ</h1>
           </div>
           <div className="rounded-2xl bg-white text-black p-5 shadow-sm w-full">
             <h1 className="text-left text-xl font-bold">ਕ, ਖ, ਗ, ਘ, ਙ</h1>
           </div>
         </div>
       </div>


       <div className="rounded-2xl bg-card p-5 shadow-sm bg-gradient-to-r from-[#00bf63] to-[#ff8a00]">
       <div className="flex items-center mb-5">
           <h1 className="text-left text-2xl font-bold">Numbers</h1>
           </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
         <Link href="/courses/lessons/gurmukhi1">
           <div className="rounded-2xl bg-white text-black p-5 shadow-sm w-full">
             <h1 className="text-left text-xl font-bold">1 - 10</h1>
           </div>
           </Link>
           <div className="rounded-2xl bg-white text-black p-5 shadow-sm w-full">
             <h1 className="text-left text-xl font-bold">11 - 20</h1>
           </div>
           <div className="rounded-2xl bg-white text-black p-5 shadow-sm w-full">
             <h1 className="text-left text-xl font-bold">21 - 100</h1>
           </div>
           <div className="rounded-2xl bg-white text-black p-5 shadow-sm w-full">
             <h1 className="text-left text-xl font-bold">101 - 1000</h1>
           </div>
         </div>
       </div>




     </div>
   </main>
 );
}

