CREATE OR REPLACE FUNCTION public.create_user_with_nickname(nickname_param text, device_id_param text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  new_user_id uuid;
  device_id text;
BEGIN
  -- 입력값 검증
  IF nickname_param IS NULL OR length(trim(nickname_param)) = 0 THEN
    RAISE EXCEPTION '닉네임은 비어있을 수 없습니다.';
  END IF;
  
  -- SQL 인젝션 방지를 위한 추가 검증
  IF nickname_param !~ '^[가-힣a-zA-Z0-9]+$' THEN
    RAISE EXCEPTION '닉네임은 한글, 영문, 숫자만 사용 가능합니다.';
  END IF;
  
  -- 닉네임 길이 검증
  IF length(nickname_param) < 2 OR length(nickname_param) > 20 THEN
    RAISE EXCEPTION '닉네임은 2자 이상 20자 이하여야 합니다.';
  END IF;
  
  -- 중복 확인
  IF EXISTS (SELECT 1 FROM public.users WHERE nickname = nickname_param) THEN
    RAISE EXCEPTION '이미 존재하는 닉네임입니다.';
  END IF;
  
  -- device_id 매개변수 사용 또는 생성
  IF device_id_param IS NOT NULL THEN
    device_id := device_id_param;
  ELSE
    device_id := gen_random_uuid()::text;
  END IF;
  
  -- 사용자 생성
  INSERT INTO public.users (device_id, nickname, nickname_created_at)
  VALUES (device_id, nickname_param, now())
  RETURNING id INTO new_user_id;
  
  -- 사용자 데이터 초기화 (캐릭터, 미션 생성)
  PERFORM public.initialize_user_data(new_user_id);
  
  RETURN new_user_id;
END;
$function$


