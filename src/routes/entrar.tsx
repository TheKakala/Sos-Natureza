import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — SOS Natureza" },
      { name: "description", content: "Acesse sua conta do SOS Natureza e acompanhe suas denúncias ambientais." },
      { property: "og:title", content: "Entrar — SOS Natureza" },
      { property: "og:description", content: "Acesse sua conta e acompanhe suas denúncias ambientais." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido").max(255),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  async function handleResendConfirmation() {
    const parsed = z.string().email().safeParse(email.trim());
    if (!parsed.success) {
      setError("Digite seu e-mail para reenviarmos a confirmação.");
      return;
    }
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: parsed.data,
      options: { emailRedirectTo: `${window.location.origin}/entrar` },
    });
    if (resendError) toast.error("Não foi possível reenviar agora. Tente em alguns minutos.");
    else toast.success("Reenviamos o e-mail de confirmação!");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Verifique os dados informados.");
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (signInError) {
      const code = (signInError as { code?: string }).code ?? "";
      if (code === "email_not_confirmed" || signInError.message.includes("not confirmed")) {
        setNeedsConfirm(true);
        setError("Seu e-mail ainda não foi confirmado. Abra o link que enviamos para sua caixa de entrada (veja também o spam).");
      } else {
        setError("E-mail ou senha incorretos.");
      }
      return;
    }
    toast.success("Bem-vindo de volta!");
    void navigate({ to: "/app" });
  }

  async function handleReset() {
    const parsed = z.string().email().safeParse(email.trim());
    if (!parsed.success) {
      setError("Digite seu e-mail para receber o link de recuperação.");
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (resetError) toast.error("Não foi possível enviar o e-mail agora.");
    else toast.success("Enviamos um link de recuperação para seu e-mail.");
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
      </Link>

      <h1 className="text-2xl font-bold">Entrar na sua conta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Use o mesmo acesso para cidadãos e para a prefeitura.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 bg-card"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 bg-card"
            required
          />
        </div>

        {error ? (
          <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
            {error}
          </p>
        ) : null}

        {needsConfirm ? (
          <button
            type="button"
            onClick={handleResendConfirmation}
            className="w-full text-sm font-semibold text-leaf-deep underline"
          >
            Reenviar e-mail de confirmação
          </button>
        ) : null}

        <Button type="submit" disabled={loading} className="h-13 w-full rounded-2xl py-3 text-base font-bold">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Entrar
        </Button>
      </form>

      <button type="button" onClick={handleReset} className="mt-4 text-sm font-semibold text-leaf-deep underline">
        Esqueci minha senha
      </button>
      <Link to="/criar-conta" className="mt-2 text-sm font-semibold text-leaf-deep underline">
        Criar uma conta
      </Link>
    </div>
  );
}
