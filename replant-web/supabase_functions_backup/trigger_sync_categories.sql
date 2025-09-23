CREATE OR REPLACE FUNCTION public.trigger_sync_categories()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- 카테고리 동기화 실행
  PERFORM public.sync_categories_from_missions();
  RETURN NEW;
END;
$function$


