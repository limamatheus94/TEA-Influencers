import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";

export const fontHeading = localFont({
  variable: "--font-bethany",
  src: [
    {
      path: "../../public/fonts/Fonts/Bethany Elingston/Bethany Elingston.otf",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
});

export const fontSans = localFont({
  variable: "--font-montserrat",
  src: [
    {
      path: "../../public/fonts/Fonts/Montserrat/Main Fonts/Montserrat-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Fonts/Montserrat/Main Fonts/Montserrat-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Fonts/Montserrat/Main Fonts/Montserrat-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Fonts/Montserrat/Main Fonts/Montserrat-ExtraBold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  display: "swap",
});

export const fontAccent = localFont({
  variable: "--font-bebas",
  src: [
    {
      path: "../../public/fonts/Fonts/Bebas Neue/BebasNeue-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
});

export const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
