CREATE OR REPLACE FUNCTION public.initialize_user_data(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- 각 카테고리별로 캐릭터 생성 (Level 1 씨앗, 모두 잠금)
  INSERT INTO public.characters (user_id, name, level, experience, max_experience, unlocked, category_id)
  VALUES 
    (user_id, '씨앗', 1, 0, 500, false, 'exercise'),      -- 운동 (잠금)
    (user_id, '씨앗', 1, 0, 500, false, 'cleaning'),     -- 청소 (잠금)
    (user_id, '씨앗', 1, 0, 500, false, 'reading'),      -- 독서 (잠금)
    (user_id, '씨앗', 1, 0, 500, false, 'selfcare'),     -- 자기돌봄 (잠금)
    (user_id, '씨앗', 1, 0, 500, false, 'social'),       -- 사회활동 (잠금)
    (user_id, '씨앗', 1, 0, 500, false, 'creativity');   -- 창의활동 (잠금)

  -- 미션 초기화 (모든 미션 템플릿에서 미션 생성)
  INSERT INTO public.missions (user_id, mission_id, title, description, emoji, category, difficulty, experience, completed)
  SELECT 
    user_id,
    mt.mission_id,
    mt.title,
    mt.description,
    mt.emoji,
    mt.category_id,
    mt.difficulty,
    mt.experience,
    false
  FROM public.mission_templates mt;

  -- 카테고리 동기화
  PERFORM public.sync_categories_from_missions();
END;
$function$


