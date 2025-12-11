import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Step = "input" | "verify" | "success";

export default function Login() {
  const location = useLocation();
  const redirectTo = useMemo(() => {
    const state = location.state as { from?: string } | undefined;
    return state?.from || "/";
  }, [location.state]);

  const [step, setStep] = useState<Step>("input");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step !== "success") return;
    const timer = setTimeout(() => {
      window.location.replace(redirectTo);
    }, 1200);
    return () => clearTimeout(timer);
  }, [step, redirectTo]);

  const handleSendPin = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/send-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send PIN");
      }

      setStep("verify");
      toast.success("PIN sent to your email");
    } catch (err: any) {
      setError(err?.message || "Could not send PIN");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyPin = async () => {
    if (pin.length !== 6) {
      setError("Enter the 6 digit PIN");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid or expired PIN");
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("session", JSON.stringify(data.session));
      setStep("success");
      toast.success("You are logged in");
    } catch (err: any) {
      setError(err?.message || "Could not verify PIN");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToInput = () => {
    setStep("input");
    setPin("");
    setError(null);
  };

  if (step === "success") {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-4rem)] bg-secondary/20 flex items-center justify-center">
          <div className="container max-w-md py-16">
            <div className="bg-white border border-border rounded-lg p-8 text-center">
              <div className="mb-6 flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Login successful</h1>
              <p className="text-muted-foreground mb-6">
                You are now logged in. Redirecting...
              </p>
              <div className="w-full h-1 bg-gradient-to-r from-green-600 to-transparent rounded-full overflow-hidden">
                <div className="h-full bg-green-600 animate-pulse" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="hidden md:flex bg-gradient-to-b from-green-600 to-emerald-700 flex-col justify-center items-center text-white p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Welcome back</h2>
                <p className="text-green-100 mb-6">Sign in with your email to continue shopping.</p>
                <div className="bg-green-500/20 rounded-lg p-6 backdrop-blur-sm">
                  <svg className="w-24 h-24 mx-auto text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center p-8 md:p-10">
              {step === "input" ? (
                <>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h1>
                    <p className="text-gray-600">Enter your email to continue.</p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendPin()}
                      disabled={isProcessing}
                      className="bg-gray-50 border-2 border-gray-200 focus:border-green-600 focus:bg-white h-12 text-base"
                    />
                  </div>

                  {error && (
                    <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-600 rounded">
                      <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleSendPin}
                    disabled={!email || isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-lg mb-4"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending PIN...
                      </>
                    ) : (
                      "Send PIN"
                    )}
                  </Button>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 mb-4">
                    Demo mode: we email a 6 digit PIN. No SMS required.
                  </div>

                  <p className="text-xs text-gray-600 text-center">
                    By continuing, you agree to our
                    <a href="#" className="text-green-600 hover:underline font-semibold ml-1">
                      Terms of Use
                    </a>
                    <span className="mx-1">and</span>
                    <a href="#" className="text-green-600 hover:underline font-semibold">
                      Privacy Policy
                    </a>
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Verify PIN</h1>
                    <p className="text-gray-600 text-sm mb-2">We sent a 6 digit PIN to:</p>
                    <p className="text-sm font-semibold text-green-600 break-all mb-4">{email}</p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={handleBackToInput}
                      className="h-auto p-0 text-green-600"
                      disabled={isProcessing}
                    >
                      Use a different email?
                    </Button>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter PIN</label>
                    <Input
                      type="text"
                      placeholder="000000"
                      value={pin}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setPin(cleaned);
                        setError(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleVerifyPin()}
                      disabled={isProcessing}
                      className="bg-gray-50 border-2 border-gray-200 focus:border-green-600 focus:bg-white text-center text-2xl font-mono tracking-widest h-12"
                      maxLength={6}
                      inputMode="numeric"
                    />
                  </div>

                  {error && (
                    <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-600 rounded">
                      <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleVerifyPin}
                    disabled={pin.length < 6 || isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-lg mb-3"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify PIN"
                    )}
                  </Button>

                  <Button
                    onClick={handleBackToInput}
                    variant="outline"
                    className="w-full h-12 rounded-lg border-2 border-gray-200 hover:border-gray-300"
                    disabled={isProcessing}
                  >
                    Back
                  </Button>

                  <p className="text-xs text-gray-600 text-center mt-6">
                    Did not receive it? Check spam or request again after a short pause.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
