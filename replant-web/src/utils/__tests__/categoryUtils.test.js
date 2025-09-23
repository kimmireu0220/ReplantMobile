import {
  validateAndNormalizeCategory,
  getCategoryColor,
  getCategoryEmoji,
  getCategoryName,
  getAllCategories,
  isValidCategory,
} from '../categoryUtils';
import { tokens } from '../../design/tokens';

describe('categoryUtils', () => {
  describe('validateAndNormalizeCategory', () => {
    test('유효한 카테고리 ID를 정규화해야 한다', () => {
      expect(validateAndNormalizeCategory('Exercise')).toBe('exercise');
      expect(validateAndNormalizeCategory(' READING ')).toBe('reading');
      expect(validateAndNormalizeCategory('social')).toBe('social');
    });

    test('빈 값에 대해 에러를 발생시켜야 한다', () => {
      expect(() => validateAndNormalizeCategory(null)).toThrow('카테고리 ID가 제공되지 않았습니다.');
      expect(() => validateAndNormalizeCategory(undefined)).toThrow('카테고리 ID가 제공되지 않았습니다.');
      expect(() => validateAndNormalizeCategory('')).toThrow('카테고리 ID가 제공되지 않았습니다.');
      expect(() => validateAndNormalizeCategory('   ')).toThrow('카테고리 ID가 비어있습니다.');
    });

    test('사용자 지정 컨텍스트를 사용해야 한다', () => {
      expect(() => validateAndNormalizeCategory(null, '미션 카테고리')).toThrow('미션 카테고리 ID가 제공되지 않았습니다.');
    });
  });

  describe('getCategoryColor', () => {
    test('알려진 카테고리의 색상을 반환해야 한다', () => {
      expect(getCategoryColor('cleaning')).toBe(tokens.colors.accent.green);
      expect(getCategoryColor('reading')).toBe(tokens.colors.accent.blue);
      expect(getCategoryColor('selfcare')).toBe(tokens.colors.accent.purple);
    });

    test('알 수 없는 카테고리에 대해 기본 색상을 반환해야 한다', () => {
      expect(getCategoryColor('unknown')).toBe(tokens.colors.gray[500]);
      expect(getCategoryColor(null)).toBe(tokens.colors.gray[500]);
      expect(getCategoryColor(undefined)).toBe(tokens.colors.gray[500]);
    });
  });

  describe('getCategoryEmoji', () => {
    test('알려진 카테고리의 이모지를 반환해야 한다', () => {
      expect(getCategoryEmoji('exercise')).toBe('💪');
      expect(getCategoryEmoji('reading')).toBe('📚');
      expect(getCategoryEmoji('cleaning')).toBe('🧹');
    });

    test('알 수 없는 카테고리에 대해 기본 이모지를 반환해야 한다', () => {
      expect(getCategoryEmoji('unknown')).toBe('❓');
      expect(getCategoryEmoji(null)).toBe('❓');
      expect(getCategoryEmoji(undefined)).toBe('❓');
    });
  });

  describe('getCategoryName', () => {
    test('알려진 카테고리의 이름을 반환해야 한다', () => {
      expect(getCategoryName('exercise')).toBe('운동');
      expect(getCategoryName('reading')).toBe('독서');
      expect(getCategoryName('social')).toBe('사회활동');
    });

    test('알 수 없는 카테고리에 대해 기본 이름을 반환해야 한다', () => {
      expect(getCategoryName('unknown')).toBe('알 수 없는 카테고리');
      expect(getCategoryName(null)).toBe('알 수 없는 카테고리');
      expect(getCategoryName(undefined)).toBe('알 수 없는 카테고리');
    });
  });

  describe('getAllCategories', () => {
    test('모든 카테고리 목록을 반환해야 한다', () => {
      const categories = getAllCategories();
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain('exercise');
      expect(categories).toContain('reading');
      expect(categories).toContain('selfcare');
    });
  });

  describe('isValidCategory', () => {
    test('유효한 카테고리에 대해 true를 반환해야 한다', () => {
      expect(isValidCategory('exercise')).toBe(true);
      expect(isValidCategory('reading')).toBe(true);
      expect(isValidCategory('social')).toBe(true);
    });

    test('무효한 카테고리에 대해 false를 반환해야 한다', () => {
      expect(isValidCategory('invalid')).toBe(false);
      expect(isValidCategory(null)).toBe(false);
      expect(isValidCategory(undefined)).toBe(false);
      expect(isValidCategory('')).toBe(false);
    });
  });
});