CREATE OR REPLACE FUNCTION public.auto_levelup_character(character_id uuid, experience_gained integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$DECLARE
  current_character record;
  new_level integer;
  new_experience integer;
  leveled_up boolean := false;
  new_name text;
  current_default_name text;
  new_default_name text;
  result jsonb;
BEGIN
  -- 입력값 검증
  IF character_id IS NULL THEN
    RAISE EXCEPTION '캐릭터 ID는 비어있을 수 없습니다.';
  END IF;
  
  IF experience_gained IS NULL OR experience_gained < 0 THEN
    RAISE EXCEPTION '경험치는 0 이상이어야 합니다.';
  END IF;
  
  -- 현재 캐릭터 정보 가져오기
  SELECT * INTO current_character
  FROM public.characters
  WHERE id = character_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '캐릭터를 찾을 수 없습니다.';
  END IF;
  
  -- 경험치 추가
  new_experience := current_character.experience + experience_gained;
  new_level := current_character.level;
  
  -- 레벨업 체크 (최대 레벨 6까지)
  WHILE new_experience >= current_character.max_experience AND new_level < 6 LOOP
    new_level := new_level + 1;
    new_experience := new_experience - current_character.max_experience;
    leveled_up := true;
    
    -- 다음 레벨의 최대 경험치 계산 (레벨별 고정값)
    CASE new_level
      WHEN 2 THEN current_character.max_experience := 1000;
      WHEN 3 THEN current_character.max_experience := 2500;
      WHEN 4 THEN current_character.max_experience := 5000;
      WHEN 5 THEN current_character.max_experience := 10000;
      WHEN 6 THEN current_character.max_experience := 20000;
      ELSE current_character.max_experience := 20000; -- 최대 레벨
    END CASE;
  END LOOP;
  
  -- 캐릭터 업데이트
  UPDATE public.characters
  SET 
    level = new_level,
    experience = new_experience,
    max_experience = current_character.max_experience,
    total_experience = total_experience + experience_gained,
    updated_at = now()
  WHERE id = character_id;
  
  -- 레벨업 시 이름 변경 (사용자 커스텀 이름 우선)
  IF leveled_up THEN
    -- 현재 레벨의 기본 이름 가져오기
    SELECT name INTO current_default_name
    FROM public.character_templates
    WHERE level = current_character.level
    LIMIT 1;
    
    -- 새 레벨의 기본 이름 가져오기
    SELECT name INTO new_default_name
    FROM public.character_templates
    WHERE level = new_level
    LIMIT 1;
    
    -- 사용자가 커스텀 이름을 설정했는지 확인
    -- (현재 이름이 현재 레벨의 기본 이름과 다른 경우 커스텀 이름으로 간주)
    IF new_default_name IS NOT NULL AND current_character.name = current_default_name THEN
      -- 사용자가 기본 이름을 사용 중인 경우에만 새 기본 이름으로 변경
      UPDATE public.characters
      SET name = new_default_name
      WHERE id = character_id;
      new_name := new_default_name;
    ELSE
      -- 사용자가 커스텀 이름을 사용 중인 경우 기존 이름 유지
      new_name := current_character.name;
    END IF;
  ELSE
    -- 레벨업이 없으면 기존 이름 유지
    new_name := current_character.name;
  END IF;
  
  -- 결과 반환
  result := jsonb_build_object(
    'leveled_up', leveled_up,
    'new_level', new_level,
    'new_experience', new_experience,
    'new_name', new_name
  );
  
  RETURN result;
END;$function$


