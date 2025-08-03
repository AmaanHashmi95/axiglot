import { Metadata } from "next";
import Link from "next/link";
import LanguageAccordion from "@/app/(main)/components/lessons/LanguageAccordion";
import india from "@/assets/india-flag.png";
import pakistan from "@/assets/pakistan-flag.png";
import BrowserWarning from "@/app/(main)/components/BrowserWarning";

export const metadata: Metadata = {
  title: "Courses",
};

export default function Page() {
  return (
    <main className="flex w-full min-w-0 justify-center">
      <div className="w-full min-w-0 space-y-5 max-w-5xl">
        <BrowserWarning />
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Courses</h1>
        </div>

        <LanguageAccordion title="Punjabi" flagSrc={india} flagAlt="Punjabi Icon">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <Link href="/courses/a1punjabi">
              <div className="rounded-2xl bg-gradient-to-r from-[#00bf63] to-[#ff8a00] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">A1 Punjabi</h1>
              </div>
            </Link>
            {/* Add more Punjabi levels here */}
          </div>
        </LanguageAccordion>

        <LanguageAccordion title="Urdu" flagSrc={pakistan} flagAlt="Urdu Icon">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <Link href="/courses/a1urdu">
              <div className="rounded-2xl bg-gradient-to-r from-[#00605b] to-[#cfcfcf] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">A1 Urdu</h1>
              </div>
            </Link>
          </div>
        </LanguageAccordion>
      </div>
    </main>
  );
}
