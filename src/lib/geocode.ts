export type GeoResult = {
  label: string;
  lat: number;
  lon: number;
};

/** Geocodificação por endereço / ponto de referência (OpenStreetMap Nominatim). */
export async function geocode(query: string): Promise<GeoResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "0");
  url.searchParams.set("countrycodes", "br");
  url.searchParams.set("accept-language", "pt-BR");

  const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Não foi possível pesquisar o endereço agora.");
  const data = (await response.json()) as { display_name: string; lat: string; lon: string }[];
  return data.map((item) => ({
    label: item.display_name,
    lat: Number(item.lat),
    lon: Number(item.lon),
  }));
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("accept-language", "pt-BR");
  const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!response.ok) return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  const data = (await response.json()) as { display_name?: string };
  return data.display_name ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}
