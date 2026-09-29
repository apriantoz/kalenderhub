"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setErrorMessage(error.message);
    } else {
      router.replace("/");
      router.refresh();
    }
  };

  return (
    // Diubah menjadi justify-center agar card berada pas di tengah layar (vertikal & horizontal)
    <main className="relative min-h-screen w-full flex flex-col justify-center items-center px-4 overflow-hidden">
      {/* 1. Dot Matrix / Noise Background (Support Light & Dark Mode) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.12)_1px,transparent_0)] dark:[background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)]"
        style={{
          backgroundSize: "24px 24px",
        }}
      />

      {/* 2. Soft Ambient Glow (Posisinya pas di tengah layar) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* 3. Section Card dengan z-10 agar aman di atas background */}
      <section className="relative z-10 w-full max-w-md">
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold">Login Admin</CardTitle>
            <CardDescription>Masuk untuk mengelola jadwal kelas</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive" className="py-2.5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}