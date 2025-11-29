import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cookies } from "next/headers";
import { Providers } from "@/providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Skullines",
  description: "Pixel line Skull",
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: "https://skullines.xyz/skullines.gif",
      button: {
        title: "Mint Skull",
        action: {
          type: "launch_frame",
          name: "Skullines",
          url: "https://skullines.xyz",
          splashImageUrl: "https://skullines.xyz/splash.png",
          splashBackgroundColor: "#101010",
        },
      },
    }),
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const requestId = cookieStore.get("x-request-id")?.value;

  return (
    <html lang="en">
      <head>
        {requestId && <meta name="x-request-id" content={requestId} />}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
