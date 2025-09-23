CREATE OR REPLACE FUNCTION public.get_user_by_nickname(nickname_param text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  user_id uuid;
BEGIN
  -- 입력값 검증
  IF nickname_param IS NULL OR length(trim(nickname_param)) = 0 THEN
    RAISE EXCEPTION '닉네임은 비어있을 수 없습니다.';
  END IF;
  
  -- SQL 인젝션 방지를 위한 추가 검증
  IF nickname_param !~ '^[가-힣a-zA-Z0-9]+$' THEN
    RAISE EXCEPTION '닉네임은 한글, 영문, 숫자만 사용 가능합니다.';
  END IF;
  
  SELECT id INTO user_id
  FROM public.users
  WHERE nickname = nickname_param
  LIMIT 1;
  
  RETURN user_id;
END;
$function$


