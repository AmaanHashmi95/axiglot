import signupImage from "@/assets/Hexagon Logo Clear.png";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
    title: "Sign Up",
  };

export default function Page() {
    return (
    <main className="flex h-screen items-center justify-center p-5">
        <div className="flex h-300 max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl">
            <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
            <div className="space-y-1 text-center">
            <h1 className="text-center text-3xl font-bold">
            Sign up to{' '}
            <span className="inline-block">
              Ax<span className="relative inline-block">
                i
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 text-[#00E2FF]">
                  •
                </span>
              </span>
              <span className="bg-gradient-to-r from-[#ff8a00] to-[#ef2626] bg-clip-text text-transparent">
                Glot
              </span>
            </span>
          </h1>
            <p className="text-muted-foreground">
              And access <span className="italic">all</span> of our languages.
            </p>
            </div>
            <div className="space-y-5">
            <SignUpForm />
            <Link href="/login" className="block text-center hover:underline">
              Already have an account? Log in
            </Link>
          </div>
            </div>
            <Image
          src={signupImage}
          alt=""
          className="hidden w-1/2 object-cover md:block"
        />
        </div>
    </main>
    );
}