#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 커서 룰 파일들의 alwaysApply 설정을 확인하는 스크립트
 */
function checkCursorRules() {
  const rulesDir = path.join(__dirname, '..', '.cursor', 'rules');
  const ruleFiles = [
    'cursor_rules.mdc',
    'self_improve.mdc',
    'core.mdc',
    // Components (split)
    'component-architecture.mdc',
    'ui-patterns.mdc',
    'async-states.mdc',
    'performance-optimization.mdc',
    // Documentation (split)
    'documentation-standards.mdc',
    'documentation-templates.mdc',
    'documentation-maintenance.mdc',
    // Development (split)
    'development-workflow.mdc',
    'testing-strategy.mdc',
    'debugging-guide.mdc',
    'deployment-guide.mdc'
  ];

  let allValid = true;
  const results = [];

  ruleFiles.forEach(file => {
    const filePath = path.join(rulesDir, file);
    
    if (!fs.existsSync(filePath)) {
      allValid = false;
      results.push({ file, status: 'error', message: '파일이 존재하지 않음' });
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // 파일 상단의 YAML 프론트매터 확인
    const yamlStart = lines.findIndex(line => line.trim() === '---');
    const yamlEnd = lines.findIndex((line, index) => index > yamlStart && line.trim() === '---');
    
    if (yamlStart === -1 || yamlEnd === -1) {
      allValid = false;
      results.push({ file, status: 'error', message: 'YAML 프론트매터 없음' });
      return;
    }

    // alwaysApply 설정 확인
    const yamlContent = lines.slice(yamlStart + 1, yamlEnd).join('\n');
    const hasAlwaysApply = yamlContent.includes('alwaysApply: true');
    
    if (hasAlwaysApply) {
      results.push({ file, status: 'success', message: 'alwaysApply: true 설정됨' });
    } else {
      allValid = false;
      results.push({ file, status: 'error', message: 'alwaysApply: true 설정 없음' });
    }
  });

  // 결과 출력
  console.log('🔍 커서 룰 설정 확인 결과:');
  results.forEach(result => {
    if (result.status === 'success') {
      console.log(`✅ ${result.file}: ${result.message}`);
    } else {
      console.log(`❌ ${result.file}: ${result.message}`);
    }
  });

  if (allValid) {
    console.log('✅ 모든 커서 룰 파일이 정상적으로 설정되었습니다.');
    process.exit(0);
  } else {
    console.log('❌ 커서 룰 설정에 문제가 있습니다.');
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  checkCursorRules();
}

module.exports = { checkCursorRules }; 