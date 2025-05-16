// app/fonts/directFonts.js
// Using .js extension to avoid TypeScript/Babel processing

import localFont from 'next/font/local'
import { Inter } from 'next/font/google'

// Font loaders must use const declarations
const sfPro = localFont({
  src: './SF-Pro-Display-Medium.otf',
  variable: '--font-sf',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export { sfPro, inter } 