const marketing = {
  hero: {
    brandName: 'Versakit Lab',
    brandLogoAlt: 'Versakit Lab logo',
    titlePart1: 'Bring writing back to',
    highlight1: 'purity',
    connector: 'and',
    highlight2: 'freedom',
    subtitle: 'Next-gen intelligent novel writing platform',
    description: 'We provide a comfortable writing space for talented creators, lower the barrier for quality content to be discovered, and offer AI assistance for newcomers to get started quickly.',
    cta: 'Start Creating',
    editorPlaceholder: 'Start your writing journey here...',
    sampleContent: `## The Rainy Season Will Not Return
I no longer know how many days it has been. I keep waking up on rainy mornings. Outside the window, as always, the sky is a sheet of dull gray—no first light of dawn, no wind, no birdsong. The small trees in the backyard stand lonely and still in the rain. No matter which window I look out from, I see only streams of rainwater running down. Other than the rain, there is no sound at all. At this hour, everything feels motionless.

![](./landing-page-3.png)I dressed carelessly, thinking of today’s exam, thinking of Pei, who had been on my mind, and my mood sank for no reason at all. I did not even have the heart to curse this season anymore. Last night the lamp in my room broke, so I used it as an excuse to go to sleep early. I did not want to touch my notes, much less those heavy original-language books. In the living room, a western film was playing on television. Lying in bed in the dark, I occasionally heard music, dialogue, and gunshots drifting in, and felt a faint, hazy happiness. At that moment, the exam no longer seemed important. It felt like something that would never happen, just as tomorrow itself would never come. I would lie forever in this darkness, and whether Pei would come looking for me the next day no longer mattered either. It was only this season disturbing us. Once we understood that, everything would be fine. Surely we had not really been separated. It was only the rain throwing our hearts into confusion.

Every morning when I wake, I like to study myself carefully. The person in the bathroom mirror is a stranger. It is always such a strange moment. My heart, just after waking, is unguarded, and so is the self in the mirror. I like to let my hand drift through the water while gazing at myself, softly calling my own name in wonder—today, the person in the mirror is not me, but a girl whose face is full of longing for Pei. I stare at myself and remember Pei’s eyes. I often cannot resist lingering in that moment until I hear my mother or my younger brother washing up in the other bathroom. Then I suddenly remember the day and order I am supposed to return to, quickly drink a cup of honey water, gather up my messy notes and books, and rush out the door.

This morning, as I was about to leave, I could not find any shoes to wear. Because I never walk properly in the rain, all of my shoes were soaked through. In the end I had no choice but to wear a pair of brown sandals. Such a small thing, yet it brought me down more than I had expected. Still, those sandals felt oddly pleasant against the wet street in the early morning. I took a tricycle to the station, while the sky remained so gray that it was impossible to tell the time of day.

Outside the carriage, everything had been quieted by the rain, drained of all visible vitality. A few little boys were setting paper boats afloat in the gutter. An old man collecting scraps stood listlessly by the sidewalk. People and vehicles streamed silently through the dim city. Looking at these scenes, I felt a sudden wave of exhaustion. What a dispiriting day this was.

When I got off and paid the fare, I dropped my notes. As I bent down into the mud to pick them up, I was suddenly overcome by weakness. The exam, Pei, the rain—it felt as though each of them had twisted me up inside.

One day, I will wake on a morning filled with sunlight. I will lie in bed and quietly listen to the birdsong outside, clear and fresh after the rain. What a peaceful and joyful kind of awakening that will be. Then when I rise in the morning and look into the mirror, I will once again see sunlight resting on my face.

I will tell myself again and again that the rainy season is over, that it will never come again. I will feel that on that morning, when I step outside, I will be wearing those clean, dry yellow sneakers, walking down a broad road full of sunlight.

And then I will say: look at this sunshine—the rainy season will never return.`,
  },
  announcement: {
    tag: 'New',
    items: [
      '🎉 All-in-one Novel Authoring Agent is live — five modes cover your full workflow from ideas to finished chapters.',
      '🤝 We invite talented creators to co-create with us — your experience shapes the product.',
      '💎 Your suggestions are invaluable. Join Narraverse and help us iterate!',
    ],
    cta: 'Take the survey',
  },
  features: {
    title: 'A quiet corner for creators',
    subtitle: 'Each feature is a small tool on your desk — gentle and unobtrusive.',
    multiFormatTitle: 'Multi-format Export',
    multiFormatDescription: 'Export beautifully formatted Markdown or Text with one click.',
  },
  aiChatDemo: {
    title: 'Real-time AI Chat',
    description: 'Talk to the Agent in the editor sidebar — continue chapters, polish prose, organize lore, or explore plot directions.',
  },
  agentShowcase: {
    title: 'All-in-one Novel Authoring Agent',
    subtitle: 'Five modes, each with a clear job — from read-only advice to chapter continuation, with persistent project memory.',
    modelLabel: 'MiniMax M2.7',
    modes: {
      agent: {
        name: 'Agent',
        tagline: 'Continue, polish, edit, and manage your project',
      },
      ask: {
        name: 'Ask',
        tagline: 'Read-only advice — never touches your manuscript',
      },
      plan: {
        name: 'Plan',
        tagline: 'Story arcs and beats saved to plan files',
      },
      outline: {
        name: 'Outline',
        tagline: 'Volume/chapter structure saved to the outline tree',
      },
      worldbook: {
        name: 'Worldbook',
        tagline: 'Lore entries kept consistent in your world bible',
      },
    },
    sidebar: {
      agent: { title: 'Chapters' },
      ask: { title: 'Chat', hint: 'Ask mode gives advice only — it will not edit chapters or write project files.' },
      plan: { title: 'Plan Files' },
      outline: { title: 'Outline Tree' },
      worldbook: { title: 'Worldbook' },
    },
    sidebarContent: {
      agent: ['Chapter 3: Unexpected Discovery', 'Chapter 2: Visitor in the Rain', 'Chapter 1: Opening Scene'],
      plan: ['plan/story-arc.md', 'plan/vol1-beats.md', 'plan/foreshadowing.md'],
      outline: ['Vol. 1: Layers of Mist', '  ├ Chapter 1: Opening Scene', '  ├ Chapter 2: Visitor in the Rain', '  └ Chapter 3: Unexpected Discovery'],
      worldbook: ['Setting: Mistport City', 'Faction: Night Watch Society', 'Rule: Never speak a true name'],
    },
    demo: {
      agent: {
        user: 'Continue this scene — keep the suspense, no spoilers for the twist ahead.',
        assistant: 'I checked the worldbook entry for Mistport City and the previous chapter ending. The detective still hasn\'t found the surveillance blind spot. I\'ll cut in with the phone ringing and stack short sentences for tension.',
        toolAction: 'Appended 320 words to Chapter 3',
        diffLabel: 'Diff preview:',
        diffHint: 'Edits appear as diffs — you approve each change before it hits the chapter.',
      },
      ask: {
        user: 'Is this dialogue too on-the-nose? Any subtler alternatives?',
        assistant: 'Keep the information, but hide the conclusion in action — let the character pause, then change the subject. That advances the plot while leaving room for the reader.',
        toolAction: '',
      },
      plan: {
        user: 'Map out Volume 1\'s story arc with turning points and foreshadowing payoffs.',
        assistant: 'Structured in three acts: Act I establishes Mistport rules and the protagonist\'s dilemma; Act II introduces the Night Watch Society; Act III links the surveillance blind spot to the true-name taboo.',
        toolAction: 'Saved to plan/story-arc.md',
      },
      outline: {
        user: 'Break Volume 2 into 8 chapters, each with a core conflict.',
        assistant: 'Created 8 chapter nodes under Volume 2, each with a one-line synopsis and conflict type (person vs. rule / person vs. self).',
        toolAction: 'Updated 8 nodes in the outline tree',
      },
      worldbook: {
        user: 'Add lore for the Night Watch Society — purpose, cost of joining, link to the true-name taboo.',
        assistant: 'Created a faction entry with public purpose (maintain order in Mistport) and hidden cost (members surrender one memory), cross-linked to the "never speak a true name" rule.',
        toolAction: 'Created worldbook entry "Night Watch Society"',
      },
    },
    highlights: {
      1: {
        title: 'You approve every edit',
        description: 'Changes arrive as diffs — accept or reject on your terms. AI as editor, not ghostwriter.',
      },
      2: {
        title: 'Memory lives in your project',
        description: 'Plans, outlines, worldbook, and chapters share one source of truth. Agent reads your lore before writing.',
      },
      3: {
        title: 'Continuation with evidence',
        description: 'Agent mode searches chapters and lore before continuing — fewer continuity breaks and character slips.',
      },
    },
  },
  albumCollage: {
    versionLabel: 'Version',
    description: 'Narraverse keeps getting better — we\'re collecting feedback to improve the product.',
    dayAlt: 'Narraverse v0.14.0 feature showcase (light)',
    nightAlt: 'Narraverse v0.14.0 feature showcase (dark)',
  },
  lightOrDay: {
    title: 'Switch day/night modes at will',
    description: 'Whether at sunny afternoons or late-night studies, enjoy a comfortable immersive writing experience.',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    demo: {
      library: 'My Novels',
      currentNovel: 'Layers of Mist',
      publish: 'Publish',
      chapterTitle: 'Chapter 3: Unexpected Discovery',
      paragraphs: [
        'Rain tapped against the window with a heavy rhythm. Detective Li Ming sat in the dim office, the cigarette in his hand burnt down to a trembling trail of ash. He stared at the photograph on the desk with a tightly furrowed brow.',
        'He muttered to himself, if he left the scene at three o’clock, why wasn’t he captured on the surveillance footage?',
        'Neon light seeped through the blinds and sliced the desk into narrow bands of brightness and shadow. The city was like a giant puzzle where everyone wore a mask and everyone carried a secret. The air held the familiar scent of old paper and damp dust, a smell that somehow steadied him.',
        'Then the telephone shattered the silence. Li Ming’s hand twitched and the ash finally dropped onto the aging stack of files. He drew a deep breath and lifted the receiver. The old black telephone crouched like a beast, ready to strike at any moment.',
        '“Hello?” His voice was hoarse and tired, as if he had just crawled out of a long nightmare.',
        'What came back was an unsettling silence, followed by a voice both familiar and strange: “You’re getting too close to the truth, Detective Li.” It was low and calm, yet cold enough to send a chill through him.',
        'He leapt to his feet, the chair scraping harshly across the wooden floor. “Who are you?” he shouted into the receiver, but only a dead tone answered him. Beep—beep—beep—the sound echoed through the empty room like a cruel mockery.',
        'Li Ming set down the phone and walked to the window. The rain had grown heavier. Pedestrians hurried through the streets like ants driven by fate. He knew the rules of the game had changed. From this moment on, he was no longer the hunter. He was the prey.',
      ],
      highlight: '“That’s impossible,”',
      lineAndColumn: 'Ln 42, Col 18',
      wordCount: '1,204 words',
    },
  },
  novelManagement: {
    title: 'Immersive Writing',
    description: 'Create, organize and edit your novels with chapter management, status tracking and publish controls.',
  },
  themeColorShowcase: {
    title: 'Theme Customization',
    description: 'Multiple carefully designed color themes to personalize your writing space.',
    colorThemes: {
      default: 'Default',
      red: 'Red',
      rose: 'Rose',
      orange: 'Orange',
      green: 'Green',
      blue: 'Blue',
      yellow: 'Yellow',
      violet: 'Violet',
    },
    chapters: 'Chapters',
    searchPlaceholder: 'Search chapters...',
    chapterThree: 'Chapter 3: Unexpected Discovery',
    chapterTwo: 'Chapter 2: Visitor in the Rain',
    chapterOne: 'Chapter 1: Opening Scene',
    editing: 'Currently editing',
    newChapter: 'New Chapter',
    preview: 'Preview',
    save: 'Save',
    drafts: 'Drafts',
    outline: 'Outline',
    notes: 'Notes',
    focusMode: 'Focus Mode',
    synced: 'Synced',
    plotTwist: 'Turning Point',
    plotTwistDescription: 'The protagonist finds a clue inside an old chest.',
    foreshadowing: 'Foreshadowing',
    foreshadowingDescription: 'The letter from chapter one gains a new meaning.',
    notesPlaceholder: 'Jot down ideas, dialogue, and worldbuilding...',
  },
  joinUs: {
    title: 'Join us — a group of high-energy people',
    cta: 'Join Us',
    techStackLabel: 'Technology stack',
    paragraphs: [
      {
        before: 'This project was built by our team from',
        highlight: '0 to 1',
        after: 'with countless design revisions, discarded ideas, and long discussions before it became what it is today.',
      },
      {
        before: 'A small team only has so much energy, so the product may still hide a few',
        highlight: 'bugs',
        after: '.',
      },
      {
        before: 'We hope you can share feedback with us in the',
        highlight: 'community group',
        after: 'so we can keep fixing, refining, and making it better.',
      },
      {
        before: 'We would also love more people to share writing methods and become',
        highlight: 'Narraverse',
        after: 'contributors.',
      },
      {
        before: 'Join us to build a powerful',
        highlight: 'novel writing platform',
        after: 'together!',
      },
    ],
  },
  contactDialog: {
    title: 'Join us',
    descriptionGroup: 'Scan to join the group chat for creators. If the QR code is invalid, switch to the admin WeChat.',
    descriptionWechat: 'If the group is full or the QR code is expired, add the admin\'s WeChat and mention \'Narraverse\' to be invited.',
    viewAdminWechat: 'Can\'t join? View admin\'s WeChat',
    backToGroup: 'Back to group QR',
    groupQrAlt: 'Narraverse group QR code',
    groupCaption: 'Scan to join the “Navernass Friends” WeChat group.',
    adminWechatAlt: 'Admin WeChat QR code',
  },
  pricing: {
    title: 'Keep writing pure, without paying for tools',
    subtitle: 'Narraverse is completely free at this stage, with all features open to every creator.',
    badge: 'Recommended',
    cta: 'Start Now',
    free: {
      name: 'Basic',
      price: 'Free',
      description: 'Perfect for beginners, meeting daily writing needs.',
      features: {
        1: 'Unlimited local drafts',
        2: 'Basic format export',
        3: 'Day/Night mode',
        4: 'Community group access',
      },
    },
    pro: {
      name: 'Pro',
      price: 'Free',
      description: 'Tailored for daily writers, unlocking creative potential.',
      features: {
        1: 'Everything in Basic',
        2: 'Five AI modes (Ask / Plan / Outline / Worldbook / Agent)',
        3: 'Cross-device cloud sync',
        4: 'Character, outline & worldbook management',
      },
    },
    team: {
      name: 'Team',
      price: 'Free',
      description: 'For studios or co-writing teams, making collaboration efficient.',
      features: {
        1: 'Everything in Pro',
        2: 'Real-time co-writing (Coming soon)',
        3: 'History version tracking',
        4: 'Priority support',
      },
    },
  },
  testimonials: {
    title: 'Hear from our creators',
    subtitle: 'These voices are our driving force and a testament to Narraverse growing with everyone.',
    reviews: [
      {
        name: 'Rainy Night',
        role: 'Mystery Author',
        content: 'This is the most focused writing tool I\'ve ever used. The UI is so clean, and the AI assistance often provides unexpected inspiration when I have writer\'s block.',
      },
      {
        name: 'Leaf in Wind',
        role: 'Full-time Writer',
        content: 'The day/night mode switch is incredibly smooth. For someone like me who often writes late into the night, the eye-care experience of dark mode is crucial.',
      },
      {
        name: 'Galaxy',
        role: 'Sci-Fi Enthusiast',
        content: 'The outline and character management features are a lifesaver. I used to lose my settings in memos, but now I can systematically build my universe.',
      },
      {
        name: 'Meow Chen',
        role: 'Literature Student',
        content: 'I love its immersive mode. Once I get into the zone, I can\'t stop. No flashy social features, just pure writing.',
      },
      {
        name: 'Old Wang',
        role: 'Veteran Author',
        content: 'I was initially resistant to AI writing, but Narraverse\'s AI acts more like an "editor" and a "sparring partner". It didn\'t ruin my style; instead, it helped me find blind spots.',
      },
    ],
  },
  auth: {
    welcomeTitle: 'Welcome to Narraverse',
    description: 'Sign in or sign up to start your creative journey',
    emailPlaceholder: 'your@email.com',
    namePlaceholder: 'Alex Chen',
  },
  navbar: {
    themeToggle: 'Toggle theme',
  },
  footer: {
    quote: 'There is nothing more painful than an untold story in your heart',
  },
  skeleton: {
    loading: 'Loading...',
  },
  seo: {
    title: 'AI Novel Authoring Agent and Web Fiction Assistant',
    description: 'Narraverse ships an all-in-one Novel Authoring Agent — five modes for Ask, Plan, Outline, Worldbook, and Agent workflows, with diff-reviewed edits and lore management from idea to draft.',
    keywords: [
      'AI novel authoring agent',
      'AI writing assistant',
      'web fiction writing tool',
      'novel continuation',
      'worldbuilding management',
    ],
    ogAlt: 'Narraverse homepage preview',
    about: [
      'AI novel writing',
      'web fiction writing',
      'creative productivity tools',
    ],
  },
  toast: {
    createSuccess: 'Created successfully',
    createFailed: 'Creation failed',
  },
} as const

export default marketing
