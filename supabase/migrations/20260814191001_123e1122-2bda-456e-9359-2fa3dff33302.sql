
-- ROLES
CREATE TYPE public.app_role AS ENUM ('USER','ADMIN');
CREATE TYPE public.report_status AS ENUM ('nova','em_analise','em_atendimento','concluida','cancelada');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  username text UNIQUE,
  avatar_url text,
  points integer NOT NULL DEFAULT 0,
  xp integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text,1,8)),
    NEW.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'USER') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- REPORTS
CREATE SEQUENCE public.report_protocol_seq START 1;
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol text NOT NULL UNIQUE,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  location_text text NOT NULL DEFAULT '',
  latitude double precision,
  longitude double precision,
  status public.report_status NOT NULL DEFAULT 'nova',
  resolution_image_url text,
  admin_note text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own reports" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all reports" ON public.reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'ADMIN'));
CREATE POLICY "insert own reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins update reports" ON public.reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'ADMIN')) WITH CHECK (public.has_role(auth.uid(),'ADMIN'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.set_report_protocol()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.protocol IS NULL OR NEW.protocol = '' THEN
    NEW.protocol := 'SOS-' || lpad(nextval('public.report_protocol_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER reports_protocol BEFORE INSERT ON public.reports FOR EACH ROW EXECUTE FUNCTION public.set_report_protocol();

-- STATUS HISTORY
CREATE TABLE public.report_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  status public.report_status NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.report_events TO authenticated;
GRANT ALL ON public.report_events TO service_role;
ALTER TABLE public.report_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read events of visible reports" ON public.report_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.reports r WHERE r.id = report_id AND (r.user_id = auth.uid() OR public.has_role(auth.uid(),'ADMIN'))));

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'denuncia',
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own notifications update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- POINTS LEDGER
CREATE TABLE public.point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  xp integer NOT NULL DEFAULT 0,
  origin text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.point_transactions TO authenticated;
GRANT ALL ON public.point_transactions TO service_role;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own transactions" ON public.point_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ACHIEVEMENTS CATALOG
CREATE TABLE public.achievements (
  id text PRIMARY KEY,
  position integer NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'award',
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL DEFAULT 1,
  requirement_key text,
  reward_points integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.achievements TO authenticated, anon;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements public read" ON public.achievements FOR SELECT USING (true);

CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);
GRANT SELECT ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own achievements" ON public.user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- SHOP
CREATE TABLE public.shop_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  rarity text NOT NULL DEFAULT 'comum',
  price integer NOT NULL,
  icon text NOT NULL DEFAULT 'sparkles'
);
GRANT SELECT ON public.shop_items TO authenticated, anon;
GRANT ALL ON public.shop_items TO service_role;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shop public read" ON public.shop_items FOR SELECT USING (true);

CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id text NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
  equipped boolean NOT NULL DEFAULT false,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);
GRANT SELECT, UPDATE ON public.inventory TO authenticated;
GRANT ALL ON public.inventory TO service_role;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own inventory" ON public.inventory FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own inventory update" ON public.inventory FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CHALLENGES
CREATE TABLE public.challenges (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  season text,
  goal integer NOT NULL DEFAULT 1,
  goal_type text NOT NULL,
  reward_points integer NOT NULL DEFAULT 0,
  ends_at timestamptz
);
GRANT SELECT ON public.challenges TO authenticated, anon;
GRANT ALL ON public.challenges TO service_role;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "challenges public read" ON public.challenges FOR SELECT USING (true);

CREATE TABLE public.user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id text NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  UNIQUE (user_id, challenge_id)
);
GRANT SELECT, INSERT, UPDATE ON public.user_challenges TO authenticated;
GRANT ALL ON public.user_challenges TO service_role;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own challenges" ON public.user_challenges FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- EDUCATIONAL CONTENT
CREATE TABLE public.tips (
  id text PRIMARY KEY,
  category text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  practical_tip text NOT NULL DEFAULT ''
);
GRANT SELECT ON public.tips TO authenticated, anon;
GRANT ALL ON public.tips TO service_role;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tips public read" ON public.tips FOR SELECT USING (true);

-- PUBLIC LEADERBOARD VIEW (no private data)
CREATE OR REPLACE VIEW public.leaderboard
WITH (security_invoker = true) AS
SELECT id, COALESCE(NULLIF(username,''), 'usuario') AS username, avatar_url, points, xp
FROM public.profiles;
GRANT SELECT ON public.leaderboard TO authenticated;

-- REWARD + NOTIFY ON NEW REPORT
CREATE OR REPLACE FUNCTION public.on_report_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles SET points = points + 50, xp = xp + 50 WHERE id = NEW.user_id;
  INSERT INTO public.point_transactions (user_id, amount, xp, origin) VALUES (NEW.user_id, 50, 50, 'denuncia:' || NEW.protocol);
  INSERT INTO public.report_events (report_id, status, note) VALUES (NEW.id, NEW.status, 'Denúncia registrada');
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (NEW.user_id, 'denuncia', 'Sua denúncia foi recebida.', 'Protocolo ' || NEW.protocol || ' registrado com sucesso.');
  PERFORM public.evaluate_achievements(NEW.user_id);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.on_report_updated()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE msg text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.report_events (report_id, status, note) VALUES (NEW.id, NEW.status, NEW.admin_note);
    msg := CASE NEW.status
      WHEN 'em_analise' THEN 'Sua denúncia está em análise.'
      WHEN 'em_atendimento' THEN 'Sua denúncia entrou em atendimento.'
      WHEN 'concluida' THEN 'Sua denúncia foi concluída!'
      WHEN 'cancelada' THEN 'Sua denúncia foi encerrada como inválida.'
      ELSE 'Sua denúncia foi atualizada.' END;
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (NEW.user_id, 'denuncia', msg, 'Protocolo ' || NEW.protocol);
  END IF;
  RETURN NEW;
END; $$;

-- ACHIEVEMENT EVALUATION
CREATE OR REPLACE FUNCTION public.evaluate_achievements(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
END; $$;

CREATE TRIGGER reports_after_insert AFTER INSERT ON public.reports FOR EACH ROW EXECUTE FUNCTION public.on_report_created();
CREATE TRIGGER reports_after_update AFTER UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.on_report_updated();

-- PURCHASE FUNCTION
CREATE OR REPLACE FUNCTION public.purchase_item(_item_id text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _price integer; _points integer;
BEGIN
  IF _uid IS NULL THEN RETURN json_build_object('ok', false, 'error', 'Não autenticado'); END IF;
  SELECT price INTO _price FROM public.shop_items WHERE id = _item_id;
  IF _price IS NULL THEN RETURN json_build_object('ok', false, 'error', 'Item não encontrado'); END IF;
  IF EXISTS (SELECT 1 FROM public.inventory WHERE user_id = _uid AND item_id = _item_id) THEN
    RETURN json_build_object('ok', false, 'error', 'Você já possui este item');
  END IF;
  SELECT points INTO _points FROM public.profiles WHERE id = _uid;
  IF _points < _price THEN RETURN json_build_object('ok', false, 'error', 'Pontos insuficientes'); END IF;
  UPDATE public.profiles SET points = points - _price WHERE id = _uid;
  INSERT INTO public.inventory (user_id, item_id) VALUES (_uid, _item_id);
  INSERT INTO public.point_transactions (user_id, amount, xp, origin) VALUES (_uid, -_price, 0, 'loja:' || _item_id);
  INSERT INTO public.notifications (user_id, type, title, message) VALUES (_uid, 'loja', 'Compra realizada!', 'Novo item adicionado à sua coleção.');
  RETURN json_build_object('ok', true);
END; $$;
GRANT EXECUTE ON FUNCTION public.purchase_item(text) TO authenticated;

-- CATALOG SEED (não são dados fictícios de denúncias/usuários)
INSERT INTO public.achievements (id, position, name, description, icon, requirement_type, requirement_value, requirement_key, reward_points) VALUES
('primeiro_passo',1,'Primeiro Passo','Faça sua primeira denúncia.','footprints','reports_total',1,NULL,20),
('olhar_atento',2,'Olhar Atento','Envie uma denúncia com foto.','camera','reports_with_photo',1,NULL,20),
('localizador_verde',3,'Localizador Verde','Confirme a localização de uma denúncia.','map-pin','reports_with_location',1,NULL,20),
('explorador_ambiental',4,'Explorador Ambiental','Denuncie em 3 locais diferentes.','compass','distinct_locations',3,NULL,40),
('lixo_zero',5,'Lixo Zero','5 denúncias de descarte irregular.','trash-2','reports_category',5,'lixo',60),
('alerta_fogo',6,'Alerta Contra o Fogo','3 denúncias de queimada.','flame','reports_category',3,'queimada',60),
('guardiao_aguas',7,'Guardião das Águas','3 denúncias de poluição da água.','droplets','reports_category',3,'agua',60),
('defensor_florestas',8,'Defensor das Florestas','3 denúncias de desmatamento.','trees','reports_category',3,'desmatamento',60),
('agua_para_todos',9,'Água para Todos','3 denúncias de esgoto a céu aberto.','waves','reports_category',3,'esgoto',60),
('investigador_verde',10,'Investigador Verde','10 denúncias registradas.','search','reports_total',10,NULL,80),
('protetor_natureza',11,'Protetor da Natureza','Alcance 250 XP.','shield','points_total',250,NULL,50),
('guardiao_verde',12,'Guardião Verde','Alcance 500 XP.','shield-check','points_total',500,NULL,80),
('heroi_ambiental',13,'Herói Ambiental','Alcance 1.000 XP.','trophy','points_total',1000,NULL,120),
('mao_amiga',14,'Mão Amiga','10 contribuições válidas.','handshake','reports_total',10,NULL,60),
('aluno_natureza',15,'Aluno da Natureza','Leia 10 conteúdos educativos.','book-open','tips_read',10,NULL,40),
('consciencia_verde',16,'Consciência Verde','Leia 25 conteúdos educativos.','graduation-cap','tips_read',25,NULL,80),
('exemplo_comunidade',17,'Exemplo para a Comunidade','Desbloqueie 5 conquistas.','users','achievements_total',5,NULL,60),
('patrulheiro_ambiental',18,'Patrulheiro Ambiental','Denuncie em 5 regiões diferentes.','map','distinct_locations',5,NULL,80),
('voz_floresta',19,'Voz da Floresta','15 denúncias registradas.','megaphone','reports_total',15,NULL,100),
('sentinela_rios',20,'Sentinela dos Rios','20 denúncias registradas.','waves','reports_total',20,NULL,120),
('cidadao_planeta',21,'Cidadão do Planeta','25 denúncias registradas.','globe','reports_total',25,NULL,150),
('voz_natureza',22,'Voz da Natureza','Compartilhe um conteúdo educativo.','share-2','tips_shared',1,NULL,30),
('participante_ativo',23,'Participante Ativo','Use o app em 7 dias diferentes.','calendar-check','active_days',7,NULL,70),
('alerta_rapido',24,'Alerta Rápido','Registre uma denúncia no mesmo dia do problema.','zap','reports_total',1,NULL,20),
('agente_ambiental',25,'Agente Ambiental','Desbloqueie 10 conquistas.','badge-check','achievements_total',10,NULL,100),
('semente_mudanca',26,'Semente da Mudança','Desbloqueie 15 conquistas.','sprout','achievements_total',15,NULL,150),
('defensor_planeta',27,'Defensor do Planeta','Desbloqueie 20 conquistas.','earth','achievements_total',20,NULL,200),
('lider_verde',28,'Líder Verde','Desbloqueie 25 conquistas.','crown','achievements_total',25,NULL,250),
('coracao_verde',29,'Coração Verde','Uma denúncia em cada categoria.','heart','all_categories',6,NULL,150),
('lenda_natureza',30,'Lenda da Natureza','Desbloqueie todas as outras conquistas.','sparkles','all_achievements',29,NULL,500);

INSERT INTO public.shop_items (id, name, category, rarity, price, icon) VALUES
('avatar_semente','Semente Verde','avatares','comum',100,'sprout'),
('avatar_guardiao','Guardião da Floresta','avatares','raro',250,'trees'),
('avatar_heroi','Herói Ambiental','avatares','epico',500,'trophy'),
('moldura_folhas','Moldura Folhas','molduras','raro',300,'leaf'),
('moldura_planeta','Moldura Planeta','molduras','epico',600,'globe'),
('tema_natureza','Tema Natureza','temas','epico',1000,'palette'),
('tema_floresta','Tema Floresta','temas','lendario',1500,'trees'),
('emblema_protetor','Emblema Protetor da Natureza','emblemas','comum',200,'shield'),
('emblema_guardiao','Emblema Guardião Verde','emblemas','raro',400,'shield-check'),
('emblema_heroi','Emblema Herói Ambiental','emblemas','epico',800,'award'),
('bau_verde','Baú Verde','baus','raro',750,'package'),
('bau_ambiental','Baú Ambiental','baus','epico',1500,'package-open'),
('bau_lendario','Baú Lendário','baus','lendario',3000,'gift');

INSERT INTO public.challenges (id, title, description, season, goal, goal_type, reward_points) VALUES
('desafio_conteudos','Aprenda com a natureza','Visualize 3 conteúdos educativos.','Água Limpa',3,'tips_read',60),
('desafio_perfil','Complete seu perfil','Adicione nome, usuário e foto de perfil.','Água Limpa',1,'profile_complete',40),
('desafio_mapa','Explore o mapa','Abra o mapa e navegue pela sua região.','Floresta Viva',1,'map_open',30),
('desafio_denuncia','Fique atento','Registre uma denúncia válida quando encontrar um problema real.','Cidade Sustentável',1,'report_created',80);

INSERT INTO public.tips (id, category, title, body, practical_tip) VALUES
('agua_1','agua','Cada gota conta','A água doce disponível para consumo é uma fração mínima de toda a água do planeta e depende de rios e nascentes preservados.','Feche a torneira ao escovar os dentes e reduza o banho em 2 minutos.'),
('agua_2','agua','Rios limpos, cidade saudável','Descartar óleo e lixo em ralos contamina rios inteiros e entope a drenagem urbana.','Guarde óleo usado em garrafa PET e leve a um ponto de coleta.'),
('florestas_1','florestas','Árvores refrescam a cidade','Áreas arborizadas podem ser vários graus mais frescas e ajudam a absorver água da chuva.','Plante ou cuide de uma árvore na sua rua com apoio da prefeitura.'),
('reciclagem_1','reciclagem','Separar é simples','A reciclagem começa em casa com a separação correta entre secos, orgânicos e rejeitos.','Deixe duas lixeiras na cozinha: recicláveis e orgânicos.'),
('queimadas_1','queimadas','Queimada não limpa terreno','O fogo destrói nutrientes do solo, polui o ar e pode fugir de controle rapidamente.','Nunca queime lixo ou mato; acione a defesa civil ao ver fumaça suspeita.'),
('lixo_1','lixo','Descarte irregular atrai doenças','Entulho e lixo em terrenos baldios acumulam água parada e atraem vetores de doenças.','Denuncie pontos viciados de lixo pelo app com foto e local.'),
('sustentabilidade_1','sustentabilidade','Consumo consciente','Reduzir o consumo é mais eficiente do que reciclar depois.','Leve sacola reutilizável e recuse descartáveis desnecessários.');
