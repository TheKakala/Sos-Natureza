import { ItemArt, toMotif } from "@/components/ItemArt";
import { StorageImage } from "@/components/StorageImage";
import { cn } from "@/lib/utils";

export const PRESET_PREFIX = "preset:";

export type PresetAvatar = { id: string; name: string; icon: string; price: number };

/** Ícones gratuitos disponíveis para qualquer pessoa. */
export const FREE_AVATARS: PresetAvatar[] = [
  { id: "sprout", name: "Semente", icon: "sprout", price: 0 },
  { id: "leaf", name: "Folhinha", icon: "leaf", price: 0 },
  { id: "droplets", name: "Gotinha", icon: "droplets", price: 0 },
  { id: "trees", name: "Matinha", icon: "trees", price: 0 },
];

export function avatarValueFor(icon: string) {
  return `${PRESET_PREFIX}${icon}`;
}

export function UserAvatar({
  value,
  className,
  alt = "Sua foto de perfil",
  price = 0,
}: {
  value: string | null | undefined;
  className?: string;
  alt?: string;
  price?: number;
}) {
  if (value?.startsWith(PRESET_PREFIX)) {
    return <ItemArt motif={toMotif(value.slice(PRESET_PREFIX.length))} price={price} className={cn("rounded-full", className)} label={alt} />;
  }

  if (value) {
    return <StorageImage path={value} alt={alt} className={cn("rounded-full", className)} />;
  }

  return <ItemArt motif="sprout" className={cn("rounded-full", className)} label={alt} />;
}
