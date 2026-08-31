-- Award points/XP when a challenge is completed
CREATE OR REPLACE FUNCTION public.on_challenge_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _reward integer; _title text;
BEGIN
  IF NEW.completed_at IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.completed_at IS NULL) THEN
    SELECT reward_points, title INTO _reward, _title FROM public.challenges WHERE id = NEW.challenge_id;
    IF COALESCE(_reward, 0) > 0 THEN
      UPDATE public.profiles SET points = points + _reward, xp = xp + _reward WHERE id = NEW.user_id;
      INSERT INTO public.point_transactions (user_id, amount, xp, origin)
      VALUES (NEW.user_id, _reward, _reward, 'desafio:' || NEW.challenge_id);
      INSERT INTO public.notifications (user_id, type, title, message)
      VALUES (NEW.user_id, 'desafio', 'Desafio concluído!', COALESCE(_title, NEW.challenge_id) || ' — você ganhou ' || _reward || ' pontos.');
      PERFORM public.evaluate_achievements(NEW.user_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_challenge_completed ON public.user_challenges;
CREATE TRIGGER trg_challenge_completed
AFTER INSERT OR UPDATE OF completed_at ON public.user_challenges
FOR EACH ROW EXECUTE FUNCTION public.on_challenge_completed();

-- Report challenge progress
CREATE OR REPLACE FUNCTION public.on_report_challenge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _total integer; _goal integer;
BEGIN
  SELECT count(*) INTO _total FROM public.reports WHERE user_id = NEW.user_id;
  SELECT goal INTO _goal FROM public.challenges WHERE id = 'desafio_denuncia';
  INSERT INTO public.user_challenges (user_id, challenge_id, progress, completed_at)
  VALUES (NEW.user_id, 'desafio_denuncia', _total, CASE WHEN _total >= COALESCE(_goal,1) THEN now() ELSE NULL END)
  ON CONFLICT (user_id, challenge_id) DO UPDATE
    SET progress = EXCLUDED.progress,
        completed_at = COALESCE(public.user_challenges.completed_at, EXCLUDED.completed_at);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_report_challenge ON public.reports;
CREATE TRIGGER trg_report_challenge
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.on_report_challenge();

-- Profile completion challenge
CREATE OR REPLACE FUNCTION public.on_profile_challenge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.full_name,'') <> '' AND COALESCE(NEW.username,'') <> '' AND COALESCE(NEW.avatar_url,'') <> '' THEN
    INSERT INTO public.user_challenges (user_id, challenge_id, progress, completed_at)
    VALUES (NEW.id, 'desafio_perfil', 1, now())
    ON CONFLICT (user_id, challenge_id) DO UPDATE
      SET progress = 1,
          completed_at = COALESCE(public.user_challenges.completed_at, now());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_challenge ON public.profiles;
CREATE TRIGGER trg_profile_challenge
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.on_profile_challenge();