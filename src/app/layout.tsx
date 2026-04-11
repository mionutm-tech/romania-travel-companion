import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Romania Travel Companion",
    template: "%s | Romania Travel Companion",
  },
  description:
    "Discover Romania's most captivating destinations. Curated POIs, editorial itineraries, and a smart trip planner for your Romanian adventure.",
  keywords: [
    "Romania",
    "travel",
    "Bucharest",
    "Transylvania",
    "Brasov",
    "Sibiu",
    "Cluj-Napoca",
    "itinerary",
  ],
};

async function getInitialUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return null;

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();
    if (data) return data as User;

    return {
      id: authUser.id,
      email: authUser.email ?? "",
      name: (authUser.user_metadata?.name as string | undefined) ?? null,
      avatar_url:
        (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
      role: "user",
      created_at: authUser.created_at ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getInitialUser();
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider initialUser={initialUser}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
