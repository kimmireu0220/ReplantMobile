CREATE OR REPLACE FUNCTION public.update_user_nickname_safe(current_nickname text, new_nickname text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  session_nickname text := current_setting('app.nickname', true);
  user_record RECORD;
BEGIN
  -- 입력 유효성 검사
  IF new_nickname IS NULL OR length(trim(new_nickname)) < 2 OR length(new_nickname) > 20 OR new_nickname !~ '^[가-힣a-zA-Z0-9]+$' THEN
    RETURN json_build_object('success', false, 'error', '유효하지 않은 닉네임입니다');
  END IF;

  -- 현재 사용자 조회: 세션 GUC가 있으면 우선 사용, 없으면 전달값 사용
  SELECT * INTO user_record
  FROM public.users
  WHERE nickname = COALESCE(session_nickname, current_nickname)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', '인증 정보가 올바르지 않습니다');
  END IF;

  -- 새 닉네임 중복 확인
  IF EXISTS (SELECT 1 FROM public.users WHERE nickname = new_nickname AND id != user_record.id) THEN
    RETURN json_build_object('success', false, 'error', '이미 사용 중인 닉네임입니다');
  END IF;

  UPDATE public.users
  SET nickname = new_nickname,
      nickname_created_at = NOW(),
      updated_at = NOW()
  WHERE id = user_record.id;

  RETURN json_build_object(
    'success', true,
    'data', json_build_object(
      'old_nickname', user_record.nickname,
      'new_nickname', new_nickname,
      'user_id', user_record.id
    )
  );
END;
$function$


