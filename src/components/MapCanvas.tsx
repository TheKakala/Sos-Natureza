import { Suspense, lazy } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { LeafletMapProps } from "./LeafletMap";

const LeafletMap = lazy(() => import("./LeafletMap"));

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Carregando mapa...
      </span>
    </div>
  );
}

export function MapCanvas(props: LeafletMapProps) {
  return (
    <ClientOnly fallback={<MapSkeleton />}>
      <Suspense fallback={<MapSkeleton />}>
        <LeafletMap {...props} />
      </Suspense>
    </ClientOnly>
  );
}
