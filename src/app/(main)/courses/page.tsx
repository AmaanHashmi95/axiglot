import { Metadata } from "next";
import Link from "next/link";
import LanguageAccordion from "@/app/(main)/components/lessons/LanguageAccordion";
import india from "@/assets/india-flag.png";
import pakistan from "@/assets/pakistan-flag.png";
import iran from "@/assets/iran-flag.webp";
import russian from "@/assets/russia-flag.png";
import portuguese from "@/assets/brazil-flag.png";
import swahili from "@/assets/kenya-flag.png";
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

        <LanguageAccordion title="Farsi" flagSrc={iran} flagAlt="Farsi Icon">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <Link href="/courses/a1farsi">
              <div className="rounded-2xl bg-gradient-to-r from-[#00bf63] to-[#ef2626] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">A1 Farsi</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">A2 - Feb 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">B1 - March 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">B2 - April 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">C1 - May 2026</h1>
              </div>
            </Link>
          </div>
        </LanguageAccordion>

        <LanguageAccordion title="Portuguese" flagSrc={portuguese} flagAlt="Portuguese Icon">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <Link href="/courses/a1portuguese">
              <div className="rounded-2xl bg-gradient-to-r from-[#009440] to-[#ffcb00] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">A1 Portuguese</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">A2 - Feb 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">B1 - March 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">B2 - April 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">C1 - May 2026</h1>
              </div>
            </Link>
          </div>
        </LanguageAccordion>

        <LanguageAccordion title="Punjabi" flagSrc={india} flagAlt="Punjabi Icon">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <Link href="/courses/a1punjabi">
              <div className="rounded-2xl bg-gradient-to-r from-[#00bf63] to-[#ff8a00] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">A1 Punjabi</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">A2 - Feb 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">B1 - March 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">B2 - April 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">C1 - May 2026</h1>
              </div>
            </Link>
          </div>
        </LanguageAccordion>

        <LanguageAccordion title="Russian" flagSrc={russian} flagAlt="Russian Icon">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <Link href="/courses/a1russian">
              <div className="rounded-2xl bg-gradient-to-r from-[#ef2626] to-[#4a86e8] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">A1 Russian</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">A2 - Feb 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">B1 - March 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">B2 - April 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">C1 - May 2026</h1>
              </div>
            </Link>
          </div>
        </LanguageAccordion>

        <LanguageAccordion title="Swahili" flagSrc={swahili} flagAlt="Swahili Icon">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <Link href="/courses/a1swahili">
              <div className="rounded-2xl bg-gradient-to-r from-black via-red-500 to-[#008C51] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">A1 Swahili</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">A2 - Feb 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">B1 - March 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">B2 - April 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">C1 - May 2026</h1>
              </div>
            </Link>
          </div>
        </LanguageAccordion>

        <LanguageAccordion title="Urdu" flagSrc={pakistan} flagAlt="Urdu Icon">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <Link href="/courses/a1urdu">
              <div className="rounded-2xl bg-gradient-to-r from-[#00605b] to-[#cfcfcf] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">A1 Urdu</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">A2 - Feb 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">B1 - March 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">B2 - April 2026</h1>
              </div>
            </Link>
            <Link href="">
              <div className="rounded-2xl bg-gradient-to-r from-[#cccccc] to-[#999999] p-5 shadow-sm w-full">
                <h1 className="text-left text-xl font-bold">C1 - May 2026</h1>
              </div>
            </Link>
          </div>
        </LanguageAccordion>
      </div>
    </main>
  );
}
