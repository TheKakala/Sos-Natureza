import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogIn, Sprout, Volume2, VolumeX } from "lucide-react";
import heroImage from "@/assets/hero-natureza.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useSound } from "@/hooks/useSound";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SOS Natureza — Denuncie problemas ambientais da sua cidade" },
      {
        name: "description",
        content:
          "Registre denúncias ambientais com foto e local, acompanhe o atendimento da prefeitura e ganhe pontos, conquistas e ranks.",
      },
      { property: "og:title", content: "SOS Natureza — Sua atitude transforma o lugar onde você vive" },
      {
        property: "og:description",
        content: "Plataforma ambiental que conecta cidadãos e prefeitura para resolver problemas ambientais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WelcomeMenu,
});

function WelcomeMenu() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { prefs, update } = useSound();

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/app" });
  }, [loading, user, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-background px-6 py-10">
      <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 text-center">
        <img
          src={heroImage}
          alt="Ilustração de uma muda verde crescendo do solo com o planeta ao fundo"
          width={1024}
          height={1024}
          className="w-56 rounded-full border-4 border-primary/40 shadow-card sm:w-64"
        />
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold uppercase tracking-tight text-leaf-deep">
            SOS Natureza
          </h1>
          <p className="text-base text-muted-foreground">
            Sua atitude ajuda a transformar o lugar onde você vive.
          </p>
        </div>

        <div className="mt-2 flex w-full flex-col gap-3">
          <Button asChild size="lg" className="h-14 rounded-2xl text-base font-bold shadow-glow">
            <Link to="/criar-conta">
              <Sprout className="h-5 w-5" aria-hidden="true" />
              Criar uma conta
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-14 rounded-2xl border-2 border-leaf-deep/30 bg-card text-base font-bold"
          >
            <Link to="/entrar">
              <LogIn className="h-5 w-5" aria-hidden="true" />
              Entrar
            </Link>
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => update({ ambient: !prefs.ambient })}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-foreground"
        aria-pressed={prefs.ambient}
      >
        {prefs.ambient ? (
          <Volume2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <VolumeX className="h-4 w-4" aria-hidden="true" />
        )}
        {prefs.ambient ? "Som ambiente ligado" : "Som ambiente desligado"}
      </button>
    </div>
  );
}
