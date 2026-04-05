const tiptap = {
  editor: {
    placeholder: '쓰기 시작...',
    uploadingIllustration: '일러스트 업로드 중...',
    uploadIllustrationFailed: '일러스트 업로드에 실패했습니다',
    unknownRole: '알 수 없는 역할',
    aiGeneratedImageAlt: 'AI 생성 이미지',
  },
  search: {
    placeholder: '검색...',
    previous: '이전(Shift+Enter)',
    next: '다음(Enter)',
    close: '닫기(Esc)',
  },
  floatingMenu: {
    accept: '수락',
    reject: '거절',
  },
  formatToolbar: {
    bold: '굵게',
    italic: '기울임',
    underline: '밑줄',
    sendToSideAI: '선택 내용을 우측 AI 패널로 보내기',
    askAI: 'AI에게 묻기',
  },
  dragHandle: {
    moveParagraph: '드래그하여 문단 이동',
  },
  characterNameSuggest: {
    prefix: '캐릭터 이름 제안:',
  },
  imageGenerationDialog: {
    title: 'AI 일러스트',
    promptLabel: '프롬프트',
    promptPlaceholder: '원하는 이미지를 설명해 주세요...',
    ratioLabel: '가로세로 비율',
    generating: '생성 중...',
    generate: '생성',
  },
  commandList: {
    empty: '일치하는 명령이 없습니다',
    groups: {
      ai: '명령',
      format: '서식',
      basic: '기본',
    },
  },
  slashCommand: {
    items: {
      aiContinue: {
        title: 'AI 이어쓰기',
        description: 'AI가 글을 이어서 작성합니다',
      },
      aiBrainstorm: {
        title: 'AI 브레인스토밍',
        description: '아이디어와 관점을 생성합니다',
      },
      aiOutline: {
        title: 'AI 개요',
        description: '개요를 생성합니다',
      },
      aiImage: {
        title: 'AI 일러스트',
        description: 'AI로 이미지를 생성합니다',
      },
      heading1: {
        title: '제목 1',
        description: '큰 제목',
      },
      heading2: {
        title: '제목 2',
        description: '중간 제목',
      },
      heading3: {
        title: '제목 3',
        description: '작은 제목',
      },
      bulletList: {
        title: '글머리 기호 목록',
        description: '목록을 만듭니다',
      },
      orderedList: {
        title: '번호 목록',
        description: '번호가 있는 목록',
      },
      blockquote: {
        title: '인용',
        description: '인용문',
      },
      codeBlock: {
        title: '코드 블록',
        description: '코드를 삽입합니다',
      },
      divider: {
        title: '구분선',
        description: '가로 구분선',
      },
    },
    ai: {
      continue: {
        loading: 'AI가 이어서 작성 중...',
        failedInline: '\nAI 이어쓰기에 실패했습니다. 잠시 후 다시 시도해 주세요.\n',
        requestFailed: 'AI 요청에 실패했습니다',
      },
      brainstorm: {
        dialog: {
          title: 'AI 브레인스토밍',
          placeholder: '어떤 주제로 브레인스토밍할까요?',
        },
        loading: 'AI가 아이디어를 생성 중...',
        systemPrompt: '이 주제에 대해 5~8개의 창의적인 아이디어/관점을 브레인스토밍해 주세요. 간결한 불릿으로 작성해 주세요.',
        requestFailed: 'AI 요청에 실패했습니다',
      },
      outline: {
        dialog: {
          title: 'AI 개요',
          placeholder: '주제 또는 간단한 설명을 입력하세요...',
        },
        loading: 'AI가 개요를 생성 중...',
        systemPrompt: '메인 섹션과 하위 포인트가 포함된 상세 개요를 계층 구조로 작성해 주세요.',
        requestFailed: 'AI 요청에 실패했습니다',
      },
      image: {
        loading: 'AI가 이미지를 생성 중...',
        generateFailed: '이미지 생성에 실패했습니다',
        noImageReturned: '반환된 이미지가 없습니다',
        failedInline: '\n이미지 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.\n',
      },
    },
  },
  aiAutocomplete: {
    loadingFrames: {
      one: ' AI 이어쓰기.   ',
      two: ' AI 이어쓰기..  ',
      three: ' AI 이어쓰기... ',
    },
    requestFailed: 'AI 요청에 실패했습니다',
    failedInline: '\nAI 이어쓰기에 실패했습니다. 잠시 후 다시 시도해 주세요.\n',
  },
  aiMenu: {
    input: {
      collapsedLabel: '조수에게 물어보세요...',
      placeholder: '조수에게 물어보세요...',
      generatingAria: 'AI 생성 중',
      close: '닫기',
      closeConfirmPrompt: '대화 닫기(확인 프롬프트)',
      logoAlt: 'AI',
    },
    left: {
      items: {
        editAdjust: { label: '선택 영역 편집', prompt: '선택 영역 편집', hasSubmenu: true },
        rewriteTone: { label: '톤 바꾸기', prompt: '톤 바꾸기' },
        organize: { label: '정리하기', prompt: '정리하기' },
        writeFromSelection: { label: '선택 영역에서 이어쓰기', prompt: '선택 영역에서 이어쓰기' },
      },
    },
    right: {
      items: {
        enrich: { label: '풍부하게', prompt: '풍부하게' },
        shorten: { label: '짧게', prompt: '짧게' },
        punctuation: { label: '문장부호 수정', prompt: '문장부호 수정' },
        continue: { label: '이어쓰기', prompt: '이어쓰기' },
      },
    },
    result: {
      thinking: 'AI가 생각 중...',
      generating: 'AI가 생성 중...',
      stopGenerating: '생성 중지',
      applySuggestion: '제안 적용',
      insertBelow: '아래에 삽입',
      retry: '다시 시도',
    },
    state: {
      requestFailed: 'AI 요청에 실패했습니다',
      unreadableResponse: '응답을 읽을 수 없습니다',
      processFailedLog: 'AI 처리 실패:',
    },
  },
} as const

export default tiptap
