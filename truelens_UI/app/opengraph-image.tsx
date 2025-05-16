/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TrueLens - Verified News for Better Trading";
export const contentType = "image/png";

export default async function OG() {
  const sfPro = await fetch(
    new URL("./fonts/SF-Pro-Display-Medium.otf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          backgroundImage:
            "linear-gradient(to bottom right, #f3f4f6 25%, #ffffff 50%, #e5e7eb 75%)",
        }}
      >
        <img
          src={`https://${process.env.VERCEL_URL || "truelens.vercel.app"}/TrueLens_Logo.svg`}
          alt="TrueLens Logo"
          tw="w-64 h-16 mb-6 opacity-95"
        />
        <h1
          style={{
            fontSize: "70px",
            fontFamily: "SF Pro",
            background:
              "linear-gradient(to bottom right, #000000 21.66%, #374151 86.47%)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: "5rem",
            letterSpacing: "-0.02em",
          }}
        >
          Verified News for Better Trading
        </h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "SF Pro",
          data: sfPro,
        },
      ],
    },
  );
}
