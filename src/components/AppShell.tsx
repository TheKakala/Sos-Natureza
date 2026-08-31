import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Camera, Home, MapPinned, Trophy, User } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/useAuth";

const NAV = [
  { to: "/app", label: "Início", icon: Home, highlight: false },
  { to: "/mapa", label: "Mapa", icon: MapPinned, highlight: false },
  { to: "/denunciar", label: "Denunciar", icon: Camera, highlight: true },
  { to: "/conquistas", label: "Conquistas", icon: Trophy, highlight: false },
  { to: "/perfil", label: "Perfil", icon: User, highlight: false },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
  action,
  fullBleed = false,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  fullBleed?: boolean;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { data: unread = 0 } = useUnreadCount();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      {title ? (
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold">{title}</h1>
              {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
            </div>
            <div className="flex items-center gap-2">
              {action}
              <Link
                to="/notificacoes"
                aria-label={`Notificações${unread > 0 ? `, ${unread} não lidas` : ""}`}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unread > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
        </header>
      ) : null}

      <main className={cn("flex-1 pb-32", fullBleed ? "" : "px-4 py-4")}>{children}</main>

      <nav
        aria-label="Navegação principal"
        className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <ul className="flex items-stretch justify-between">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <li key={item.to} className="flex-1">
                <Link
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold transition-colors",
                    active ? "text-leaf-deep" : "text-muted-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                      item.highlight
                        ? "gradient-leaf text-primary-foreground shadow-glow"
                        : active
                          ? "bg-primary/25"
                          : "bg-transparent",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
