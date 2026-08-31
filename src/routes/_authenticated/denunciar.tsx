import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Crosshair,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { MapCanvas } from "@/components/MapCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/client";
import { useAuth } from "@/hooks/useAuth";
import { useSound } from "@/hooks/useSound";
import { CATEGORIES, categoryLabel, type CategoryId } from "@/lib/sos";
import { geocode, reverseGeocode, type GeoResult } from "@/lib/geocode";

export const Route = createFileRoute("/_authenticated/denunciar")({
  head: () => ({
    meta: [
      { title: "Fazer denúncia — SOS Natureza" },
      { name: "description", content: "Registre um problema ambiental com tipo, local, foto e descrição." },
      { property: "og:title", content: "Fazer denúncia — SOS Natureza" },
      { property: "og:description", content: "Registre um problema ambiental em poucos passos." },
    ],
  }),
  component: NewReportPage,
});

type Step = 1 | 2 | 3 | 4 | 5;

const descriptionSchema = z.string().trim().min(10, "Descreva com pelo menos 10 caracteres").max(1000);

function NewReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { play } = useSound();

  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<GeoResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function search(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (query.trim().length < 3) {
      setError("Digite ao menos 3 caracteres.");
      return;
    }
    setSearching(true);
    try {
      const found = await geocode(query);
      setResults(found);
      if (found.length === 0) setError("Não encontramos esse lugar. Tente outro ponto de referência.");
    } catch {
      setError("Não foi possível pesquisar agora. Tente novamente.");
    } finally {
      setSearching(false);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Seu aparelho não oferece localização.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const label = await reverseGeocode(latitude, longitude);
        setPicked({ label, lat: latitude, lon: longitude });
        setConfirmed(false);
      },
      () => toast.error("Não conseguimos acessar sua localização. Pesquise o endereço."),
    );
  }

  function choosePhoto(file: File | null) {
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function submit() {
    setError(null);
    const parsed = descriptionSchema.safeParse(description);
    if (!category || !parsed.success || !user) {
      setError(parsed.success ? "Escolha uma categoria." : parsed.error.issues[0]!.message);
      return;
    }
    setSubmitting(true);
    try {
      let imagePath: string | null = null;
      if (photo) {
        const mimeExtension = (photo.type.split("/")[1] ?? "jpg").replace("jpeg", "jpg");
        const path = `${user.id}/${crypto.randomUUID()}.${mimeExtension}`;
        const { error: uploadError } = await supabase.storage
          .from("denuncias")
          .upload(path, photo, { contentType: photo.type || "image/jpeg", upsert: false });
        if (uploadError) {
          setSubmitting(false);
          setError(`Não conseguimos enviar a foto: ${uploadError.message}`);
          return;
        }
        imagePath = path;
      }
      const { data, error: insertError } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          protocol: "",
          category,
          description: parsed.data,
          image_url: imagePath,
          location_text: picked?.label ?? query.trim(),
          latitude: picked?.lat ?? null,
          longitude: picked?.lon ?? null,
        })
        .select("protocol")
        .single();
      if (insertError) throw insertError;
      setProtocol(data.protocol);
      play("enviado");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "";
      setError(message ? `Não foi possível enviar sua denúncia: ${message}` : "Não foi possível enviar sua denúncia. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (protocol) {
    return (
      <AppShell title="Denúncia enviada">
        <div className="surface-card flex flex-col items-center gap-3 p-6 text-center">
          <CheckCircle2 className="h-14 w-14 text-success" aria-hidden="true" />
          <h2 className="text-xl font-bold">Denúncia registrada com sucesso!</h2>
          <p className="text-sm text-muted-foreground">Guarde seu número de protocolo:</p>
          <p className="rounded-xl bg-primary/20 px-4 py-2 text-lg font-extrabold text-leaf-deep">{protocol}</p>
          <p className="text-sm text-muted-foreground">Você ganhou +50 pontos e +50 XP.</p>
          <div className="mt-2 flex w-full flex-col gap-2">
            <Button asChild className="rounded-2xl py-6 font-bold">
              <Link to="/minhas-denuncias">Acompanhar denúncia</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl bg-card py-6 font-bold">
              <Link to="/app">Voltar para o início</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Nova denúncia" subtitle={`Etapa ${step} de 5`}>
      <Progress value={(step / 5) * 100} className="mb-4 h-2" />

      {step === 1 ? (
        <section aria-labelledby="step1">
          <h2 id="step1" className="mb-3 text-lg font-bold">
            O que aconteceu?
          </h2>
          <ul className="space-y-2">
            {CATEGORIES.map((item) => {
              const Icon = item.icon;
              const active = category === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setCategory(item.id)}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left ${
                      active ? "border-primary bg-primary/15" : "border-border bg-card"
                    }`}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-leaf-deep">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-bold">{item.label}</span>
                      <span className="block text-xs text-muted-foreground">{item.hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Button
            className="mt-4 w-full rounded-2xl py-6 font-bold"
            disabled={!category}
            onClick={() => setStep(2)}
          >
            Continuar
          </Button>
        </section>
      ) : null}

      {step === 2 ? (
        <section aria-labelledby="step2">
          <h2 id="step2" className="mb-1 text-lg font-bold">
            Onde está o problema?
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Você não precisa compartilhar sua localização. Digite o endereço ou um ponto de referência.
          </p>

          <form onSubmit={search} className="flex gap-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Digite o endereço ou ponto de referência..."
              aria-label="Endereço ou ponto de referência"
              className="h-12 bg-card"
              maxLength={200}
            />
            <Button type="submit" disabled={searching} className="h-12 w-12 shrink-0 rounded-xl p-0">
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="sr-only">Pesquisar endereço</span>
            </Button>
          </form>

          <Button
            type="button"
            variant="outline"
            onClick={useCurrentLocation}
            className="mt-2 w-full rounded-2xl bg-card py-5 font-semibold"
          >
            <Crosshair className="h-4 w-4" aria-hidden="true" /> Usar minha localização atual (opcional)
          </Button>

          {results.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {results.map((result) => (
                <li key={`${result.lat}-${result.lon}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setPicked(result);
                      setConfirmed(false);
                    }}
                    className={`flex w-full items-start gap-2 rounded-xl border p-3 text-left text-sm ${
                      picked?.label === result.label ? "border-primary bg-primary/10" : "border-border bg-card"
                    }`}
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-leaf-deep" aria-hidden="true" />
                    {result.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {picked ? (
            <div className="mt-4 space-y-2">
              <div className="h-56 overflow-hidden rounded-2xl border border-border">
                <MapCanvas
                  center={[picked.lat, picked.lon]}
                  zoom={16}
                  markers={[{ id: "pick", lat: picked.lat, lon: picked.lon, title: "Local da denúncia" }]}
                  onPick={(lat, lon) => {
                    setPicked({ label: picked.label, lat, lon });
                    setConfirmed(false);
                  }}
                />
              </div>
              <p className="text-sm font-semibold">Essa localização está correta?</p>
              <p className="text-xs text-muted-foreground">{picked.label}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setConfirmed(true);
                    setStep(3);
                  }}
                  className="flex-1 rounded-2xl py-5 font-bold"
                >
                  Confirmar localização
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPicked(null);
                    setConfirmed(false);
                  }}
                  className="flex-1 rounded-2xl bg-card py-5 font-bold"
                >
                  Alterar localização
                </Button>
              </div>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
              {error}
            </p>
          ) : null}

          <div className="mt-4 flex gap-2">
            <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={query.trim().length < 3 && !picked}
              className="flex-1 rounded-2xl py-5 font-bold"
            >
              Continuar
            </Button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section aria-labelledby="step3">
          <h2 id="step3" className="mb-1 text-lg font-bold">
            Adicione uma foto
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">Tire uma foto ou escolha da galeria (opcional).</p>

          <Label
            htmlFor="photo"
            className="flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card text-sm font-semibold text-muted-foreground"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Pré-visualização da foto escolhida" className="h-full w-full rounded-2xl object-cover" />
            ) : (
              <>
                <Camera className="h-8 w-8 text-leaf-deep" aria-hidden="true" />
                Toque para adicionar uma foto
              </>
            )}
          </Label>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(event) => choosePhoto(event.target.files?.[0] ?? null)}
          />

          <div className="mt-4 flex gap-2">
            <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
            </Button>
            <Button onClick={() => setStep(4)} className="flex-1 rounded-2xl py-5 font-bold">
              Continuar
            </Button>
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <section aria-labelledby="step4">
          <h2 id="step4" className="mb-3 text-lg font-bold">
            Conte o que aconteceu
          </h2>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Conte o que aconteceu..."
            aria-label="Descrição do problema"
            maxLength={1000}
            className="min-h-40 bg-card"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">{description.length}/1000</p>
          {error ? (
            <p role="alert" className="mt-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex gap-2">
            <Button variant="ghost" onClick={() => setStep(3)} className="flex-1">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
            </Button>
            <Button
              onClick={() => {
                const parsed = descriptionSchema.safeParse(description);
                if (!parsed.success) {
                  setError(parsed.error.issues[0]!.message);
                  return;
                }
                setError(null);
                setStep(5);
              }}
              className="flex-1 rounded-2xl py-5 font-bold"
            >
              Revisar
            </Button>
          </div>
        </section>
      ) : null}

      {step === 5 ? (
        <section aria-labelledby="step5" className="space-y-3">
          <h2 id="step5" className="text-lg font-bold">
            Revise sua denúncia
          </h2>
          <dl className="surface-card space-y-3 p-4 text-sm">
            <div>
              <dt className="font-semibold text-muted-foreground">Categoria</dt>
              <dd className="font-bold">{category ? categoryLabel(category) : "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-muted-foreground">Local</dt>
              <dd>{picked?.label ?? (query || "Não informado")}</dd>
              <dd className="text-xs text-muted-foreground">
                {picked ? (confirmed ? "Localização confirmada no mapa" : "Localização selecionada") : "Sem coordenadas"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-muted-foreground">Descrição</dt>
              <dd>{description}</dd>
            </div>
            <div>
              <dt className="font-semibold text-muted-foreground">Foto</dt>
              <dd>
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto da denúncia" className="mt-1 h-40 w-full rounded-xl object-cover" />
                ) : (
                  "Nenhuma foto adicionada"
                )}
              </dd>
            </div>
          </dl>

          {error ? (
            <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
              {error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep(4)} className="flex-1">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
            </Button>
            <Button onClick={submit} disabled={submitting} className="flex-1 rounded-2xl py-5 font-bold">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Enviar denúncia
            </Button>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
