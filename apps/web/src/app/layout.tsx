import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/atoms/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "SaaS RH | Psicometria e IA",
  description: "Plataforma avançada de gestão de talentos com análise psicométrica e IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased selection:bg-primary/20",
          inter.variable,
          outfit.variable
        )}
      >
        <Toaster position="top-right" richColors />
        <div className="relative flex min-h-screen flex-col">
          {/* Background Decorative Elements */}
          <div className="fixed inset-0 -z-10 h-full w-full bg-background">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
          </div>
          
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
