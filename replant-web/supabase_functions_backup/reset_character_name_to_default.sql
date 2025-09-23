CREATE OR REPLACE FUNCTION public.reset_character_name_to_default(character_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  character_record record;
  template_name text;
BEGIN
  -- 입력값 검증
  IF character_id IS NULL THEN
    RAISE EXCEPTION '캐릭터 ID는 비어있을 수 없습니다.';
  END IF;
  
  -- 현재 캐릭터 정보 가져오기
  SELECT * INTO character_record
  FROM public.characters
  WHERE id = character_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '캐릭터를 찾을 수 없습니다.';
  END IF;
  
  -- 해당 레벨의 기본 이름 가져오기
  SELECT name INTO template_name
  FROM public.character_templates
  WHERE level = character_record.level
  LIMIT 1;
  
  IF template_name IS NULL THEN
    RAISE EXCEPTION '해당 레벨의 템플릿을 찾을 수 없습니다.';
  END IF;
  
  -- 캐릭터 이름을 기본값으로 복원
  UPDATE public.characters
  SET 
    name = template_name,
    updated_at = now()
  WHERE id = character_id;
END;
$function$


