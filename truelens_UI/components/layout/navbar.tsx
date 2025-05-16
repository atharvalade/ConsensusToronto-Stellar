"use client";

import Link from "next/link";
import Image from "next/image";
import useScroll from "@/lib/hooks/use-scroll";
import ConnectWalletButton from "./ConnectWalletButton";

export default function NavBar() {
  const scrolled = useScroll(50);

  return (
    <>
      <div
        className={`fixed top-0 flex w-full justify-center ${
          scrolled
            ? "border-b border-gray-200 bg-white/40 backdrop-blur-md"
            : "bg-transparent"
        } z-30 transition-all duration-300`}
      >
        <div className="mx-5 flex h-16 w-full max-w-screen-xl items-center justify-between">
          <Link href="/" className="flex items-center relative pt-2">
            <Image
              src="/NewTrueLens.svg"
              alt="TrueLens logo"
              width={240}
              height={50}
              className="w-[240px] h-[50px] mix-blend-multiply"
              priority
            />
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/about"
              className="hidden sm:flex items-center text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              About
            </Link>
            <Link 
              href="/feed"
              className="hidden sm:flex items-center text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Your Feed
            </Link>

            <ConnectWalletButton />
          </div>
        </div>
      </div>
      
      {/* Additional transparent gradient to help transition */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/90 to-transparent pointer-events-none z-20" />
    </>
  );
}
