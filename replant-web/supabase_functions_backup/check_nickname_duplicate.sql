CREATE OR REPLACE FUNCTION public.check_nickname_duplicate(nickname_param text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  exists_count integer;
BEGIN
  -- 입력값 검증
  IF nickname_param IS NULL OR length(trim(nickname_param)) = 0 THEN
    RETURN false;
  END IF;
  
  -- SQL 인젝션 방지를 위한 추가 검증
  IF nickname_param !~ '^[가-힣a-zA-Z0-9]+$' THEN
    RETURN false;
  END IF;
  
  -- 중복 확인
  SELECT COUNT(*) INTO exists_count
  FROM public.users
  WHERE nickname = nickname_param;
  
  RETURN exists_count > 0;
END;
$function$


