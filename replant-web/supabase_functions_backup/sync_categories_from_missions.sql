CREATE OR REPLACE FUNCTION public.sync_categories_from_missions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- 미션 템플릿에서 고유한 카테고리를 가져와서 categories 테이블에 삽입
  INSERT INTO public.categories (id, name, emoji, color, description)
  SELECT DISTINCT 
    category_id,
    CASE category_id
      WHEN 'exercise' THEN '운동'
      WHEN 'cleaning' THEN '청소'
      WHEN 'reading' THEN '독서'
      WHEN 'selfcare' THEN '자기돌봄'
      WHEN 'social' THEN '사회활동'
      WHEN 'creativity' THEN '창의활동'
      ELSE category_id
    END,
    CASE category_id
      WHEN 'exercise' THEN '💪'
      WHEN 'cleaning' THEN '🧹'
      WHEN 'reading' THEN '📚'
      WHEN 'selfcare' THEN '🌸'
      WHEN 'social' THEN '👥'
      WHEN 'creativity' THEN '🎨'
      ELSE '❓'
    END,
    CASE category_id
      WHEN 'exercise' THEN '#ef4444'
      WHEN 'cleaning' THEN '#22c55e'
      WHEN 'reading' THEN '#3b82f6'
      WHEN 'selfcare' THEN '#8b5cf6'
      WHEN 'social' THEN '#f97316'
      WHEN 'creativity' THEN '#ec4899'
      ELSE '#CCCCCC'
    END,
    CASE category_id
      WHEN 'exercise' THEN '건강한 몸과 마음을 위한 운동 활동'
      WHEN 'cleaning' THEN '깨끗하고 정돈된 환경 만들기'
      WHEN 'reading' THEN '지식과 상상력을 넓히는 독서 활동'
      WHEN 'selfcare' THEN '자신을 돌보고 사랑하는 활동'
      WHEN 'social' THEN '다른 사람들과의 소통과 연결'
      WHEN 'creativity' THEN '창의성과 표현력을 기르는 활동'
      ELSE '기타 활동'
    END
  FROM public.mission_templates
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    emoji = EXCLUDED.emoji,
    color = EXCLUDED.color,
    description = EXCLUDED.description;
END;
$function$


