CREATE OR REPLACE FUNCTION public.set_nickname_session(nickname_param text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  IF nickname_param IS NULL OR length(trim(nickname_param)) = 0 THEN
    RAISE EXCEPTION '닉네임은 비어있을 수 없습니다.' USING ERRCODE = '22023';
  END IF;
  IF length(nickname_param) < 2 OR length(nickname_param) > 20 OR nickname_param !~ '^[가-힣a-zA-Z0-9]+$' THEN
    RAISE EXCEPTION '닉네임은 2-20자 한글/영문/숫자만 가능합니다.' USING ERRCODE = '22023';
  END IF;
  PERFORM set_config('app.nickname', nickname_param, false);
END;
$function$


