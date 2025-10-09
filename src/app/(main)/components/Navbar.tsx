import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/Beta Logo.png";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center sm:justify-start gap-5 px-5 py-3">
        <Link href="/" className="sm:ml-[calc(theme(spacing.3)+theme(spacing.1))]">
          <Image src={logo} alt="Logo" width={150} height={50} />
        </Link>
      </div>
    </header>
  );
}
