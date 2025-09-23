CREATE OR REPLACE FUNCTION public.validate_nickname(nickname_param text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    result JSON;
BEGIN
    -- 빈 값 체크
    IF nickname_param IS NULL OR LENGTH(TRIM(nickname_param)) = 0 THEN
        result := '{"isValid": false, "message": "닉네임을 입력해주세요."}'::JSON;
        RETURN result;
    END IF;
    
    -- 길이 체크
    IF LENGTH(nickname_param) < 2 THEN
        result := '{"isValid": false, "message": "닉네임은 2자 이상이어야 합니다."}'::JSON;
        RETURN result;
    END IF;
    
    IF LENGTH(nickname_param) > 20 THEN
        result := '{"isValid": false, "message": "닉네임은 20자 이하여야 합니다."}'::JSON;
        RETURN result;
    END IF;
    
    -- 특수문자 체크 (한글, 영문, 숫자만 허용)
    IF NOT nickname_param ~ '^[가-힣a-zA-Z0-9]+$' THEN
        result := '{"isValid": false, "message": "닉네임은 한글, 영문, 숫자만 사용 가능합니다."}'::JSON;
        RETURN result;
    END IF;
    
    result := '{"isValid": true, "message": ""}'::JSON;
    RETURN result;
END;
$function$


