import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import { GenLayerInit } from "@/components/GenLayerInit";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-switzer", // Mapping to the existing variable name to keep CSS working
    display: "swap",
});

export const metadata: Metadata = {
    title: "WebCred",
    description: "Verify URLs for Smart Contracts",
    icons: {
        icon: "/favicon.ico",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} font-sans antialiased`}>
                <GenLayerInit>
                    <div className="min-h-screen bg-background text-foreground">
                        <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
                            <div className="w-full">
                                <div className="flex items-center justify-between py-4 pl-6 pr-4">
                                    <div className="flex items-center space-x-8">
                                        <Link href="/" className="flex items-center space-x-2">
                                            <img src="/favicon.ico" alt="WebCred" className="w-5 h-5" />
                                            <h1 className="text-xl font-bold tracking-tight">WebCred</h1>
                                        </Link>
                                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                                            Powered by{" "}
                                            <a
                                                href="https://docs.genlayer.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline font-medium flex items-center gap-1"
                                            >
                                                <img src="/genlayer.svg" alt="GenLayer" className="w-3 h-3 invert" />
                                                GenLayer
                                            </a>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Main Content */}
                        <main className="pt-20">
                            <div className="container mx-auto p-4 md:p-8">
                                <div className="max-w-6xl mx-auto">
                                    {children}
                                </div>
                            </div>
                        </main>
                    </div>
                </GenLayerInit>
            </body>
        </html>
    );
}
