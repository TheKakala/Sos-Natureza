import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { supabase } from "@/integrations/client";
import { cn } from "@/lib/utils";

export function StorageImage({
  path,
  alt,
  className,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    if (!path) {
      setUrl(null);
      return;
    }
    void supabase.storage
      .from("denuncias")
      .createSignedUrl(path, 3600)
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data) setFailed(true);
        else setUrl(data.signedUrl);
      });
    return () => {
      active = false;
    };
  }, [path]);

  if (!path || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-surface text-muted-foreground",
          className,
        )}
        role="img"
        aria-label={`${alt} — imagem indisponível`}
      >
        <ImageOff className="h-6 w-6" aria-hidden="true" />
      </div>
    );
  }

  if (!url) {
    return <div className={cn("animate-pulse bg-surface", className)} aria-hidden="true" />;
  }

  return <img src={url} alt={alt} loading="lazy" className={cn("object-cover", className)} />;
}
