import { t as supabase } from "./client-C8NJlSke.js";
import { i as useAuth } from "./router-BaP0cReg.js";
import { t as AppShell } from "./AppShell-DwfDQFAb.js";
import { o as formatDate } from "./sos-CS-s4mgb.js";
import { t as Progress } from "./progress-DOIEKRJF.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { Award, BadgeCheck, BookOpen, CalendarCheck, Camera, Compass, Crown, Droplets, Earth, Flame, Footprints, GraduationCap, Handshake, Leaf, Loader2, Lock, Map as Map$1, MapPin, Megaphone, Search, Share2, Shield, ShieldCheck, Sparkles, Sprout, Trash2, Trees, Trophy, Users, Waves, Zap } from "lucide-react";
//#region src/lib/lucide-icon.tsx
var ICONS = {
	award: Award,
	"badge-check": BadgeCheck,
	"book-open": BookOpen,
	"calendar-check": CalendarCheck,
	camera: Camera,
	compass: Compass,
	crown: Crown,
	droplets: Droplets,
	earth: Earth,
	flame: Flame,
	footprints: Footprints,
	globe: Earth,
	"graduation-cap": GraduationCap,
	handshake: Handshake,
	leaf: Leaf,
	map: Map$1,
	"map-pin": MapPin,
	megaphone: Megaphone,
	search: Search,
	"share-2": Share2,
	shield: Shield,
	"shield-check": ShieldCheck,
	sparkles: Sparkles,
	sprout: Sprout,
	"trash-2": Trash2,
	trees: Trees,
	trophy: Trophy,
	users: Users,
	waves: Waves,
	zap: Zap
};
function iconByName(name) {
	return ICONS[name ?? ""] ?? Award;
}
//#endregion
//#region src/routes/_authenticated/conquistas.tsx?tsr-split=component
function AchievementsPage() {
	const { user } = useAuth();
	const { data, isLoading, isError } = useQuery({
		queryKey: ["achievements", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const [catalog, mine] = await Promise.all([supabase.from("achievements").select("*").order("position"), supabase.from("user_achievements").select("achievement_id, unlocked_at").eq("user_id", user.id)]);
			if (catalog.error) throw catalog.error;
			return {
				catalog: catalog.data ?? [],
				mine: mine.data ?? []
			};
		}
	});
	const unlocked = new Map((data?.mine ?? []).map((item) => [item.achievement_id, item.unlocked_at]));
	const total = data?.catalog.length ?? 0;
	const done = unlocked.size;
	return /* @__PURE__ */ jsxs(AppShell, {
		title: "Conquistas",
		subtitle: `${done} de ${total} desbloqueadas`,
		children: [/* @__PURE__ */ jsx(Progress, {
			value: total ? done / total * 100 : 0,
			className: "mb-4 h-2.5"
		}), isLoading ? /* @__PURE__ */ jsx("div", {
			className: "flex justify-center py-10",
			children: /* @__PURE__ */ jsx(Loader2, {
				className: "h-6 w-6 animate-spin text-leaf-deep",
				"aria-hidden": "true"
			})
		}) : isError ? /* @__PURE__ */ jsx("p", {
			role: "alert",
			className: "surface-card p-4 text-sm",
			children: "Não foi possível carregar os dados. Tente novamente."
		}) : /* @__PURE__ */ jsx("ul", {
			className: "space-y-2",
			children: (data?.catalog ?? []).map((achievement) => {
				const when = unlocked.get(achievement.id);
				const isUnlocked = Boolean(when);
				return /* @__PURE__ */ jsxs("li", {
					className: `flex items-start gap-3 rounded-2xl border p-3 ${isUnlocked ? "border-primary/60 bg-primary/10" : "border-border bg-card"}`,
					children: [/* @__PURE__ */ jsxs("span", {
						className: `relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isUnlocked ? "bg-primary/30 text-leaf-deep" : "bg-surface text-muted-foreground"}`,
						children: [(() => {
							const Icon = iconByName(achievement.icon);
							return /* @__PURE__ */ jsx(Icon, {
								className: "h-6 w-6",
								"aria-hidden": "true"
							});
						})(), !isUnlocked ? /* @__PURE__ */ jsx("span", {
							className: "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card",
							children: /* @__PURE__ */ jsx(Lock, {
								className: "h-3 w-3",
								"aria-hidden": "true"
							})
						}) : null]
					}), /* @__PURE__ */ jsxs("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "font-bold",
								children: achievement.name
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-muted-foreground",
								children: achievement.description
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-1 text-[11px] font-semibold",
								children: [
									"Recompensa: +",
									achievement.reward_points,
									" pontos ·",
									" ",
									isUnlocked ? `Desbloqueada em ${formatDate(when)}` : "Bloqueada"
								]
							})
						]
					})]
				}, achievement.id);
			})
		})]
	});
}
//#endregion
export { AchievementsPage as component };
