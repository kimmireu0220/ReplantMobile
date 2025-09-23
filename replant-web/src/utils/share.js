export async function shareOrDownload(blob, filename) {
  // 우선적으로 Web Share API를 시도하고, 실패하면 다운로드로 폴백
  try {
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Replant Screenshot' });
      return;
    }
  } catch (_) {
    // 무시하고 다운로드 폴백 수행
  }

  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    // 약간의 지연 후 해제
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}


