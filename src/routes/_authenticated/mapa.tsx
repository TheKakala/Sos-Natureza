import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, MapPinned, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { MapCanvas } from "@/components/MapCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/client";
import { useAuth } from "@/hooks/useAuth";
import { categoryLabel, STATUS, type ReportStatus } from "@/lib/sos";
import { geocode } from "@/lib/geocode";

export const Route = createFileRoute("/_authenticated/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa das denúncias — SOS Natureza" },
      { name: "description", content: "Mapa interativo com as denúncias ambientais registradas." },
      { property: "og:title", content: "Mapa das denúncias — SOS Natureza" },
      { property: "og:description", content: "Navegue pelo mapa e veja os problemas ambientais registrados." },
    ],
  }),
  component: MapPage,
});

const DEFAULT_CENTER: [number, number] = [-14.235, -51.9253];

function MapPage() {
  const { user } = useAuth();
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(4);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const { data: reports = [], isLoading, isError } = useQuery({
    queryKey: ["map-reports", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, protocol, category, status, latitude, longitude, location_text")
        .not("latitude", "is", null);
      if (error) throw error;
      return data ?? [];
    },
  });

  const markers = useMemo(
    () =>
      reports
        .filter((report) => report.latitude !== null && report.longitude !== null)
        .map((report) => ({
          id: report.id,
          lat: report.latitude!,
          lon: report.longitude!,
          title: `${categoryLabel(report.category)} — ${report.protocol}`,
          subtitle: `${STATUS[report.status as ReportStatus].label} · ${report.location_text}`,
        })),
    [reports],
  );

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim().length < 3) return;
    setSearching(true);
    try {
      const results = await geocode(query);
      if (results.length === 0) {
        toast.error("Não encontramos esse lugar. Tente outro endereço ou ponto de referência.");
        return;
      }
      setCenter([results[0]!.lat, results[0]!.lon]);
      setZoom(15);
    } catch {
      toast.error("Não foi possível pesquisar agora. Tente novamente.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <AppShell fullBleed>
      <div className="relative h-[calc(100vh-5.5rem)] w-full">
        <MapCanvas center={center} zoom={zoom} markers={markers} />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] space-y-2 p-3">
          <div className="pointer-events-auto flex items-center gap-2">
            <Link
              to="/app"
              aria-label="Voltar para o início"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-card shadow-card"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 rounded-full bg-card p-1 shadow-card">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar bairro, rua ou cidade..."
                aria-label="Pesquisar lugares no mapa"
                className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button type="submit" size="icon" disabled={searching} className="h-10 w-10 shrink-0 rounded-full">
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Pesquisar</span>
              </Button>
            </form>
          </div>

          {!isLoading && !isError && markers.length === 0 ? (
            <p className="pointer-events-auto rounded-xl bg-card px-3 py-2 text-center text-sm font-semibold shadow-card">
              Ainda não existem denúncias registradas nesta região.
            </p>
          ) : null}
          {isError ? (
            <p role="alert" className="pointer-events-auto rounded-xl bg-card px-3 py-2 text-center text-sm font-semibold shadow-card">
              Não foi possível carregar os dados. Tente novamente.
            </p>
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[500] flex justify-center">
          <span className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-card px-3 py-2 text-xs font-semibold shadow-card">
            <MapPinned className="h-4 w-4 text-leaf-deep" aria-hidden="true" />
            {markers.length} denúncia(s) com localização
          </span>
        </div>
      </div>
    </AppShell>
  );
}
