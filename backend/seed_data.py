"""Seed the database with languages, curated vocabulary (with examples), and cultural notes."""
from database import engine, SessionLocal
import models
from vocab_data import zh_cmn, zh_yue, zh_nan, en, ja, ko, fr, es, de
from emoji_map import find_emoji

models.Base.metadata.create_all(bind=engine)

LANGUAGES = [
    {"code": "zh-cmn", "name_zh": "普通话", "name_en": "Mandarin", "flag": "🇨🇳", "type": "dialect",
     "romanization_system": "Pinyin (拼音)",
     "description_zh": "现代标准汉语，中国大陆、台湾、新加坡的官方语言，使用人口超 10 亿。",
     "description_en": "Modern Standard Chinese, the official language of Mainland China, Taiwan, and Singapore."},
    {"code": "zh-yue", "name_zh": "粤语", "name_en": "Cantonese", "flag": "🇭🇰", "type": "dialect",
     "romanization_system": "Jyutping (粤拼)",
     "description_zh": "流行于广东、香港、澳门及海外华人社区，保留大量古汉语声调。",
     "description_en": "Spoken in Guangdong, Hong Kong, Macau, and overseas Chinese communities."},
    {"code": "zh-nan", "name_zh": "闽南语", "name_en": "Hokkien", "flag": "🇹🇼", "type": "dialect",
     "romanization_system": "Pe̍h-ōe-jī (白话字)",
     "description_zh": "主要分布于福建南部、台湾及东南亚华人社区，台语的基础。",
     "description_en": "Widely spoken in southern Fujian, Taiwan, and Southeast Asian Chinese communities."},
    {"code": "en", "name_zh": "英语", "name_en": "English", "flag": "🇬🇧", "type": "foreign",
     "romanization_system": "IPA",
     "description_zh": "全球最广泛使用的国际语言。",
     "description_en": "The world's most widely used international language."},
    {"code": "ja", "name_zh": "日语", "name_en": "Japanese", "flag": "🇯🇵", "type": "foreign",
     "romanization_system": "Romaji (罗马字)",
     "description_zh": "日本官方语言，使用平假名、片假名和汉字三套文字。",
     "description_en": "Japan's official language, using hiragana, katakana, and kanji."},
    {"code": "ko", "name_zh": "韩语", "name_en": "Korean", "flag": "🇰🇷", "type": "foreign",
     "romanization_system": "Revised Romanization",
     "description_zh": "大韩民国和朝鲜的官方语言，使用谚文字母。",
     "description_en": "Official language of South and North Korea, written in Hangul."},
    {"code": "fr", "name_zh": "法语", "name_en": "French", "flag": "🇫🇷", "type": "foreign",
     "romanization_system": "IPA",
     "description_zh": "联合国工作语言，流行于法国、加拿大魁北克、非洲多国。",
     "description_en": "A UN working language, spoken across France, Quebec, and many African countries."},
    {"code": "es", "name_zh": "西班牙语", "name_en": "Spanish", "flag": "🇪🇸", "type": "foreign",
     "romanization_system": "IPA",
     "description_zh": "母语人口世界第二多，通行于西班牙和拉丁美洲。",
     "description_en": "The world's second-most spoken native language, across Spain and Latin America."},
    {"code": "de", "name_zh": "德语", "name_en": "German", "flag": "🇩🇪", "type": "foreign",
     "romanization_system": "IPA",
     "description_zh": "欧洲中部主要语言，德国、奥地利、瑞士部分地区通用。",
     "description_en": "A major Central European language, used in Germany, Austria, and parts of Switzerland."},
]

VOCAB_MODULES = {
    "zh-cmn": zh_cmn.VOCAB,
    "zh-yue": zh_yue.VOCAB,
    "zh-nan": zh_nan.VOCAB,
    "en": en.VOCAB,
    "ja": ja.VOCAB,
    "ko": ko.VOCAB,
    "fr": fr.VOCAB,
    "es": es.VOCAB,
    "de": de.VOCAB,
}

CULTURAL = {
    "zh-cmn": [
        ("四声调系统", "Four Tones",
         "普通话有四个基本声调加一个轻声：阴平(ˉ)、阳平(ˊ)、上声(ˇ)、去声(ˋ)。同一音节不同声调意思完全不同，如 mā(妈)、má(麻)、mǎ(马)、mà(骂)。",
         "Mandarin has four basic tones plus a neutral tone. Same syllable with different tones = totally different meanings.",
         "中国大陆"),
        ("筷子礼仪", "Chopstick Etiquette",
         "中式聚餐避免把筷子竖插在饭碗里（类似祭祀），不要用筷子敲碗或指人。",
         "Never stick chopsticks upright in rice (resembles a funeral offering). Don't tap bowls or point.",
         "中国"),
        ("吃了吗？", "Have You Eaten?",
         "「你吃了吗？」在传统中文语境是问候语，源自物资匮乏年代表达关心。",
         "'Have you eaten?' is a traditional Chinese greeting of care from scarcity times.",
         "中国大陆"),
    ],
    "zh-yue": [
        ("饮茶文化", "Yum Cha Culture",
         "广东和香港的「饮茶」指喝茶吃点心。叩指礼（手指轻敲桌面）表示感谢斟茶。",
         "'Yum cha' means tea with dim sum. Tapping two fingers on the table thanks the pourer.",
         "广东／香港"),
        ("六声系统", "Six Tones",
         "粤语保留古汉语特征，有 6 个声调，比普通话更丰富，赋予粤语流行曲独特韵味。",
         "Cantonese preserves classical features with 6 tones — richer than Mandarin.",
         "岭南"),
        ("港式茶餐厅", "Cha Chaan Teng",
         "茶餐厅是香港特色平价餐馆，融合中西——丝袜奶茶、菠萝包、干炒牛河是代表。",
         "Cha chaan teng are Hong Kong diners blending East and West cuisines.",
         "香港"),
    ],
    "zh-nan": [
        ("文白异读", "Literary vs. Colloquial",
         "闽南语一个汉字常有文读和白读两套发音，如「人」读 jîn（文）或 lâng（白）。",
         "In Hokkien, characters often have literary and colloquial readings (e.g., 人 jîn/lâng).",
         "福建／台湾"),
        ("东南亚华人的纽带", "Southeast Asian Diaspora",
         "闽南语是新加坡、马来西亚、菲律宾、印尼华人的重要方言。马来语 teh 即借自闽南。",
         "Hokkien links Chinese diaspora across Southeast Asia. Malay 'teh' (tea) is a Hokkien loan.",
         "东南亚"),
        ("台语歌谣传统", "Taiwanese Song",
         "闽南语在台湾孕育出台语流行乐、布袋戏、歌仔戏，是台湾文化的基石。",
         "Hokkien bred Taiwanese pop, glove puppetry, and opera — pillars of Taiwanese culture.",
         "台湾"),
    ],
    "en": [
        ("英语方言多样", "English Dialects",
         "英语有多种变体：英式、美式、澳式、加式、印式。拼写、发音、词汇都有差异。",
         "English has many varieties: British, American, Australian, Canadian, Indian etc.",
         "全球"),
        ("丰富的借词", "Rich Borrowing",
         "英语约 60% 词汇来自拉丁语和法语，也借了 kimono、typhoon、kung fu 等。",
         "About 60% of English vocab comes from Latin and French. Loans include kimono, typhoon, kung fu.",
         "全球"),
    ],
    "ja": [
        ("三套文字系统", "Three Scripts",
         "日语混用平假名、片假名、汉字：平假名写本土词和语法，片假名写外来词。",
         "Japanese mixes hiragana, katakana, and kanji — for native, loanwords, and Chinese characters.",
         "日本"),
        ("敬语文化", "Keigo",
         "日语敬语分尊敬语、谦让语、丁宁语三级，根据对方身份选择，是礼仪核心。",
         "Keigo has three levels: respectful, humble, polite — central to Japanese etiquette.",
         "日本"),
        ("饭前饭后", "Itadakimasu & Gochisousama",
         "日本人饭前说「いただきます」感恩食物，饭后说「ごちそうさま」谢厨师。",
         "Before meals: 'itadakimasu' (gratitude). After: 'gochisousama' (thanks).",
         "日本"),
    ],
    "ko": [
        ("谚文的诞生", "Invention of Hangul",
         "朝鲜王朝世宗大王 1443 年颁布谚文，是世界上少数有明确创造者的文字。",
         "Hangul was created by King Sejong in 1443 — one of few scripts with a known inventor.",
         "韩国"),
        ("敬语等级", "Speech Levels",
         "韩语根据对话关系用不同敬语，动词结尾都会变化，比日语更严格。",
         "Korean speech levels change verb endings — stricter than Japanese.",
         "韩国"),
        ("两套数字系统", "Two Number Systems",
         "韩语有汉字词数字（일이삼）和固有数字（하나둘셋），用途不同。",
         "Korean has Sino-Korean and native numbers — used for different contexts.",
         "韩国"),
    ],
    "fr": [
        ("法语圈", "La Francophonie",
         "全球约 3 亿人说法语，遍及法国、加拿大、比利时、瑞士、非洲 20 多国。",
         "French is spoken by ~300M worldwide across France, Quebec, Africa, etc.",
         "全球"),
        ("法兰西学术院", "Académie française",
         "1635 年成立，是法语规范的守护者，抵制过多英语外来词。",
         "Founded in 1635, the Académie guards French, resisting English loans.",
         "法国"),
    ],
    "es": [
        ("大陆差异", "Peninsular vs. Latin American",
         "西班牙用 vosotros，拉美用 ustedes。c/z 发音也不同。",
         "Spain uses vosotros, Latin America uses ustedes. c/z also differ.",
         "西班牙／拉美"),
        ("佛朗明哥与节日", "Flamenco and Festivals",
         "佛朗明哥源自安达卢西亚，融合歌舞吉他。番茄节、奔牛节也是西语文化标志。",
         "Flamenco combines song, dance, guitar. La Tomatina and bull-running are iconic.",
         "西班牙"),
    ],
    "de": [
        ("四种语法格", "Four Grammatical Cases",
         "德语名词有四格：主格、宾格、与格、属格，冠词形容词都跟着变化。",
         "German nouns use 4 cases: nominative, accusative, dative, genitive.",
         "德国"),
        ("合成词传统", "Long Compounds",
         "德语可将多个名词拼成超长复合词，如 Donaudampfschifffahrtsgesellschaft。",
         "German makes long compound nouns, e.g., Donaudampfschifffahrtsgesellschaft.",
         "德国"),
    ],
}


def seed():
    db = SessionLocal()
    try:
        existing = db.query(models.Language).count()
        if existing > 0:
            print(f"Clearing existing data ({existing} languages)...")
            db.query(models.CulturalNote).delete()
            db.query(models.VocabItem).delete()
            db.query(models.Language).delete()
            db.commit()

        code_to_id = {}
        for lang_data in LANGUAGES:
            lang = models.Language(**lang_data)
            db.add(lang)
            db.flush()
            code_to_id[lang.code] = lang.id
        print(f"Inserted {len(LANGUAGES)} languages")

        vocab_count = 0
        for code, items in VOCAB_MODULES.items():
            lang_id = code_to_id[code]
            for tup in items:
                # tuple: (word, rom, m_zh, m_en, cat, ex_nat, ex_rom, ex_zh, ex_en)
                word, rom, m_zh, m_en, cat, ex_nat, ex_rom, ex_zh, ex_en = tup
                db.add(models.VocabItem(
                    language_id=lang_id, word=word, romanization=rom,
                    meaning_zh=m_zh, meaning_en=m_en, category=cat,
                    example_native=ex_nat, example_romanization=ex_rom,
                    example_zh=ex_zh, example_en=ex_en,
                    emoji=find_emoji(m_en, m_zh, cat),
                    source="curated",
                ))
                vocab_count += 1
        print(f"Inserted {vocab_count} vocabulary items (with examples)")

        cult_count = 0
        for code, notes in CULTURAL.items():
            lang_id = code_to_id[code]
            for t_zh, t_en, b_zh, b_en, region in notes:
                db.add(models.CulturalNote(
                    language_id=lang_id, title_zh=t_zh, title_en=t_en,
                    body_zh=b_zh, body_en=b_en, region=region,
                ))
                cult_count += 1
        print(f"Inserted {cult_count} cultural notes")

        db.commit()
        print("Seed complete!")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
