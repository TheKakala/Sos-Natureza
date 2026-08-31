CREATE TABLE IF NOT EXISTS public.tip_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id text NOT NULL REFERENCES public.tips(id),
  seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tip_id)
);

GRANT SELECT, INSERT, UPDATE ON public.tip_reads TO authenticated;
GRANT ALL ON public.tip_reads TO service_role;

ALTER TABLE public.tip_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own tip reads" ON public.tip_reads;
CREATE POLICY "own tip reads" ON public.tip_reads FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert own tip reads" ON public.tip_reads;
CREATE POLICY "insert own tip reads" ON public.tip_reads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update own tip reads" ON public.tip_reads;
CREATE POLICY "update own tip reads" ON public.tip_reads FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.on_tip_read()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _total integer; _goal integer;
BEGIN
  SELECT count(*) INTO _total FROM public.tip_reads WHERE user_id = NEW.user_id;
  SELECT goal INTO _goal FROM public.challenges WHERE id = 'desafio_conteudos';
  INSERT INTO public.user_challenges (user_id, challenge_id, progress, completed_at)
  VALUES (NEW.user_id, 'desafio_conteudos', _total, CASE WHEN _total >= COALESCE(_goal, 3) THEN now() ELSE NULL END)
  ON CONFLICT (user_id, challenge_id) DO UPDATE
    SET progress = EXCLUDED.progress,
        completed_at = COALESCE(public.user_challenges.completed_at, EXCLUDED.completed_at);
  PERFORM public.evaluate_achievements(NEW.user_id);
  RETURN NEW;
END; $$;

CREATE UNIQUE INDEX IF NOT EXISTS user_challenges_user_challenge_key ON public.user_challenges (user_id, challenge_id);

DROP TRIGGER IF EXISTS tip_reads_after_insert ON public.tip_reads;
CREATE TRIGGER tip_reads_after_insert AFTER INSERT ON public.tip_reads
FOR EACH ROW EXECUTE FUNCTION public.on_tip_read();

CREATE OR REPLACE FUNCTION public.evaluate_achievements(_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  a record; progress integer; total integer; unlocked_count integer;
BEGIN
  FOR a IN SELECT * FROM public.achievements ORDER BY position LOOP
    IF EXISTS (SELECT 1 FROM public.user_achievements WHERE user_id = _user_id AND achievement_id = a.id) THEN
      CONTINUE;
    END IF;
    progress := 0;
    IF a.requirement_type = 'reports_total' THEN
      SELECT count(*) INTO progress FROM public.reports WHERE user_id = _user_id;
    ELSIF a.requirement_type = 'reports_with_photo' THEN
      SELECT count(*) INTO progress FROM public.reports WHERE user_id = _user_id AND image_url IS NOT NULL;
    ELSIF a.requirement_type = 'reports_with_location' THEN
      SELECT count(*) INTO progress FROM public.reports WHERE user_id = _user_id AND latitude IS NOT NULL;
    ELSIF a.requirement_type = 'reports_category' THEN
      SELECT count(*) INTO progress FROM public.reports WHERE user_id = _user_id AND category = a.requirement_key;
    ELSIF a.requirement_type = 'distinct_locations' THEN
      SELECT count(DISTINCT lower(location_text)) INTO progress FROM public.reports WHERE user_id = _user_id AND location_text <> '';
    ELSIF a.requirement_type = 'all_categories' THEN
      SELECT count(DISTINCT category) INTO progress FROM public.reports WHERE user_id = _user_id;
    ELSIF a.requirement_type = 'points_total' THEN
      SELECT COALESCE(xp,0) INTO progress FROM public.profiles WHERE id = _user_id;
    ELSIF a.requirement_type = 'reports_resolved' THEN
      SELECT count(*) INTO progress FROM public.reports WHERE user_id = _user_id AND status = 'concluida';
    ELSIF a.requirement_type = 'active_days' THEN
      SELECT count(DISTINCT date(created_at)) INTO progress FROM public.reports WHERE user_id = _user_id;
    ELSIF a.requirement_type = 'tips_read' THEN
      SELECT count(*) INTO progress FROM public.tip_reads WHERE user_id = _user_id;
    ELSIF a.requirement_type = 'achievements_total' THEN
      SELECT count(*) INTO progress FROM public.user_achievements WHERE user_id = _user_id;
    ELSIF a.requirement_type = 'all_achievements' THEN
      SELECT count(*) INTO unlocked_count FROM public.user_achievements WHERE user_id = _user_id;
      SELECT count(*) - 1 INTO total FROM public.achievements;
      progress := unlocked_count;
      IF total IS NOT NULL THEN a.requirement_value := total; END IF;
    END IF;
    IF progress >= a.requirement_value THEN
      INSERT INTO public.user_achievements (user_id, achievement_id) VALUES (_user_id, a.id) ON CONFLICT DO NOTHING;
      IF a.reward_points > 0 THEN
        UPDATE public.profiles SET points = points + a.reward_points, xp = xp + a.reward_points WHERE id = _user_id;
        INSERT INTO public.point_transactions (user_id, amount, xp, origin) VALUES (_user_id, a.reward_points, a.reward_points, 'conquista:' || a.id);
      END IF;
      INSERT INTO public.notifications (user_id, type, title, message)
      VALUES (_user_id, 'conquista', 'Conquista desbloqueada!', a.name);
    END IF;
  END LOOP;
END; $function$;

UPDATE public.achievements SET description = v.description FROM (VALUES
 ('primeiro_passo','Envie sua primeira denúncia ambiental e dê o passo inicial para transformar a sua cidade.'),
 ('olhar_atento','Anexe uma foto a uma denúncia: imagens ajudam a Prefeitura a entender e resolver o problema mais rápido.'),
 ('localizador_verde','Confirme no mapa o local exato de um problema para que a equipe encontre o ponto sem dificuldade.'),
 ('explorador_ambiental','Registre denúncias em 3 lugares diferentes e mostre que você observa toda a sua região.'),
 ('lixo_zero','Denuncie 5 casos de descarte irregular de lixo ou entulho e ajude a limpar terrenos e ruas.'),
 ('alerta_fogo','Envie 3 denúncias de queimada e ajude a evitar incêndios que destroem a vegetação e poluem o ar.'),
 ('guardiao_aguas','Envie 3 denúncias de poluição da água e proteja rios, córregos e nascentes da sua cidade.'),
 ('defensor_florestas','Envie 3 denúncias de desmatamento e defenda as árvores e áreas verdes do seu bairro.'),
 ('agua_para_todos','Envie 3 denúncias de esgoto a céu aberto e ajude a melhorar o saneamento e a saúde de todos.'),
 ('investigador_verde','Chegue a 10 denúncias registradas: sua atenção constante faz diferença de verdade.'),
 ('protetor_natureza','Acumule 250 XP participando do app e mostre que a natureza tem em você um protetor.'),
 ('guardiao_verde','Acumule 500 XP e entre para o grupo dos guardiões mais dedicados da plataforma.'),
 ('heroi_ambiental','Acumule 1.000 XP: sua trajetória já inspira outros cidadãos a cuidarem do meio ambiente.'),
 ('mao_amiga','Some 10 contribuições válidas, ajudando a Prefeitura a priorizar os problemas mais urgentes.'),
 ('aluno_natureza','Leia 10 conteúdos educativos e aprenda atitudes simples que protegem o meio ambiente.'),
 ('consciencia_verde','Leia 25 conteúdos educativos e transforme conhecimento em consciência ambiental diária.'),
 ('exemplo_comunidade','Desbloqueie 5 conquistas e torne-se um exemplo de participação para a sua comunidade.'),
 ('patrulheiro_ambiental','Denuncie em 5 regiões diferentes e ajude a mapear os problemas ambientais de toda a cidade.'),
 ('voz_floresta','Chegue a 15 denúncias: sua voz já ecoa pelas florestas e áreas verdes que você protege.'),
 ('sentinela_rios','Chegue a 20 denúncias e assuma o posto de sentinela dos rios e córregos da sua região.'),
 ('cidadao_planeta','Chegue a 25 denúncias e mostre que cuidar do bairro é também cuidar do planeta inteiro.'),
 ('voz_natureza','Compartilhe um conteúdo educativo e leve informação ambiental para mais pessoas.'),
 ('participante_ativo','Use o aplicativo em 7 dias diferentes e mantenha o cuidado ambiental como hábito.'),
 ('alerta_rapido','Registre uma denúncia no mesmo dia em que encontrar o problema: rapidez evita danos maiores.'),
 ('agente_ambiental','Desbloqueie 10 conquistas e receba o título de agente ambiental da sua cidade.'),
 ('semente_mudanca','Desbloqueie 15 conquistas: cada atitude sua é uma semente de mudança que germina.'),
 ('defensor_planeta','Desbloqueie 20 conquistas e prove que sua dedicação ao planeta é constante.')
) AS v(id, description) WHERE public.achievements.id = v.id;

INSERT INTO public.shop_items (id, name, category, rarity, price, icon) VALUES
 ('avatar_folha','Folha Guardiã','avatares','comum',50,'leaf'),
 ('avatar_gota','Gota Cristalina','avatares','comum',150,'droplets'),
 ('avatar_arvore','Árvore Ancestral','avatares','raro',350,'trees'),
 ('avatar_planeta','Planeta Guardião','avatares','epico',900,'globe'),
 ('avatar_coroa','Coroa da Natureza','avatares','lendario',2000,'crown')
ON CONFLICT (id) DO NOTHING;