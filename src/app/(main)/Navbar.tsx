import Link from "next/link";
import UserButton from "@/components/UserButton";
import Image from "next/image";
import logo from "@/assets/logo.png";

export default function Navbar() {
    return (
      <header className="sticky top-0 z-10 bg-card shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-5 px-5 py-3">
        <Link href="/">
        <Image src={logo} alt="" width={150} height={50}/>
        </Link>
        <UserButton className="sm:ms-auto" />
        </div>
      </header>
    );
  }