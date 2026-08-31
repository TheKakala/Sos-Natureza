import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/redefinir-senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Redefinir senha — SOS Natureza" },
      { name: "description", content: "Crie uma nova senha para voltar a acessar sua conta no SOS Natureza." },
      { property: "og:title", content: "Redefinir senha — SOS Natureza" },
      { property: "og:description", content: "Crie uma nova senha e volte a cuidar da sua cidade." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function prepare() {
      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash");

      try {
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        } else if (tokenHash) {
          await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
        } else if (hashParams.get("access_token") && hashParams.get("refresh_token")) {
          await supabase.auth.setSession({
            access_token: hashParams.get("access_token")!,
            refresh_token: hashParams.get("refresh_token")!,
          });
        }
      } catch {
        // handled by the session check below
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setValid(Boolean(data.session));
      setReady(true);
      window.history.replaceState({}, "", "/redefinir-senha");
    }

    void prepare();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72).safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Senha inválida.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não são iguais.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      const code = (updateError as { code?: string }).code ?? "";
      if (code === "weak_password" || updateError.message.includes("weak")) {
        setError("Essa senha é muito comum. Escolha uma senha mais forte.");
      } else if (code === "same_password") {
        setError("A nova senha precisa ser diferente da anterior.");
      } else {
        setError(updateError.message);
      }
      return;
    }
    toast.success("Senha alterada com sucesso!");
    void navigate({ to: "/app" });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8">
      <Link to="/entrar" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar para o login
      </Link>

      <h1 className="text-2xl font-bold">Criar nova senha</h1>

      {!ready ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Validando seu link...
        </p>
      ) : !valid ? (
        <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
          Este link de recuperação expirou ou já foi usado. Volte ao login e peça um novo em “Esqueci minha senha”.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 bg-card"
              required
            />
            <p className="text-xs text-muted-foreground">Ao menos 6 caracteres, com letras e números.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirmar nova senha</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="h-12 bg-card"
              required
            />
          </div>

          {error ? (
            <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={loading} className="w-full rounded-2xl py-6 text-base font-bold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Salvar nova senha
          </Button>
        </form>
      )}
    </div>
  );
}
