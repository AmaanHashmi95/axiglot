import { validateRequest, lucia } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SessionProvider from "./SessionProvider";
import Navbar from "./components/Navbar";
import MenuBar from "./components/MenuBar";
import { cookies } from "next/headers";
import MobileMenu from "@/app/(main)/components/MobileMenu";


export default async function Layout({ children }: { children: React.ReactNode }) {
 const session = await validateRequest();


 if (!session.user) {
   redirect("/login");
 }


 const dbUser = await prisma.user.findUnique({
   where: { id: session.user.id },
   select: { hasSubscription: true, emailVerified: true },
 });


 // Invalidate session if subscription/email is invalid
 if (!dbUser?.hasSubscription || !dbUser?.emailVerified) {
   await lucia.invalidateSession(session.session.id);
   const blank = lucia.createBlankSessionCookie();
   const cs = await cookies();
   cs.set(blank.name, blank.value, blank.attributes);
   redirect("/login");
 }


 return (
   <SessionProvider value={session}>
     <div className="flex min-h-screen flex-col">
       <Navbar />
       <div className="mx-auto flex w-full max-w-7xl grow gap-5 p-5">
         <MenuBar className="xl:w-50 sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5" />
         {children}
       </div>
       <div id="mobile-bottom-menu" className="sticky bottom-0 z-40 flex w-full items-center justify-center border-t bg-card p-3 sm:hidden">
         <MobileMenu />
       </div>
     </div>
   </SessionProvider>
 );
}



