import localFont from "next/font/local";
import { Inter } from "next/font/google";

// Font loaders must use const declarations as required by Next.js
/* istanbul ignore next */
const sfPro = localFont({
  src: "./SF-Pro-Display-Medium.otf",
  variable: "--font-sf",
});

/* istanbul ignore next */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export { sfPro, inter };
