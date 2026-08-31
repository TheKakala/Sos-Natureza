import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/criar-conta")({
  head: () => ({
    meta: [
      { title: "Criar sua conta — SOS Natureza" },
      {
        name: "description",
        content: "Crie sua conta gratuita no SOS Natureza para denunciar problemas ambientais na sua cidade.",
      },
      { property: "og:title", content: "Criar sua conta — SOS Natureza" },
      { property: "og:description", content: "Crie sua conta e comece a cuidar da sua cidade." },
    ],
  }),
  component: SignUpPage,
});

const schema = z
  .object({
    fullName: z.string().trim().min(3, "Informe seu nome completo").max(120),
    username: z
      .string()
      .trim()
      .min(3, "O nome de usuário precisa de ao menos 3 caracteres")
      .max(24)
      .regex(/^[a-zA-Z0-9_.]+$/, "Use apenas letras, números, ponto ou _"),
    email: z.string().trim().email("Informe um e-mail válido").max(255),
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não são iguais",
    path: ["confirm"],
  });

function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Verifique os dados informados.");
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { full_name: parsed.data.fullName, username: parsed.data.username },
      },
    });
    if (signUpError) {
      setLoading(false);
      const code = (signUpError as { code?: string }).code ?? "";
      if (code === "weak_password" || signUpError.message.includes("weak")) {
        setError("Essa senha é muito comum. Escolha uma senha mais forte (letras, números e símbolos).");
      } else if (code === "user_already_exists" || signUpError.message.includes("already")) {
        setError("Já existe uma conta com este e-mail.");
      } else if (code === "over_email_send_rate_limit") {
        setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    setLoading(false);
    if (data.session) {
      toast.success("Conta criada com sucesso!");
      void navigate({ to: "/app" });
    } else {
      toast.success("Conta criada! Confirme seu e-mail para entrar.");
      void navigate({ to: "/entrar" });
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
      </Link>

      <h1 className="text-2xl font-bold">Criar sua conta</h1>
      <p className="mt-1 text-sm text-muted-foreground">Toda conta nova começa como cidadão (USER).</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Nome completo</Label>
          <Input id="fullName" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className="h-12 bg-card" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">Nome de usuário</Label>
          <Input id="username" value={form.username} onChange={(e) => set("username", e.target.value)} className="h-12 bg-card" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="h-12 bg-card" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} className="h-12 bg-card" required />
          <p className="text-xs text-muted-foreground">Evite senhas óbvias como 123456. Use ao menos 6 caracteres com letras e números.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <Input id="confirm" type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} className="h-12 bg-card" required />
        </div>
        <p className="rounded-xl bg-surface p-3 text-xs text-muted-foreground">
          Depois de entrar você escolhe um ícone de perfil na tela &quot;Editar perfil&quot;.
        </p>

        {error ? (
          <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={loading} className="w-full rounded-2xl py-6 text-base font-bold">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Criar conta
        </Button>
      </form>

      <Link to="/entrar" className="mt-4 text-center text-sm font-semibold text-leaf-deep underline">
        Já tenho uma conta
      </Link>
    </div>
  );
}
