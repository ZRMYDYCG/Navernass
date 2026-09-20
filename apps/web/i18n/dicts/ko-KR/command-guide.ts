const commandGuide = {
  title: '단축키 및 작업 참고',
  description: '챕터 편집 시 사용할 수 있는 키보드 단축키, 입력 방식, 화면 조작.',
  openButton: '단축키',
  viewAll: '전체 참고 보기',
  footerHint: 'Ctrl+/ (Mac은 ⌘/)로 언제든 이 패널을 열 수 있습니다.',
  tabs: {
    shortcuts: '단축키',
    input: '빠른 삽입',
    editing: '화면 조작',
  },
  sections: {
    workspace: {
      title: '작업 공간',
      description: '패널 전환, 저장, 탐색',
    },
    editorShortcuts: {
      title: '본문 편집',
      description: '챕터 본문에서 쓰는 편집 단축키',
    },
    inputTriggers: {
      title: '빠른 입력',
      description: '본문에 입력하여 기능 실행',
    },
    slashFormat: {
      title: '슬래시 메뉴',
      description: '/ 로 제목, 목록, 인용, 구분선 등 삽입',
    },
    editingUi: {
      title: '선택 및 단락',
      description: '마우스 또는 텍스트 선택으로 하는 작업',
    },
    bottomBar: {
      title: '하단 도구 모음',
      description: '상태 표시줄의 면·조판 설정',
    },
  },
  items: {
    save: {
      label: '저장',
      description: '현재 챕터 또는 계획 문서 저장',
    },
    toggleLeftPanel: {
      label: '왼쪽 패널 전환',
      description: '챕터 목록·캐릭터 등 사이드바 표시/숨기기',
    },
    toggleRightPanel: {
      label: '오른쪽 패널 전환',
      description: '오른쪽 보조 패널 표시/숨기기',
    },
    immersiveMode: {
      label: '몰입 모드',
      description: '상단·사이드바를 숨겨 작성 영역 확대',
    },
    openGuide: {
      label: '이 참고 열기',
      description: '모든 단축키와 작업 설명 보기',
    },
    chapterSearch: {
      label: '챕터 이동',
      description: '상단 제목 표시줄을 클릭해 챕터 검색·전환',
    },
    findInChapter: {
      label: '찾기',
      description: '현재 챕터 본문에서 문자열 검색',
    },
    undo: {
      label: '실행 취소',
      description: '마지막 편집 취소',
    },
    redo: {
      label: '다시 실행',
      description: '취소한 편집 복원',
    },
    bold: {
      label: '굵게',
      description: '선택 텍스트 굵게',
    },
    italic: {
      label: '기울임',
      description: '선택 텍스트 기울임',
    },
    underline: {
      label: '밑줄',
      description: '선택 텍스트에 밑줄',
    },
    slashMenu: {
      label: '삽입 메뉴 열기',
      description: '단락에서 / 입력 후 삽입할 내용·서식 선택',
    },
    selectTextToolbar: {
      label: '플로팅 서식 표시줄',
      description: '텍스트 선택 시 굵게·기울임·밑줄 설정 표시줄 표시',
    },
    dragHandle: {
      label: '단락 드래그',
      description: '단락 왼쪽 핸들로 순서 변경',
    },
    characterNameSuggest: {
      label: '캐릭터 이름 제안',
      description: '캐릭터 이름 입력 시 기존 이름 자동 제안·강조',
    },
    bottomSurface: {
      label: '면 스타일',
      description: '선백·소정·고卷 등 용지 배경 전환',
    },
    bottomTypography: {
      label: '조판 설정',
      description: '들여쓰기, 줄 간격, 단 너비, 가로 줄 원고지, 단락 포커스',
    },
    bottomCursor: {
      label: '커서 스타일',
      description: '편집기 내 커서 모양 전환',
    },
  },
  slashCommand: {
    openGuide: {
      title: '단축키 참고 보기',
      description: '단축키 및 작업 참고 패널 열기',
    },
  },
  welcome: {
    hint: '자주 쓰는 단축키',
    more: '슬래시 메뉴로 제목, 목록, 구분선 등을 빠르게 삽입',
  },
} as const

export default commandGuide
