import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../design/tokens';
import { getCurrentUserNickname } from '../config/supabase';
import { useCharacter } from '../hooks/useCharacter';
import { useCategory } from '../hooks/useCategory';
import CharacterCard from '../components/dex/CharacterCard';
import CategoryTabs from '../components/dex/CategoryTabs';
import { PageTitle } from '../components/ui/ScreenReaderOnly';
import { ThemeToggle } from '../components/ui';

const DexPage = () => {
  const navigate = useNavigate();
  const { characters, selectedCharacter, loading } = useCharacter();
  const { loading: categoriesLoading } = useCategory();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const nickname = getCurrentUserNickname();

  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.background.primary,
    padding: tokens.spacing[4]
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[6]
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: tokens.spacing[2]
  };

  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border.medium}`,
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium
  };

  const cardStyle = {
    backgroundColor: tokens.colors.background.primary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[6],
    boxShadow: tokens.shadow.base,
    border: 'none'
  };

  const pageTitleStyle = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2]
  };

  const pageSubtitleStyle = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[4]
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: tokens.spacing[10]
  };



  const characterGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: tokens.spacing[4],
    justifyContent: 'start'
  };



  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // 캐릭터 클릭 핸들러
  const handleCharacterClick = (character) => {
    // 캐릭터 상세정보 페이지로 이동
    const targetUrl = `/character/detail/${character.category}`;
    navigate(targetUrl);
  };

  const getFilteredCharacters = () => {
    let filteredCharacters = Object.values(characters);
    
    if (selectedCategory !== 'all') {
      filteredCharacters = filteredCharacters.filter(character => 
        character.category === selectedCategory
      );
    }
    
    return filteredCharacters;
  };

  const getUnlockedCharacters = () => {
    return getFilteredCharacters().filter(character => character.unlocked);
  };

  const getLockedCharacters = () => {
    return getFilteredCharacters().filter(character => !character.unlocked);
  };

  // 로딩 중일 때
  if (loading || categoriesLoading) {
    return (
      <div style={pageStyle} role="main" aria-label="캐릭터 도감">
        <PageTitle title="캐릭터 도감" />
        <div style={containerStyle}>
          <div style={headerStyle}>
            <div></div> {/* 왼쪽 빈 공간 */}
            {nickname && (
              <div style={userInfoStyle}>
                <span>👤</span>
                <span>{nickname}</span>
              </div>
            )}
          </div>
          
          <div style={cardStyle}>
            <div style={loadingStyle}>
              <div style={{ fontSize: '24px', marginBottom: tokens.spacing[3] }}>📚</div>
              <p>도감 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }




  return (
    <div style={pageStyle} role="main" aria-label="캐릭터 도감">
      <PageTitle title="캐릭터 도감" />
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div></div> {/* 왼쪽 빈 공간 */}
          {nickname && (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={userInfoStyle}>
                <span>👤</span>
                <span>{nickname}</span>
              </div>
              <ThemeToggle showLabel={false} showSystem={false} />
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <h2 style={pageTitleStyle}>📚 캐릭터 도감</h2>
          <p style={pageSubtitleStyle}>
            다양한 카테고리의 캐릭터들을 수집하고 성장시켜보세요
          </p>



          {/* 카테고리 필터 */}
          <CategoryTabs
            selectedCategory={selectedCategory}
            onSelect={handleCategoryChange}
          />

          {/* 수집한 캐릭터 섹션 */}
          {getUnlockedCharacters().length > 0 && (
            <div style={{ marginTop: tokens.spacing[6], marginBottom: tokens.spacing[6] }}>
              <h3 style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.text.primary,
                marginBottom: tokens.spacing[4],
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2]
              }}>
                <span>🎉</span>
                <span>수집한 캐릭터</span>
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.text.secondary,
                  fontWeight: tokens.typography.fontWeight.normal
                }}>
                  ({getUnlockedCharacters().length}개)
                </span>
              </h3>
              <div style={characterGridStyle}>
                {getUnlockedCharacters().map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    isSelected={selectedCharacter?.id === character.id}
                    showDetails={true}
                    onSelect={handleCharacterClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 발견할 캐릭터 섹션 */}
          {getLockedCharacters().length > 0 && (
            <div style={{ marginTop: tokens.spacing[6] }}>
              <h3 style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.text.primary,
                marginBottom: tokens.spacing[4],
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2]
              }}>
                <span>🌟</span>
                <span>발견할 캐릭터</span>
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.text.secondary,
                  fontWeight: tokens.typography.fontWeight.normal
                }}>
                  ({getLockedCharacters().length}개)
                </span>
              </h3>
              <div style={characterGridStyle}>
                {getLockedCharacters().map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    isSelected={selectedCharacter?.id === character.id}
                    showDetails={true}
                    onSelect={handleCharacterClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 빈 상태 */}
          {getFilteredCharacters().length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: tokens.spacing[10]
            }} role="status" aria-live="polite">
              <div style={{
                fontSize: '48px',
                marginBottom: tokens.spacing[4]
              }}>📚</div>
              <h3 style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.text.primary,
                marginBottom: tokens.spacing[2]
              }}>
                {selectedCategory === 'all' 
                  ? '아직 캐릭터가 없어요' 
                  : '이 카테고리의 캐릭터가 없어요'}
              </h3>
              <p style={{
                fontSize: tokens.typography.fontSize.base,
                color: tokens.colors.text.secondary
              }}>
                {selectedCategory === 'all'
                  ? '미션을 완료하여 캐릭터를 해제해보세요!'
                  : '다른 카테고리의 미션을 완료해보세요!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DexPage;