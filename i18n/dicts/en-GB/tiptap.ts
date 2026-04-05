const tiptap = {
  editor: {
    placeholder: 'Start writing...',
    uploadingIllustration: 'Uploading illustration...',
    uploadIllustrationFailed: 'Illustration upload failed',
    unknownRole: 'Unknown role',
    aiGeneratedImageAlt: 'AI generated image',
  },
  search: {
    placeholder: 'Search...',
    previous: 'Previous (Shift+Enter)',
    next: 'Next (Enter)',
    close: 'Close (Esc)',
  },
  floatingMenu: {
    accept: 'Accept',
    reject: 'Reject',
  },
  formatToolbar: {
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    sendToSideAI: 'Send selection to the side AI panel',
    askAI: 'Ask AI',
  },
  dragHandle: {
    moveParagraph: 'Drag to move paragraph',
  },
  characterNameSuggest: {
    prefix: 'Character suggestions:',
  },
  imageGenerationDialog: {
    title: 'AI illustration',
    promptLabel: 'Prompt',
    promptPlaceholder: 'Describe the image you want...',
    ratioLabel: 'Aspect ratio',
    generating: 'Generating...',
    generate: 'Generate',
  },
  commandList: {
    empty: 'No matching commands',
    groups: {
      ai: 'Commands',
      format: 'Format',
      basic: 'Basic',
    },
  },
  slashCommand: {
    items: {
      aiContinue: {
        title: 'AI continue',
        description: 'Let AI continue writing',
      },
      aiBrainstorm: {
        title: 'AI brainstorm',
        description: 'Generate ideas and angles',
      },
      aiOutline: {
        title: 'AI outline',
        description: 'Generate an outline',
      },
      aiImage: {
        title: 'AI illustration',
        description: 'Generate an image with AI',
      },
      heading1: {
        title: 'Heading 1',
        description: 'Large heading',
      },
      heading2: {
        title: 'Heading 2',
        description: 'Medium heading',
      },
      heading3: {
        title: 'Heading 3',
        description: 'Small heading',
      },
      bulletList: {
        title: 'Bullet list',
        description: 'Create a list',
      },
      orderedList: {
        title: 'Ordered list',
        description: 'Numbered list',
      },
      blockquote: {
        title: 'Quote',
        description: 'Quote text',
      },
      codeBlock: {
        title: 'Code block',
        description: 'Insert code',
      },
      divider: {
        title: 'Divider',
        description: 'Horizontal rule',
      },
    },
    ai: {
      continue: {
        loading: 'AI is continuing...',
        failedInline: '\nAI continuation failed. Please try again later.\n',
        requestFailed: 'AI request failed',
      },
      brainstorm: {
        dialog: {
          title: 'AI brainstorm',
          placeholder: 'What topic do you want to brainstorm?',
        },
        loading: 'AI is generating ideas...',
        systemPrompt: 'Brainstorm 5-8 creative ideas or angles on this topic. Use concise bullet points.',
        requestFailed: 'AI request failed',
      },
      outline: {
        dialog: {
          title: 'AI outline',
          placeholder: 'Enter a topic or brief description...',
        },
        loading: 'AI is generating an outline...',
        systemPrompt: 'Generate a detailed outline with main sections and sub-points. Use a hierarchical structure.',
        requestFailed: 'AI request failed',
      },
      image: {
        loading: 'AI is generating an image...',
        generateFailed: 'Image generation failed',
        noImageReturned: 'No image returned',
        failedInline: '\nImage generation failed. Please try again later.\n',
      },
    },
  },
  aiAutocomplete: {
    loadingFrames: {
      one: ' AI continuing.   ',
      two: ' AI continuing..  ',
      three: ' AI continuing... ',
    },
    requestFailed: 'AI request failed',
    failedInline: '\nAI continuation failed. Please try again later.\n',
  },
  aiMenu: {
    input: {
      collapsedLabel: 'Ask the assistant...',
      placeholder: 'Ask the assistant...',
      generatingAria: 'AI generating',
      close: 'Close',
      closeConfirmPrompt: 'Close conversation (confirm prompt)',
      logoAlt: 'AI',
    },
    left: {
      items: {
        editAdjust: { label: 'Edit selection', prompt: 'Edit selection', hasSubmenu: true },
        rewriteTone: { label: 'Rewrite tone', prompt: 'Rewrite tone' },
        organize: { label: 'Organise selection', prompt: 'Organise selection' },
        writeFromSelection: { label: 'Write from selection', prompt: 'Write from selection' },
      },
    },
    right: {
      items: {
        enrich: { label: 'Enrich', prompt: 'Enrich' },
        shorten: { label: 'Shorten', prompt: 'Shorten' },
        punctuation: { label: 'Fix punctuation', prompt: 'Fix punctuation' },
        continue: { label: 'Continue', prompt: 'Continue' },
      },
    },
    result: {
      thinking: 'AI is thinking...',
      generating: 'AI is generating...',
      stopGenerating: 'Stop generating',
      applySuggestion: 'Apply suggestion',
      insertBelow: 'Insert below',
      retry: 'Retry',
    },
    state: {
      requestFailed: 'AI request failed',
      unreadableResponse: 'Unable to read response',
      processFailedLog: 'AI processing failed:',
    },
  },
} as const

export default tiptap
