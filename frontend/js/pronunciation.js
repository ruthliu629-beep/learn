// Rich pronunciation guides for each language.
// Each language has sections with title/body/tips/examples.
// Examples include `word` that can be clicked to play TTS.

const PRON_GUIDES = {
  'zh-cmn': {
    zh: [
      {
        title: '🎵 四声调系统',
        body: '普通话有四个基本声调加一个轻声。同一个 ma 的读音，声调不同意思就完全不同：妈、麻、马、骂。掌握声调是普通话发音最关键的一步。',
        tips: [
          '第一声（阴平 ˉ）：保持高而平，像英语里惊喜的 "Yes!"',
          '第二声（阳平 ˊ）：由中音上升到高音，像疑问的 "What?"',
          '第三声（上声 ˇ）：先下降再上升（拖长音），像难以置信的 "Re-al-ly?"',
          '第四声（去声 ˋ）：从高音快速降到低音，像命令语气 "Stop!"',
          '轻声：音又短又轻，没有明显声调，如「妈妈」的第二个 ma',
        ],
        examples: [
          { word: 'mā', meaning: '妈 mother (1st tone)' },
          { word: 'má', meaning: '麻 hemp (2nd tone)' },
          { word: 'mǎ', meaning: '马 horse (3rd tone)' },
          { word: 'mà', meaning: '骂 scold (4th tone)' },
        ],
      },
      {
        title: '🗣 声母（Initials）的难点',
        body: '普通话有 23 个声母，其中 zh/ch/sh/r 和 j/q/x 是两组外国人最难掌握的。',
        tips: [
          'zh ch sh r（翘舌音）：舌尖向上抬贴近上颚，卷起但不触碰。zh = 不送气 + 清；ch = 送气 + 清；sh = 摩擦；r = 带声带振动',
          'j q x（舌面音）：舌面贴近硬颚前部，嘴唇自然向两边拉（不圆唇）。j = 不送气；q = 送气；x = 摩擦',
          '不要把 j/q/x 发成英语的 j/ch/sh — 嘴型完全不同',
          'z c s（平舌音）：舌尖贴下齿背，与 zh/ch/sh 要区分',
        ],
        examples: [
          { word: 'zhī shì', meaning: '知识 knowledge（翘舌）' },
          { word: 'jī qì', meaning: '机器 machine（舌面）' },
          { word: 'rén', meaning: '人 person（卷舌带声）' },
        ],
      },
      {
        title: '📐 韵母（Finals）重点',
        body: '韵母是声母后的元音部分。要特别注意 ü、-ng 和复元音。',
        tips: [
          'ü（写作 u 或 ü）：嘴型像吹口哨，前元音 i + 圆唇',
          'an / ang：an 舌尖抵上齿龈；ang 舌根抵软颚（听起来更浑厚）',
          'en / eng：同样的前后鼻音对比，要清楚区分',
          'e（单独或在 e/er/en/eng 中）：发「呃」的音，不是英语的 e',
        ],
        examples: [
          { word: 'lǚ', meaning: '旅 travel（ü 圆唇）' },
          { word: 'sān', meaning: '三 three（前鼻）' },
          { word: 'sāng', meaning: '桑 mulberry（后鼻）' },
        ],
      },
      {
        title: '🔄 变调规则',
        body: '三声和「一、不」在实际发音中会变调，这是让语言自然流畅的关键。',
        tips: [
          '两个三声相连：前一个变成第二声，如「你好 nǐ hǎo」实际读 ní hǎo',
          '「一」在四声前读二声：「一定」yí dìng',
          '「一」在一、二、三声前读四声：「一年」yì nián',
          '「不」在四声前读二声：「不对」bú duì',
        ],
        examples: [
          { word: 'nǐ hǎo', meaning: '你好（实际读 ní hǎo）' },
          { word: 'yí dìng', meaning: '一定 surely' },
        ],
      },
    ],
    en: [
      {
        title: '🎵 The Four Tones',
        body: 'Mandarin has four base tones plus a neutral tone. The syllable "ma" with different tones can mean completely different words: mother, hemp, horse, or scold.',
        tips: [
          '1st tone (ˉ): high and level — like surprised "Yes!"',
          '2nd tone (ˊ): rising from mid to high — like questioning "What?"',
          '3rd tone (ˇ): dips low then rises — like incredulous "Re-al-ly?"',
          '4th tone (ˋ): sharp falling from high to low — like commanding "Stop!"',
          'Neutral tone: short and light, no clear pitch, as in 妈妈 ma-ma',
        ],
        examples: [
          { word: 'mā', meaning: '妈 mother (1st)' },
          { word: 'má', meaning: '麻 hemp (2nd)' },
          { word: 'mǎ', meaning: '马 horse (3rd)' },
          { word: 'mà', meaning: '骂 scold (4th)' },
        ],
      },
      {
        title: '🗣 Tricky Initials',
        body: 'The 23 initial consonants include two challenging groups: zh/ch/sh/r (retroflex) and j/q/x (alveolo-palatal).',
        tips: [
          'zh ch sh r: curl the tongue tip up near the hard palate — NOT touching. zh=unaspirated; ch=aspirated; sh=fricative; r=voiced',
          'j q x: front of tongue near hard palate, lips spread (not rounded). j=unaspirated; q=aspirated; x=fricative',
          'Do NOT pronounce j/q/x like English j/ch/sh — the mouth shape is different',
          'z c s (alveolar): tongue tip behind lower teeth. Contrast with zh/ch/sh',
        ],
        examples: [
          { word: 'zhī shì', meaning: '知识 knowledge (retroflex)' },
          { word: 'jī qì', meaning: '机器 machine (alveolo-palatal)' },
          { word: 'rén', meaning: '人 person' },
        ],
      },
      {
        title: '📐 Key Finals',
        body: 'Pay special attention to ü, nasal endings, and compound vowels.',
        tips: [
          'ü: lips rounded as if whistling, tongue in "i" position',
          'an vs ang: an → tongue tip at gum ridge; ang → tongue back at soft palate',
          'en vs eng: same front/back nasal contrast',
          'e: the "uh" vowel, not English "e"',
        ],
        examples: [
          { word: 'lǚ', meaning: '旅 travel (ü rounded)' },
          { word: 'sān', meaning: '三 three (front nasal)' },
          { word: 'sāng', meaning: '桑 mulberry (back nasal)' },
        ],
      },
      {
        title: '🔄 Tone Sandhi',
        body: 'Tones shift predictably in certain contexts — essential for natural flow.',
        tips: [
          'Two 3rd tones together: first becomes 2nd tone. 你好 nǐ hǎo → ní hǎo',
          '"一" before 4th tone: read as 2nd tone (yí)',
          '"一" before 1/2/3 tones: read as 4th tone (yì)',
          '"不" before 4th tone: read as 2nd tone (bú)',
        ],
        examples: [
          { word: 'nǐ hǎo', meaning: 'hello (actually ní hǎo)' },
          { word: 'yí dìng', meaning: 'certainly' },
        ],
      },
    ],
  },

  'zh-yue': {
    zh: [
      {
        title: '🎵 六个声调',
        body: '粤语比普通话更丰富，有 6 个声调（传统说法加入声为 9 个）。音调记在拼音后的数字。',
        tips: [
          '1 阴平：高平调（如 si1 诗）',
          '2 阴上：中升调（如 si2 史）',
          '3 阴去：中平调（如 si3 试）',
          '4 阳平：低降调（如 si4 时）',
          '5 阳上：低升调（如 si5 市）',
          '6 阳去：低平调（如 si6 是）',
        ],
        examples: [
          { word: 'si1', meaning: '诗 poem (高平)' },
          { word: 'si3', meaning: '试 try (中平)' },
          { word: 'si6', meaning: '是 yes (低平)' },
        ],
      },
      {
        title: '🚪 入声韵尾（-p / -t / -k）',
        body: '粤语保留了古汉语的入声：词尾不释放的短促塞音。普通话已完全消失。',
        tips: [
          '-p：双唇紧闭不爆破，如「十 sap6」',
          '-t：舌尖抵上齿龈不释放，如「一 jat1」',
          '-k：舌根抵软颚不释放，如「六 luk6」',
          '这些韵尾声调通常较短促',
        ],
        examples: [
          { word: 'sap6', meaning: '十 ten (-p)' },
          { word: 'jat1', meaning: '一 one (-t)' },
          { word: 'luk6', meaning: '六 six (-k)' },
        ],
      },
      {
        title: '🔤 粤语独特的辅音',
        body: '有一些声母和普通话不一样，需要重新学习。',
        tips: [
          'gw / kw：合口唇音，如「国 gwok3」「快 faai3」',
          'ng- 声母：鼻音开头，如「我 ngo5」「外 ngoi6」（部分新派读 "o" 省略 ng）',
          'oe / eo：粤语特有元音，介于 ü 和 ö 之间',
          '没有翘舌音，z/c/s 代替普通话的 zh/ch/sh',
        ],
        examples: [
          { word: 'ngo5', meaning: '我 I (ng- 开头)' },
          { word: 'gwok3', meaning: '国 country (圆唇)' },
          { word: 'hoeng1', meaning: '香 fragrant (oe)' },
        ],
      },
      {
        title: '💡 与普通话对照',
        body: '熟悉普通话的学习者可以利用对应关系快速入门。',
        tips: [
          '很多普通话的 zh/ch/sh → 粤语的 z/c/s',
          '普通话 w/y 有时对应粤语的 -p/-t/-k 尾',
          '粤语用字多保留古字，如「食」(吃)、「饮」(喝)、「行」(走)',
          '语气助词丰富：啦、喎、啊、嘞、咯',
        ],
        examples: [
          { word: 'sik6 faan6', meaning: '食饭 eat (= 普「吃饭」)' },
          { word: 'haang4 gaai1', meaning: '行街 walk (= 普「逛街」)' },
        ],
      },
    ],
    en: [
      {
        title: '🎵 Six Tones',
        body: 'Cantonese is richer than Mandarin with 6 tones (traditionally 9 with stop finals). Tone numbers follow the Jyutping syllable.',
        tips: [
          '1 high level (si1 = 詩 poem)',
          '2 mid rising (si2 = 史 history)',
          '3 mid level (si3 = 試 try)',
          '4 low falling (si4 = 時 time)',
          '5 low rising (si5 = 市 market)',
          '6 low level (si6 = 是 yes)',
        ],
        examples: [
          { word: 'si1', meaning: '詩 poem (high level)' },
          { word: 'si3', meaning: '試 try (mid level)' },
          { word: 'si6', meaning: '是 yes (low level)' },
        ],
      },
      {
        title: '🚪 Stop Endings (-p / -t / -k)',
        body: 'Cantonese preserves classical Chinese stop endings — unreleased consonants that cut short the syllable.',
        tips: [
          '-p: lips clamp shut, no release (sap6 = 十 ten)',
          '-t: tongue tip at gum ridge, no release (jat1 = 一 one)',
          '-k: tongue back at soft palate, no release (luk6 = 六 six)',
          'Syllables with stop endings are usually shorter',
        ],
        examples: [
          { word: 'sap6', meaning: '十 ten' },
          { word: 'jat1', meaning: '一 one' },
          { word: 'luk6', meaning: '六 six' },
        ],
      },
      {
        title: '🔤 Unique Consonants',
        body: 'Some initials differ from Mandarin.',
        tips: [
          'gw / kw: rounded labial, as in 國 gwok3, 快 faai3',
          'ng- initial: nasal start, as in 我 ngo5 (modern speakers may drop ng-)',
          'oe / eo: special vowels between ü and ö',
          'No retroflex — z/c/s replace Mandarin zh/ch/sh',
        ],
        examples: [
          { word: 'ngo5', meaning: '我 I' },
          { word: 'gwok3', meaning: '國 country' },
          { word: 'hoeng1', meaning: '香 fragrant' },
        ],
      },
      {
        title: '💡 Compared to Mandarin',
        body: 'If you know Mandarin, these patterns help you learn faster.',
        tips: [
          'Many Mandarin zh/ch/sh → Cantonese z/c/s',
          'Cantonese uses many classical characters: 食 (eat), 飲 (drink), 行 (walk)',
          'Rich sentence-final particles: 啦, 喎, 啊, 嘞, 咯',
          'Different vocabulary for everyday words',
        ],
        examples: [
          { word: 'sik6 faan6', meaning: '食飯 eat (= M. 吃飯)' },
          { word: 'haang4 gaai1', meaning: '行街 stroll' },
        ],
      },
    ],
  },

  'zh-nan': {
    zh: [
      {
        title: '🎵 七个基本声调',
        body: '闽南语声调系统非常独特：7 个基本声调，加上复杂的变调规则。POJ 用符号标示。',
        tips: [
          '阴平 a：高平（如 ka「加」）',
          '阴上 á：高降（如 ké「改」）',
          '阴去 à：中降（如 kà「嫁」）',
          '阴入 ah：短促高（如 kah「合」）',
          '阳平 â：低升（如 kâ「咬」）',
          '阳去 ā：中平（如 kā「共」）',
          '阳入 a̍h：短促低升（如 ka̍h「逆」）',
        ],
        examples: [
          { word: 'tang', meaning: '东 east (阴平)' },
          { word: 'tâng', meaning: '铜 copper (阳平)' },
          { word: 'tāng', meaning: '当 time (阳去)' },
        ],
      },
      {
        title: '🔄 变调（Tone Sandhi）',
        body: '闽南语连读时除了最后一个字，其他字的声调都要变。这是最难但最重要的规则。',
        tips: [
          '第一声 → 第七声（高平→中平）',
          '第二声 → 第一声（高降→高平）',
          '第三声 → 第二声（中降→高降）',
          '第七声 → 第三声（中平→中降）',
          '先记单字本调，再学这张变调「轮」',
          '入声（短促音）的变调规则另算',
        ],
        examples: [
          { word: 'tē tê', meaning: '茶叶（第一字变调：tê → tē）' },
        ],
      },
      {
        title: '🔤 POJ 白话字',
        body: '白话字（教会罗马字）由 19 世纪传教士设计，是最经典的闽南语拉丁转写。',
        tips: [
          'ch / chh：不送气/送气，对应拼音 z / c',
          'kh / ph / th：送气的 k / p / t',
          'oa / oe：复元音，如「話 uā」读作 wa',
          'ng 可以单独成音节，如「黃 ng」',
          'ⁿ 上标 n 表示鼻化，如「甜 tiⁿ」',
        ],
        examples: [
          { word: 'chia̍h-pn̄g', meaning: '食饭 eat rice' },
          { word: 'tiⁿ', meaning: '甜 sweet (鼻化)' },
        ],
      },
      {
        title: '👃 鼻化元音',
        body: '闽南语有独特的鼻化元音（用 ⁿ 标示），元音通过鼻腔发出，是区别意义的关键。',
        tips: [
          '鼻化与非鼻化区别意义：三 saⁿ vs 山 soaⁿ',
          '发音时让气流同时从口腔和鼻腔流出',
          '类似法语的鼻元音，但紧跟在任何元音后',
          '拼写时常见的鼻化：iⁿ, aⁿ, eⁿ, oⁿ, aiⁿ, auⁿ',
        ],
        examples: [
          { word: 'saⁿ', meaning: '三 three (鼻化)' },
          { word: 'tiⁿ', meaning: '甜 sweet (鼻化)' },
        ],
      },
      {
        title: '🔊 语音说明',
        body: '浏览器原生 TTS 不支持闽南语，本站使用 Google 翻译的闽南语语音作为替代（需要正常访问 Google 服务）。如果播放失败，请参考白话字说明和本音表自学，或到台湾教育部「常用词典」(sutian.moe.edu.tw) 听官方音档。',
        tips: [],
        examples: [],
      },
    ],
    en: [
      {
        title: '🎵 Seven Base Tones',
        body: 'Hokkien has 7 base tones plus complex sandhi. POJ marks tones with diacritics.',
        tips: [
          'Tone 1 a: high level (ka 加)',
          'Tone 2 á: high falling',
          'Tone 3 à: mid falling',
          'Tone 4 ah: short high (stop)',
          'Tone 5 â: low rising',
          'Tone 7 ā: mid level',
          'Tone 8 a̍h: short low rising (stop)',
        ],
        examples: [
          { word: 'tang', meaning: '東 east (T1)' },
          { word: 'tâng', meaning: '銅 copper (T5)' },
          { word: 'tāng', meaning: '當 time (T7)' },
        ],
      },
      {
        title: '🔄 Tone Sandhi',
        body: 'When syllables are read together, every non-final syllable shifts tone. This is the hardest but most crucial rule.',
        tips: [
          'T1 → T7 (high → mid level)',
          'T2 → T1 (high falling → high level)',
          'T3 → T2 (mid falling → high falling)',
          'T7 → T3 (mid → mid falling)',
          'Learn base tones first, then memorize the sandhi "wheel"',
          'Stops (T4 / T8) follow their own sandhi pattern',
        ],
        examples: [
          { word: 'tê', meaning: '茶 tea (base form)' },
        ],
      },
      {
        title: '🔤 Reading POJ',
        body: 'Pe̍h-ōe-jī was designed by 19th-century missionaries — the classic Hokkien romanization.',
        tips: [
          'ch / chh: unaspirated/aspirated (≈ Pinyin z / c)',
          'kh / ph / th: aspirated k / p / t',
          'oa / oe: diphthongs, e.g., 話 uā → "wa"',
          'ng can stand alone (黃 ng)',
          'Superscript ⁿ marks nasalized vowels',
        ],
        examples: [
          { word: 'chia̍h-pn̄g', meaning: '食飯 eat rice' },
          { word: 'tiⁿ', meaning: '甜 sweet (nasalized)' },
        ],
      },
      {
        title: '👃 Nasalized Vowels',
        body: 'Hokkien has distinctive nasalized vowels (marked ⁿ) — airflow goes through the nose AND mouth simultaneously.',
        tips: [
          'Nasalization distinguishes meaning: 三 saⁿ vs 山 soaⁿ',
          'Similar to French nasal vowels but appears after any vowel',
          'Common nasalized syllables: iⁿ, aⁿ, eⁿ, oⁿ, aiⁿ, auⁿ',
        ],
        examples: [
          { word: 'saⁿ', meaning: '三 three (nasalized)' },
          { word: 'tiⁿ', meaning: '甜 sweet (nasalized)' },
        ],
      },
      {
        title: '🔊 Audio Note',
        body: 'Browser native TTS does not support Hokkien. This site uses Google Translate\'s Min Nan voice as a fallback (requires Google services access). If playback fails, refer to the POJ description and tone chart above, or listen to official audio at Taiwan MOE\'s dictionary (sutian.moe.edu.tw).',
        tips: [],
        examples: [],
      },
    ],
  },

  'en': {
    zh: [
      {
        title: '📐 元音体系：IPA 基础',
        body: '英语元音比中文多得多 — 约 20 个元音对比中文约 10 个。最难的是短长元音和松紧对立。',
        tips: [
          '/iː/ vs /ɪ/：sheep vs ship。长的紧元音 vs 短的松元音',
          '/uː/ vs /ʊ/：food vs foot',
          '/æ/ vs /ʌ/ vs /ɑː/：cat, cut, cart — 口型从大到小',
          '/ɜːr/：bird — 像中文「儿」加重',
          '双元音：/eɪ/ day, /aɪ/ my, /ɔɪ/ boy, /aʊ/ now, /oʊ/ go',
        ],
        examples: [
          { word: 'sheep', meaning: '羊 (长元音 /iː/)' },
          { word: 'ship', meaning: '船 (短元音 /ɪ/)' },
          { word: 'food', meaning: '食物 (/uː/)' },
          { word: 'foot', meaning: '脚 (/ʊ/)' },
        ],
      },
      {
        title: '🔴 中国人最难的 /θ/ 和 /ð/',
        body: '"th" 音是中文完全没有的 — 很多学习者会错误地读成 s/z/f。',
        tips: [
          '/θ/（清）：舌尖轻咬在上下齿之间，气流摩擦送出，声带不振（think, three, bath）',
          '/ð/（浊）：舌位相同，但声带振动（this, that, mother）',
          '练习技巧：先把舌尖露在齿外一点，再慢慢送气',
          '常见错误：把 three 读成 free 或 sree — 要确保舌头伸出',
        ],
        examples: [
          { word: 'think', meaning: '想 (/θ/ 清)' },
          { word: 'this', meaning: '这 (/ð/ 浊)' },
          { word: 'three', meaning: '三 (/θ/ + /r/)' },
        ],
      },
      {
        title: '🔀 /l/ 和 /r/ 的区别',
        body: '中文里 L 和 R 不作区分，但在英语中是两个完全不同的音素。',
        tips: [
          '/l/：舌尖紧贴上齿龈（齿后），气流从舌两侧出来',
          '/r/（美式）：舌尖卷起接近（不接触）上颚，嘴唇略圆',
          '/r/（英式）：接近美式但更轻，词尾常不发音',
          '练习：light / right、lock / rock、play / pray',
        ],
        examples: [
          { word: 'light', meaning: '光 (/l/)' },
          { word: 'right', meaning: '对 (/r/)' },
          { word: 'long', meaning: '长 (/l/)' },
          { word: 'wrong', meaning: '错 (/r/)' },
        ],
      },
      {
        title: '💪 词重音（Word Stress）',
        body: '英语是重音节拍语言 — 重音位置错会让人完全听不懂，甚至改变词义。',
        tips: [
          '双音节名词通常重音在第一音节：TA-ble, WA-ter',
          '双音节动词通常重音在第二音节：re-CORD, ob-JECT',
          '重音音节要读得更响、更长、更清晰，非重音音节元音常弱化为 /ə/（schwa）',
          'PRE-sent（名词：礼物）vs pre-SENT（动词：呈现）— 词义完全不同',
        ],
        examples: [
          { word: 'present', meaning: '重音不同 → 不同意思' },
          { word: 'photograph', meaning: 'PHO-to-graph' },
          { word: 'photography', meaning: 'pho-TO-gra-phy' },
        ],
      },
      {
        title: '🗣 连读和弱读',
        body: '自然英语口语中，词和词之间有连读和弱化，像流水一样。',
        tips: [
          '辅音 + 元音：前词尾辅音与后词首元音连读，如 "an apple" → "a-napple"',
          '相同辅音：省略一个，如 "good dog" → "goo-dog"',
          '虚词弱化：a/an/the/of/to/for/and 等常读作弱形式',
          '缩略形式：I am → I\'m, do not → don\'t',
        ],
        examples: [
          { word: 'pick it up', meaning: '连读为 "pi-ki-tup"' },
          { word: "I don't know", meaning: '常读 "I dunno"' },
        ],
      },
    ],
    en: [
      {
        title: '📐 IPA Vowel System',
        body: 'English has ~20 vowels vs Chinese\'s ~10. The hardest distinctions are long/short and tense/lax pairs.',
        tips: [
          '/iː/ vs /ɪ/: sheep vs ship (long tense vs short lax)',
          '/uː/ vs /ʊ/: food vs foot',
          '/æ/ vs /ʌ/ vs /ɑː/: cat, cut, cart — mouth opens progressively',
          '/ɜːr/: bird — like a heavy schwa with r-color',
          'Diphthongs: /eɪ/ day, /aɪ/ my, /ɔɪ/ boy, /aʊ/ now, /oʊ/ go',
        ],
        examples: [
          { word: 'sheep', meaning: '(long /iː/)' },
          { word: 'ship', meaning: '(short /ɪ/)' },
        ],
      },
      {
        title: '🔴 The /θ/ and /ð/ Sounds',
        body: 'The "th" sounds don\'t exist in Chinese — learners often substitute s/z/f.',
        tips: [
          '/θ/ (voiceless): tongue tip between teeth, breath flows (think, three)',
          '/ð/ (voiced): same position, vocal cords vibrate (this, that)',
          'Practice: stick tongue out slightly, then exhale',
          'Common error: "three" → "free" or "sree" — push tongue forward',
        ],
        examples: [
          { word: 'think', meaning: '(/θ/)' },
          { word: 'this', meaning: '(/ð/)' },
        ],
      },
      {
        title: '🔀 /l/ vs /r/',
        body: 'Chinese doesn\'t distinguish /l/ and /r/, but they\'re distinct phonemes in English.',
        tips: [
          '/l/: tongue tip firmly on gum ridge, air flows around the sides',
          '/r/ (American): tongue curled up near (not touching) palate, lips slightly rounded',
          '/r/ (British): similar, lighter, often silent at word-end',
          'Minimal pairs: light/right, lock/rock, play/pray',
        ],
        examples: [
          { word: 'light', meaning: '(/l/)' },
          { word: 'right', meaning: '(/r/)' },
        ],
      },
      {
        title: '💪 Word Stress',
        body: 'English is stress-timed — wrong stress can make a word unintelligible or change its meaning.',
        tips: [
          '2-syllable nouns usually stress syllable 1: TAble, WAter',
          '2-syllable verbs usually stress syllable 2: reCORD, obJECT',
          'Stressed syllables are louder, longer, clearer; unstressed often reduce to schwa /ə/',
          'PREsent (noun: gift) vs preSENT (verb: to give) — totally different',
        ],
        examples: [
          { word: 'present', meaning: 'stress changes meaning' },
          { word: 'photograph', meaning: 'PHO-to-graph' },
          { word: 'photography', meaning: 'pho-TO-gra-phy' },
        ],
      },
      {
        title: '🗣 Linking and Reduction',
        body: 'Natural English speech flows with linking and reduced forms.',
        tips: [
          'Consonant + vowel: link across words ("an apple" → "a-napple")',
          'Double consonants: drop one ("good dog" → "goo-dog")',
          'Function words reduce: a/an/the/of/to/for usually weak',
          'Contractions: I am → I\'m, do not → don\'t',
        ],
        examples: [
          { word: 'pick it up', meaning: '→ "pi-ki-tup"' },
          { word: "I don't know", meaning: '→ "I dunno"' },
        ],
      },
    ],
  },

  'ja': {
    zh: [
      {
        title: '🗾 假名发音',
        body: '日语发音相对规律 — 5 个基本元音 (a i u e o) 与辅音组合。每个假名对应固定读音。',
        tips: [
          'a：/a/，开口清晰的「啊」',
          'i：/i/，像英语 "ee" 但短促',
          'u：/ɯ/，嘴唇不圆，介于 u 和 ü 之间',
          'e：/e/，像中文「诶」',
          'o：/o/，像中文「哦」但嘴更圆',
          '辅音：k, s, t, n, h, m, y, r, w + 浊音 g, z, d, b, p',
        ],
        examples: [
          { word: 'あいうえお', meaning: 'a i u e o（五元音）' },
          { word: 'さくら', meaning: '樱花 sakura' },
        ],
      },
      {
        title: '🎵 音调 (Pitch Accent)',
        body: '日语不是声调语言而是音高语言 — 词内的音高起伏能区分意思。',
        tips: [
          '每个词有固定的音高模式（平板型、头高型、中高型、尾高型）',
          '最著名的例子：はし hashi — 筷子 (HL) vs 桥 (LH) vs 端 (LH但后续助词不降)',
          '东京方言是标准音',
          '初学者可以先不纠结，发音时先保持平稳',
        ],
        examples: [
          { word: 'はし (箸)', meaning: '筷子 HL（头高）' },
          { word: 'はし (橋)', meaning: '桥 LH（尾高）' },
        ],
      },
      {
        title: '⏸ 长音和促音',
        body: '日语中元音的长短和停顿都会改变意思。',
        tips: [
          '长音：元音拖长一拍。平假名用「ー」「う」「い」等，罗马字可写 aa、ii、uu、ou',
          'おばさん (obasan) = 阿姨，おばあさん (obaasan) = 祖母',
          '促音「っ」：停顿一拍，下一个辅音加倍',
          'きて (kite) = 来；きって (kitte) = 邮票',
        ],
        examples: [
          { word: 'おばあさん', meaning: '祖母（长音）' },
          { word: 'きって', meaning: '邮票（促音）' },
        ],
      },
      {
        title: '🔊 特别注意的音',
        body: '某些日语音对中文学习者容易出错。',
        tips: [
          'つ (tsu)：不是中文的「自」也不是「斯」，舌尖快速弹离上齿龈',
          'ふ (fu)：双唇接近但不接触（不像英语 f 用上齿咬下唇）',
          'ら行 (ra ri ru re ro)：介于中文的 l 和 r 之间，实为舌尖弹音',
          '拨音「ん」：在不同位置发音不同，但音节长度保持一拍',
        ],
        examples: [
          { word: 'つき', meaning: '月 moon (tsu)' },
          { word: 'ふじ', meaning: '富士 Fuji (fu)' },
          { word: 'さくら', meaning: '樱花 (ra 发弹音)' },
        ],
      },
    ],
    en: [
      {
        title: '🗾 Kana Sounds',
        body: 'Japanese is relatively regular — 5 vowels (a i u e o) combined with consonants. Each kana has a fixed pronunciation.',
        tips: [
          'a: /a/ open "ah"',
          'i: /i/ like "ee" but short',
          'u: /ɯ/ lips unrounded, between u and ü',
          'e: /e/ like "eh"',
          'o: /o/ like "oh" with rounded lips',
          'Consonants: k, s, t, n, h, m, y, r, w + voiced g, z, d, b, p',
        ],
        examples: [
          { word: 'あいうえお', meaning: 'a i u e o' },
          { word: 'さくら', meaning: 'sakura' },
        ],
      },
      {
        title: '🎵 Pitch Accent',
        body: 'Japanese is not tonal but uses pitch — rises and falls within words distinguish meaning.',
        tips: [
          'Each word has a fixed pitch pattern (flat, head-high, middle-high, tail-high)',
          'Classic example: はし hashi — chopsticks (HL) vs bridge (LH, visible in following particle)',
          'Tokyo dialect is the standard',
          'Beginners: don\'t stress it; keep speech even',
        ],
        examples: [
          { word: 'はし (箸)', meaning: 'chopsticks HL' },
          { word: 'はし (橋)', meaning: 'bridge LH' },
        ],
      },
      {
        title: '⏸ Long Vowels and Geminates',
        body: 'Vowel length and pauses change meaning in Japanese.',
        tips: [
          'Long vowels: held for 2 mora (aa, ii, uu, ou)',
          'おばさん (obasan) = aunt, おばあさん (obaasan) = grandmother',
          'っ (small tsu): 1-mora pause, doubling next consonant',
          'きて (kite) = come; きって (kitte) = stamp',
        ],
        examples: [
          { word: 'おばあさん', meaning: 'grandma (long)' },
          { word: 'きって', meaning: 'stamp (geminate)' },
        ],
      },
      {
        title: '🔊 Tricky Sounds',
        body: 'Some sounds Chinese/English speakers often get wrong.',
        tips: [
          'つ (tsu): not Chinese "zi" or English "su" — tongue taps gum ridge quickly',
          'ふ (fu): lips close but don\'t touch teeth (not like English "f")',
          'ら行 (ra ri ru re ro): between L and R — a tongue flap',
          'ん (n): varies by position but stays 1 mora long',
        ],
        examples: [
          { word: 'つき', meaning: 'moon (tsu)' },
          { word: 'ふじ', meaning: 'Fuji (fu)' },
          { word: 'さくら', meaning: 'sakura (flap r)' },
        ],
      },
    ],
  },

  'ko': {
    zh: [
      {
        title: '🔤 谚文拼读',
        body: '韩文是音节块状拼音文字 — 14 个基本辅音 + 10 个基本元音，按音节拼成方块。读起来像拼图。',
        tips: [
          '每个音节块有：初声（辅音）+ 中声（元音）+ 可选终声（辅音）',
          '初声在左/上，中声在右/下，终声（batchim）在下',
          '14 基本辅音：ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ',
          '10 基本元音：ㅏ ㅑ ㅓ ㅕ ㅗ ㅛ ㅜ ㅠ ㅡ ㅣ',
        ],
        examples: [
          { word: '한글', meaning: 'han-geul 韩文' },
          { word: '한국', meaning: 'han-guk 韩国' },
        ],
      },
      {
        title: '🎭 三套辅音：平音／紧音／送气',
        body: '韩语最独特的特点：辅音分三组对立，而非中文的清浊对立。',
        tips: [
          '平音 ㄱ ㄷ ㅂ ㅈ ㅅ：放松，气流温和',
          '紧音 ㄲ ㄸ ㅃ ㅉ ㅆ：喉咙绷紧，声音短促有力',
          '送气 ㅋ ㅌ ㅍ ㅊ：强烈送气，带气流声',
          '例：가 (ga) / 까 (kka) / 카 (ka) — 三种不同的 k/g 音',
        ],
        examples: [
          { word: '가다', meaning: 'gada 去 (平音)' },
          { word: '까다', meaning: 'kkada 剥 (紧音)' },
          { word: '카드', meaning: 'kadeu 卡 (送气)' },
        ],
      },
      {
        title: '🔻 终声（Batchim）',
        body: '音节最后的辅音叫「batchim」（받침），是韩语最复杂的部分之一。',
        tips: [
          '7 种终声发音：ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅇ（其他辅音会归到这 7 种之一）',
          '终声通常「不释放」— 舌位到位但不放开',
          '与下一音节相连时会「连音化」：곧이 (god-i) 读作 고디 (go-di)',
          'ㅎ + 平音 = 送气音：놓다 (noh-da) → 노타 (no-ta)',
        ],
        examples: [
          { word: '밥', meaning: 'bap 饭 (终声 ㅂ)' },
          { word: '감사', meaning: 'gam-sa 感谢 (ㅁ 终声)' },
          { word: '책을', meaning: 'chae-geul 书 (连音化)' },
        ],
      },
      {
        title: '👀 容易混淆的元音',
        body: '有几对元音听起来很像，但实际不同 — 注意嘴型。',
        tips: [
          'ㅐ /ɛ/ vs ㅔ /e/：现代口语几乎相同，都读「欸」',
          'ㅗ /o/ vs ㅓ /ʌ/：ㅗ 圆唇更前，ㅓ 展唇更后',
          'ㅜ /u/ vs ㅡ /ɯ/：ㅜ 圆唇，ㅡ 展唇',
          'ㅚ /ø/ ≈ ㅞ /we/ ≈ ㅙ /wɛ/：现代几乎同音，都读「we」',
        ],
        examples: [
          { word: '개', meaning: 'gae 狗 (ㅐ)' },
          { word: '게', meaning: 'ge 蟹 (ㅔ)' },
          { word: '고', meaning: 'go (ㅗ)' },
          { word: '거', meaning: 'geo (ㅓ)' },
        ],
      },
    ],
    en: [
      {
        title: '🔤 Hangul Blocks',
        body: 'Hangul is syllable-block script — 14 basic consonants + 10 vowels combined into square blocks.',
        tips: [
          'Each block: initial (consonant) + medial (vowel) + optional final (consonant)',
          'Initial left/top, medial right/bottom, final (batchim) at bottom',
          '14 basic consonants: ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ',
          '10 basic vowels: ㅏ ㅑ ㅓ ㅕ ㅗ ㅛ ㅜ ㅠ ㅡ ㅣ',
        ],
        examples: [
          { word: '한글', meaning: 'han-geul Hangul' },
          { word: '한국', meaning: 'han-guk Korea' },
        ],
      },
      {
        title: '🎭 Three-Way Consonants',
        body: 'Korean\'s most distinctive feature: consonants come in three series, not Chinese\'s voiced/voiceless pair.',
        tips: [
          'Plain ㄱ ㄷ ㅂ ㅈ ㅅ: relaxed, mild air',
          'Tense ㄲ ㄸ ㅃ ㅉ ㅆ: tight throat, short and forceful',
          'Aspirated ㅋ ㅌ ㅍ ㅊ: strong puff of air',
          'E.g.: 가 ga / 까 kka / 카 ka — three distinct k/g sounds',
        ],
        examples: [
          { word: '가다', meaning: 'gada (plain)' },
          { word: '까다', meaning: 'kkada (tense)' },
          { word: '카드', meaning: 'kadeu (aspirated)' },
        ],
      },
      {
        title: '🔻 Batchim (Final Consonant)',
        body: 'The final consonant of a syllable — one of Korean\'s trickiest features.',
        tips: [
          '7 final sounds: ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅇ (others reduce to these)',
          'Finals are usually unreleased — position reached but not released',
          'Liaison: final consonant links to next syllable\'s vowel',
          'ㅎ + plain = aspirated: 놓다 (noh-da) → 노타 (no-ta)',
        ],
        examples: [
          { word: '밥', meaning: 'bap (ㅂ final)' },
          { word: '책을', meaning: 'chae-geul (liaison)' },
        ],
      },
      {
        title: '👀 Similar Vowels',
        body: 'Several vowel pairs sound similar but differ — watch the mouth shape.',
        tips: [
          'ㅐ /ɛ/ vs ㅔ /e/: nearly identical in modern speech',
          'ㅗ /o/ vs ㅓ /ʌ/: ㅗ rounded and fronter; ㅓ unrounded and backer',
          'ㅜ /u/ vs ㅡ /ɯ/: ㅜ rounded; ㅡ unrounded',
          'ㅚ ≈ ㅞ ≈ ㅙ: almost the same "we" sound in modern speech',
        ],
        examples: [
          { word: '개', meaning: 'gae dog (ㅐ)' },
          { word: '게', meaning: 'ge crab (ㅔ)' },
        ],
      },
    ],
  },

  'fr': {
    zh: [
      {
        title: '👃 鼻元音（4 个）',
        body: '法语最具标志性的特征 — 4 个鼻元音，发音时气流同时从嘴和鼻子出来。',
        tips: [
          '/ɑ̃/ 写作 an/am/en/em：舌头在后，开口，如 "enfant" 孩子',
          '/ɔ̃/ 写作 on/om：圆唇，如 "bon" 好',
          '/ɛ̃/ 写作 in/im/ain/ein：前元音 + 鼻化，如 "vin" 葡萄酒',
          '/œ̃/ 写作 un/um：与 /ɛ̃/ 类似但圆唇（现代多数人混同）',
        ],
        examples: [
          { word: 'bonjour', meaning: '你好（/ɔ̃/）' },
          { word: 'vin', meaning: '酒（/ɛ̃/）' },
          { word: 'enfant', meaning: '孩子（/ɑ̃/）' },
        ],
      },
      {
        title: '🤫 大量静音字母',
        body: '法语单词中有很多字母不发音，初学者最头疼的问题之一。',
        tips: [
          '词尾辅音常不发音：petit 读 /pə.ti/ 而非 /pə.tit/',
          '但词尾辅音在连读（liaison）中会发音',
          '常见发音字母：c, r, f, l（记忆 "CaReFuL"）',
          'h 永远不发音（h 哑音和 h 嘘音的区别在于是否允许联诵）',
          '-es / -ent 词尾动词变位常不发音',
        ],
        examples: [
          { word: 'petit', meaning: '小的（词尾 t 不发音）' },
          { word: 'parlent', meaning: '说（词尾 ent 不发音）' },
        ],
      },
      {
        title: '🔗 联诵（Liaison）',
        body: '词尾静音辅音遇到后词元音开头时，会连起来发音，是法语流畅感的来源。',
        tips: [
          '必做联诵：冠词 + 名词，代词 + 动词，如 "les amis" → /le.z‿a.mi/',
          '禁做联诵：在 et（和）之后，在 h 嘘音前',
          '-s / -x 在联诵中读 /z/',
          '-t / -d 在联诵中读 /t/',
          '-n 在联诵中鼻化元音去鼻',
        ],
        examples: [
          { word: 'les amis', meaning: '朋友们 /le z‿a.mi/' },
          { word: 'un homme', meaning: '一个男人 /œ̃ n‿ɔm/' },
        ],
      },
      {
        title: '🌪 小舌颤音 R',
        body: '法语的 R /ʁ/ 是小舌音 — 与中文的 R 完全不同。',
        tips: [
          '发音位置在喉咙后部，小舌振动（或软颚摩擦）',
          '像漱口时的音或类似「哈」里的擦音',
          '练习：先发中文「哈」，然后收紧喉咙让气流摩擦',
          '不要卷舌！不要像英语或中文的 r',
        ],
        examples: [
          { word: 'Paris', meaning: '巴黎（/ʁ/）' },
          { word: 'rouge', meaning: '红色' },
          { word: 'merci', meaning: '谢谢' },
        ],
      },
    ],
    en: [
      {
        title: '👃 Nasal Vowels (4)',
        body: 'The most distinctive French feature — 4 nasalized vowels with airflow through mouth AND nose.',
        tips: [
          '/ɑ̃/ spelled an/am/en/em: back, open, as in "enfant" (child)',
          '/ɔ̃/ spelled on/om: rounded, as in "bon" (good)',
          '/ɛ̃/ spelled in/im/ain/ein: front + nasal, as in "vin" (wine)',
          '/œ̃/ spelled un/um: like /ɛ̃/ but rounded (modern speakers merge them)',
        ],
        examples: [
          { word: 'bonjour', meaning: 'hello (/ɔ̃/)' },
          { word: 'vin', meaning: 'wine (/ɛ̃/)' },
        ],
      },
      {
        title: '🤫 Silent Letters',
        body: 'Many letters go silent — a beginner\'s nightmare.',
        tips: [
          'Word-final consonants often silent: petit → /pə.ti/',
          'Except via liaison (see below)',
          'Usually pronounced final consonants: c, r, f, l ("CaReFuL")',
          'h is always silent; distinction between "h mute" and "h aspirate" only matters for liaison',
          '-es / -ent verb endings usually silent',
        ],
        examples: [
          { word: 'petit', meaning: 'small (final t silent)' },
          { word: 'parlent', meaning: 'they speak (ent silent)' },
        ],
      },
      {
        title: '🔗 Liaison',
        body: 'A normally silent final consonant links to the next vowel — source of French\'s flow.',
        tips: [
          'Required: article + noun, pronoun + verb. "les amis" → /le.z‿a.mi/',
          'Forbidden: after "et", before "h aspiré"',
          '-s / -x link as /z/',
          '-t / -d link as /t/',
          '-n de-nasalizes the vowel in liaison',
        ],
        examples: [
          { word: 'les amis', meaning: 'friends /le z‿a.mi/' },
          { word: 'un homme', meaning: 'a man /œ̃ n‿ɔm/' },
        ],
      },
      {
        title: '🌪 Uvular R',
        body: 'French R /ʁ/ is uvular — completely different from Chinese or English R.',
        tips: [
          'Pronounced at the back of throat with uvular trill (or velar fricative)',
          'Like the sound in gargling or the German "ach" with vibration',
          'Practice: start with Chinese "ha", tighten throat, let air rasp',
          'Do NOT curl your tongue!',
        ],
        examples: [
          { word: 'Paris', meaning: 'Paris (/ʁ/)' },
          { word: 'rouge', meaning: 'red' },
          { word: 'merci', meaning: 'thanks' },
        ],
      },
    ],
  },

  'es': {
    zh: [
      {
        title: '📐 5 个纯元音',
        body: '西班牙语发音最棒的特点：只有 5 个元音，每个元音永远只读一种音！',
        tips: [
          'a /a/：永远读「啊」，不像英语随词变',
          'e /e/：永远读「欸」',
          'i /i/：永远读「衣」',
          'o /o/：永远读「哦」（圆唇但不滑动）',
          'u /u/：永远读「乌」',
          '元音短促、清晰、不变调 — 这让西语像音乐一样规律',
        ],
        examples: [
          { word: 'casa', meaning: '房子 ka-sa' },
          { word: 'hola', meaning: '你好 o-la（h 不发音）' },
        ],
      },
      {
        title: '🌪 R 和 RR 的区别',
        body: '西语有两种 R — 单 R 和双 R 意思能完全不同。',
        tips: [
          '单 r（在词中）：舌尖轻弹上齿龈一次（闪音），类似英语 "water" 中的 t 音',
          '双 rr 或词首 r：多次颤动，需要反复练习的舌尖颤音',
          '最有名的对比：pero /ˈpe.ɾo/（但是）vs perro /ˈpe.ro/（狗）',
          '学不会 rr 的人可以先用单 r 代替，当地人能听懂',
        ],
        examples: [
          { word: 'pero', meaning: '但是（单 r 闪音）' },
          { word: 'perro', meaning: '狗（双 r 颤音）' },
          { word: 'rojo', meaning: '红色（词首颤音）' },
        ],
      },
      {
        title: '🔤 B 和 V 同音',
        body: '西语中 b 和 v 发音完全相同 — 都读 /b/（词首）或 /β/（词中）。',
        tips: [
          'b/v 词首：/b/，像中文「不」的 b',
          'b/v 词中：/β/，双唇接近但不接触，类似 b 但更轻',
          '西班牙人写字时也要说 "be grande" (B)、"ve chica" (V)',
          'vaca（奶牛）和 baca（行李架）发音相同',
        ],
        examples: [
          { word: 'vaca', meaning: '奶牛 BA-ka' },
          { word: 'Barcelona', meaning: '巴塞罗那' },
        ],
      },
      {
        title: '💪 重音规则',
        body: '西语重音位置非常规律，只要三条规则。',
        tips: [
          '以 元音 / n / s 结尾的词：重音在倒数第二音节（如 casa CA-sa）',
          '以其他辅音结尾的词：重音在最后一音节（如 hospital hos-pi-TAL）',
          '有重音符号 ´ 的词：按符号指示（café ca-FÉ）',
          'ñ 读作 /ɲ/，像 ni-yo 连读',
        ],
        examples: [
          { word: 'casa', meaning: 'CA-sa 房子' },
          { word: 'hospital', meaning: 'hos-pi-TAL 医院' },
          { word: 'café', meaning: 'ca-FÉ 咖啡' },
          { word: 'niño', meaning: 'NI-ño 男孩' },
        ],
      },
    ],
    en: [
      {
        title: '📐 Five Pure Vowels',
        body: 'The best Spanish pronunciation feature: only 5 vowels, each always pronounced the same way!',
        tips: [
          'a /a/: always "ah"',
          'e /e/: always "eh"',
          'i /i/: always "ee"',
          'o /o/: always "oh" (rounded, no glide)',
          'u /u/: always "oo"',
          'Short, clean, never reduced — gives Spanish its rhythmic quality',
        ],
        examples: [
          { word: 'casa', meaning: 'house ka-sa' },
          { word: 'hola', meaning: 'hello o-la (h silent)' },
        ],
      },
      {
        title: '🌪 R vs RR',
        body: 'Two distinct R sounds that can completely change meaning.',
        tips: [
          'Single r (in middle): single flap, like the t in American English "water"',
          'Double rr or word-initial r: trilled (multiple flaps) — needs practice',
          'Famous pair: pero (but) vs perro (dog)',
          'If you can\'t trill, just use a single r — you\'ll be understood',
        ],
        examples: [
          { word: 'pero', meaning: 'but (flap)' },
          { word: 'perro', meaning: 'dog (trill)' },
          { word: 'rojo', meaning: 'red (trill)' },
        ],
      },
      {
        title: '🔤 B and V Sound the Same',
        body: 'In Spanish, b and v are pronounced identically — both /b/ (initial) or /β/ (medial).',
        tips: [
          'Initial b/v: /b/ like English b',
          'Medial b/v: /β/ lips close but don\'t touch, softer',
          'Even Spaniards say "be grande" (B) vs "ve chica" (V) to distinguish in writing',
          'vaca (cow) and baca (roof rack) sound identical',
        ],
        examples: [
          { word: 'vaca', meaning: 'cow BA-ka' },
          { word: 'Barcelona', meaning: 'Barcelona' },
        ],
      },
      {
        title: '💪 Stress Rules',
        body: 'Spanish stress is very predictable — just three rules.',
        tips: [
          'Ends in vowel/n/s: stress on 2nd-to-last syllable (casa CA-sa)',
          'Ends in other consonant: stress on last syllable (hospital hos-pi-TAL)',
          'Has a written accent: follow the accent (café ca-FÉ)',
          'ñ is /ɲ/, like the ny in "canyon"',
        ],
        examples: [
          { word: 'casa', meaning: 'CA-sa house' },
          { word: 'hospital', meaning: 'hos-pi-TAL' },
          { word: 'café', meaning: 'ca-FÉ' },
          { word: 'niño', meaning: 'NI-ño boy' },
        ],
      },
    ],
  },

  'de': {
    zh: [
      {
        title: '🎶 变音字母 Ä Ö Ü',
        body: '德语三个变音字母是发音最独特的部分，对应 ae, oe, ue — 需要学会圆唇和展唇切换。',
        tips: [
          'ä /ɛ/：像英语 "bed" 的 e，比普通 e 开口更大',
          'ö /ø/：嘴型做 o，舌位做 e — 先圆唇再发 e',
          'ü /y/：嘴型做 u（圆唇），舌位做 i — 最难的音',
          '练习 ü：先发「衣」再保持舌不动慢慢圆唇',
        ],
        examples: [
          { word: 'Mädchen', meaning: '女孩 (ä)' },
          { word: 'schön', meaning: '漂亮 (ö)' },
          { word: 'Tür', meaning: '门 (ü)' },
        ],
      },
      {
        title: '📀 两种 CH 发音',
        body: '字母组合 ch 根据前面元音不同，有两种完全不同的发音。',
        tips: [
          '前元音后（i, e, ä, ö, ü, ei）：/ç/，像气流通过牙齿发 "hy"，如 "ich" 我',
          '后元音后（a, o, u, au）：/x/，像漱口或清理喉咙，如 "Bach" 小溪',
          'chs 一般读作 /ks/：如 "sechs" 六',
          '词首 ch 通常读 /ç/ 或 /k/：如 "China" 中国',
        ],
        examples: [
          { word: 'ich', meaning: '我 (/ç/)' },
          { word: 'Bach', meaning: '巴赫 (/x/)' },
          { word: 'sechs', meaning: '六 (/ks/)' },
        ],
      },
      {
        title: '🌪 R 的小舌音和尾音',
        body: '德语的 R 有多种发音方式，小舌颤音或摩擦是标准。',
        tips: [
          '音节前 R：/ʁ/ 小舌摩擦（类似法语 R）',
          '元音后 R：常弱化成 /ɐ/（像弱元音 a）',
          'Mutter 的 -er 读作 /ɐ/',
          '南德（奥地利、巴伐利亚）有人用卷舌 /r/',
        ],
        examples: [
          { word: 'rot', meaning: '红色（小舌）' },
          { word: 'Mutter', meaning: '妈妈（尾 -er /ɐ/）' },
          { word: 'Bier', meaning: '啤酒（尾 r /ɐ/）' },
        ],
      },
      {
        title: '🔇 清化辅音（末尾）',
        body: '德语词尾的浊辅音会清化 — b 读 p、d 读 t、g 读 k。',
        tips: [
          '词尾 b → /p/：Dieb (小偷) 读 /diːp/',
          '词尾 d → /t/：Hand (手) 读 /hant/',
          '词尾 g → /k/：Tag (天) 读 /taːk/',
          '但这个规则只在词尾 — 加词尾变位时回到浊音',
        ],
        examples: [
          { word: 'Hand', meaning: '手 /hant/' },
          { word: 'Tag', meaning: '天 /taːk/' },
          { word: 'Hund', meaning: '狗 /hʊnt/' },
        ],
      },
    ],
    en: [
      {
        title: '🎶 Umlauts Ä Ö Ü',
        body: 'The three umlauts are Germany\'s most distinctive pronunciation features — you need to master lip rounding.',
        tips: [
          'ä /ɛ/: like "bed", more open than e',
          'ö /ø/: lips for o, tongue for e — round lips while saying e',
          'ü /y/: lips for u (rounded), tongue for i — the hardest sound',
          'Practice ü: say "ee", hold the tongue, gradually round lips',
        ],
        examples: [
          { word: 'Mädchen', meaning: 'girl (ä)' },
          { word: 'schön', meaning: 'beautiful (ö)' },
          { word: 'Tür', meaning: 'door (ü)' },
        ],
      },
      {
        title: '📀 Two CH Sounds',
        body: 'The letters "ch" have two completely different pronunciations depending on preceding vowel.',
        tips: [
          'After front vowels (i, e, ä, ö, ü, ei): /ç/ — airy "hy" as in "ich"',
          'After back vowels (a, o, u, au): /x/ — rasping "kh" as in "Bach"',
          'chs usually sounds like /ks/: "sechs" (six)',
          'Word-initial ch: usually /ç/ or /k/',
        ],
        examples: [
          { word: 'ich', meaning: 'I (/ç/)' },
          { word: 'Bach', meaning: 'Bach (/x/)' },
          { word: 'sechs', meaning: 'six (/ks/)' },
        ],
      },
      {
        title: '🌪 The R Sound',
        body: 'German R varies — uvular is standard.',
        tips: [
          'Before a vowel: /ʁ/ uvular fricative (like French R)',
          'After a vowel: often reduces to /ɐ/ (a weak "a")',
          'Mutter\'s -er reads as /ɐ/',
          'Southern Germany/Austria may use a rolled /r/',
        ],
        examples: [
          { word: 'rot', meaning: 'red (uvular)' },
          { word: 'Mutter', meaning: 'mother (-er /ɐ/)' },
        ],
      },
      {
        title: '🔇 Final Devoicing',
        body: 'Word-final voiced consonants devoice — b → p, d → t, g → k.',
        tips: [
          'Final b → /p/: Dieb (thief) → /diːp/',
          'Final d → /t/: Hand → /hant/',
          'Final g → /k/: Tag (day) → /taːk/',
          'Only at word-end — voicing returns with suffixes',
        ],
        examples: [
          { word: 'Hand', meaning: 'hand /hant/' },
          { word: 'Tag', meaning: 'day /taːk/' },
        ],
      },
    ],
  },
};

async function loadPronunciation(lang) {
  const panel = document.getElementById('tab-pronunciation');
  const uiLang = getUILang();
  const guide = PRON_GUIDES[lang.code];
  const sections = guide ? (uiLang === 'zh' ? guide.zh : guide.en) : [];

  const sectionHtml = sections.map(s => {
    const tipsHtml = s.tips && s.tips.length
      ? `<ul class="pron-tips">${s.tips.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
      : '';
    const examplesHtml = s.examples && s.examples.length
      ? `<div class="pron-examples">${s.examples.map(ex => `
          <div class="pron-example">
            <div class="pron-example-top">
              <span class="pron-example-word">${escapeHtml(ex.word)}</span>
              ${speakButtonsHTML(ex.word, lang.code, ex.word || '', { size: 'sm' })}
            </div>
            <div class="pron-example-meaning">${escapeHtml(ex.meaning)}</div>
          </div>
        `).join('')}</div>`
      : '';
    return `
      <div class="pron-section">
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.body)}</p>
        ${tipsHtml}
        ${examplesHtml}
      </div>
    `;
  }).join('');

  const overview = uiLang === 'zh' ? lang.description_zh : lang.description_en;

  panel.innerHTML = `
    <div class="panel-header">
      <h2>${uiLang === 'zh' ? '发音指南' : 'Pronunciation Guide'}</h2>
    </div>
    <p class="pron-overview">${escapeHtml(overview || '')}</p>
    ${sectionHtml || `<div class="empty">${uiLang === 'zh' ? '暂无发音指南' : 'No guide available'}</div>`}
  `;
}
