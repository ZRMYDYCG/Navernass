const main = {
  appLogo: {
    alt: 'Narraverse 로고',
  },
  dock: {
    menu: {
      ai: 'Narraverse AI',
      novels: '내 소설',
      trash: '휴지통',
    },
    toggle: {
      show: '내비게이션 표시',
      hide: '내비게이션 숨기기',
    },
  },
  sidebar: {
    toggleMenu: '메뉴 토글',
    openSidebar: '사이드바 열기',
    closeSidebar: '사이드바 닫기',
  },
  search: {
    title: '검색',
    placeholder: '검색...',
    loading: '불러오는 중...',
    empty: {
      noResults: '검색 결과가 없습니다',
      hint: '검색어를 입력하세요...',
    },
    routes: {
      chat: '글쓰기 도우미',
      novels: '내 소설',
      trash: '휴지통',
      news: '제품 업데이트',
    },
    types: {
      novel: '소설',
      chat: '채팅',
      route: '페이지',
    },
  },
  profile: {
    title: '프로필 편집',
    uploadHint: '카메라 아이콘을 눌러 아바타를 업로드하세요',
    fields: {
      penName: '필명',
      website: '웹사이트',
    },
    placeholders: {
      penName: '필명을 입력하세요',
    },
    actions: {
      cancel: '취소',
      save: '저장',
      uploading: '업로드 중...',
      saving: '저장 중...',
    },
    messages: {
      avatarTooLarge: '아바타는 5MB 이하여야 합니다',
      avatarNotImage: '이미지 파일을 선택해 주세요',
      avatarUploadFailed: '아바타 업로드에 실패했습니다',
      updateFailed: '업데이트에 실패했습니다',
      updateFailedRetry: '업데이트에 실패했습니다. 다시 시도해 주세요',
      updated: '프로필이 업데이트되었습니다',
    },
  },
} as const

export default main
