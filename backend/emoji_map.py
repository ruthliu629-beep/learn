"""Word → emoji mapping. Matched by normalized English meaning or Chinese meaning.
Used to add visual hints to vocabulary cards."""
import re

# Master map: normalized term → emoji.
# Order of keys doesn't matter. Lookup is case-insensitive and punctuation-free.
EMOJI_MAP = {
    # ============ greetings / phrases ============
    "hello": "👋", "hi": "👋", "good morning": "🌅", "good evening": "🌆",
    "good night": "🌙", "goodbye": "👋", "bye": "👋", "thank you": "🙏",
    "thanks": "🙏", "sorry": "🙇", "excuse me": "🙇", "please": "🙏",
    "yes": "✅", "no": "❌", "okay": "👌", "it's okay": "👌",
    "you're welcome": "😊", "how are you": "👋",
    "nice to meet you": "🤝", "cheers": "🥂", "good luck": "🍀",
    "congratulations": "🎉", "welcome": "🎉",
    "what's your name": "🏷",

    # ============ numbers ============
    "one": "1️⃣", "two": "2️⃣", "three": "3️⃣", "four": "4️⃣", "five": "5️⃣",
    "six": "6️⃣", "seven": "7️⃣", "eight": "8️⃣", "nine": "9️⃣", "ten": "🔟",
    "hundred": "💯", "one hundred": "💯", "thousand": "🔢",

    # ============ time ============
    "today": "📅", "tomorrow": "📆", "yesterday": "🗓",
    "now": "⏱", "morning": "🌅", "afternoon": "🌤", "evening": "🌇",
    "night": "🌙", "noon": "🌞", "week": "📅", "month": "🗓",
    "year": "📆", "what time is it": "⏰", "what time": "⏰",
    "wait a moment": "⏳", "a moment": "⏳",
    "early": "🌅",

    # ============ family ============
    "dad": "👨", "mom": "👩", "father": "👨", "mother": "👩",
    "brother": "👦", "older brother": "👦", "sister": "👧", "older sister": "👧",
    "younger brother": "👦", "younger sister": "👧",
    "husband": "🤵", "wife": "👰", "son": "👶", "daughter": "👶",
    "child": "🧒", "children": "👧", "baby": "👶",
    "friend": "👫", "family": "👨‍👩‍👧", "people": "👥", "person": "👤",

    # ============ food ============
    "rice": "🍚", "noodles": "🍜", "bread": "🍞", "meat": "🥩",
    "fish": "🐟", "chicken": "🍗", "beef": "🥩", "pork": "🥓",
    "egg": "🥚", "tofu": "🧈", "soup": "🍲", "dumplings": "🥟",
    "steamed bun": "🥟", "sushi": "🍣", "ramen": "🍜", "tempura": "🍤",
    "pizza": "🍕", "hamburger": "🍔", "sandwich": "🥪", "taco": "🌮",
    "paella": "🥘", "tapas": "🍢", "croissant": "🥐", "cheese": "🧀",
    "butter": "🧈", "salt": "🧂", "sugar": "🍬", "pepper": "🌶",
    "spicy": "🌶", "delicious": "😋", "tasty": "😋",

    "fruit": "🍎", "apple": "🍎", "pear": "🍐", "banana": "🍌",
    "orange": "🍊", "grape": "🍇", "strawberry": "🍓", "peach": "🍑",
    "watermelon": "🍉", "cherry": "🍒", "lemon": "🍋", "pineapple": "🍍",
    "mango": "🥭",

    "vegetable": "🥬", "vegetables": "🥬", "tomato": "🍅",
    "potato": "🥔", "carrot": "🥕", "onion": "🧅", "corn": "🌽",
    "mushroom": "🍄", "lettuce": "🥬", "kimchi": "🥬", "bibimbap": "🍲",
    "bulgogi": "🥩", "congee": "🍚", "dim sum": "🥟", "siu mai": "🥟",
    "bbq pork": "🥓", "bratwurst": "🌭", "sausage": "🌭", "pretzel": "🥨",
    "rice dumpling": "🍙", "braised pork rice": "🍚",

    "tea": "🍵", "water": "💧", "coffee": "☕", "beer": "🍺",
    "wine": "🍷", "juice": "🧃", "milk": "🥛", "soda": "🥤",
    "drink": "🥤", "hot": "🔥",

    "menu": "📖", "restaurant": "🍽", "breakfast": "🥐", "lunch": "🍱",
    "dinner": "🍲", "i'm hungry": "🍴", "i am hungry": "🍴",
    "i'm thirsty": "💧", "i am thirsty": "💧",

    # ============ body ============
    "head": "👤", "face": "🙂", "eye": "👁", "eyes": "👀", "ear": "👂",
    "nose": "👃", "mouth": "👄", "lips": "👄", "tongue": "👅",
    "tooth": "🦷", "teeth": "🦷", "hair": "💇", "beard": "🧔",
    "hand": "✋", "foot": "🦶", "leg": "🦵", "arm": "💪",
    "finger": "👆", "heart": "❤️", "brain": "🧠", "bone": "🦴",
    "skin": "🧴",

    # ============ colors ============
    "red": "🔴", "blue": "🔵", "green": "🟢", "yellow": "🟡",
    "black": "⚫", "white": "⚪", "orange": "🟠", "purple": "🟣",
    "pink": "🩷", "brown": "🟤", "gray": "⚫", "grey": "⚫",

    # ============ weather ============
    "weather": "🌤", "sun": "☀️", "sunny": "☀️", "sunny day": "☀️",
    "cloud": "☁️", "cloudy": "☁️", "rain": "🌧", "snow": "❄️",
    "wind": "💨", "windy": "💨", "storm": "⛈", "fog": "🌫",
    "rainbow": "🌈", "hot": "🥵", "cold": "🥶", "warm": "♨️",

    # ============ travel ============
    "where is": "📍", "where": "📍", "where is it": "📍",
    "how to get to": "🗺", "how to go": "🗺", "airport": "✈️",
    "train station": "🚉", "station": "🚉", "subway": "🚇",
    "bus": "🚌", "bus stop": "🚏", "taxi": "🚕", "car": "🚗",
    "bicycle": "🚲", "bike": "🚲", "motorcycle": "🏍",
    "ship": "🚢", "boat": "⛵", "plane": "✈️", "ticket": "🎫",
    "hotel": "🏨", "map": "🗺", "passport": "🛂", "luggage": "🧳",
    "suitcase": "🧳", "left": "⬅️", "right": "➡️", "straight": "⬆️",
    "go straight": "⬆️", "straight ahead": "⬆️", "stop": "🛑",
    "go": "🏃", "come": "🏃", "arrive": "🎯",

    # ============ shopping ============
    "how much": "💰", "how much is it": "💰", "price": "💰",
    "money": "💵", "cash": "💵", "credit card": "💳", "pay": "💳",
    "expensive": "💎", "too expensive": "💎", "cheap": "🪙",
    "this one": "👉", "this": "👉", "that": "👈", "buy": "🛍",
    "sell": "🏷", "receipt": "🧾", "shop": "🏪", "store": "🏪",
    "market": "🏪", "bag": "🛍",

    # ============ emergency ============
    "help": "🆘", "help me": "🆘", "emergency": "🚨",
    "police": "👮", "police car": "🚓", "call the police": "📞",
    "call police": "📞", "doctor": "👨‍⚕️", "hospital": "🏥",
    "ambulance": "🚑", "fire": "🔥", "fire station": "🚒",
    "i'm lost": "🗺", "i am lost": "🗺", "lost": "❓",
    "danger": "⚠️", "warning": "⚠️", "accident": "🚨",

    # ============ feelings ============
    "happy": "😊", "sad": "😢", "angry": "😠", "tired": "😴",
    "scared": "😱", "afraid": "😨", "surprised": "😲", "excited": "🤩",
    "bored": "😐", "love": "❤️", "i love you": "❤️",
    "miss": "💭", "i miss you": "💭", "i love": "❤️",
    "like": "👍", "dislike": "👎", "hate": "💢", "hope": "🤞",
    "worried": "😟", "relaxed": "😌", "confused": "🤔",

    # ============ verbs ============
    "eat": "🍴", "drink": "🥤", "see": "👀", "watch": "👀",
    "hear": "👂", "listen": "👂", "speak": "🗣", "talk": "🗣",
    "read": "📖", "write": "✍️", "draw": "🎨", "sing": "🎤",
    "dance": "💃", "run": "🏃", "walk": "🚶", "swim": "🏊",
    "sleep": "😴", "wake up": "⏰", "study": "📚", "learn": "📚",
    "work": "💼", "play": "🎮", "cook": "👨‍🍳", "clean": "🧹",
    "wash": "🧼", "drive": "🚗", "think": "🤔", "know": "💡",
    "understand": "💡", "forget": "🤷", "remember": "💭",
    "ask": "❓", "answer": "💬", "open": "🔓", "close": "🔒",
    "start": "▶️", "finish": "✅", "meet": "🤝", "wait": "⏳",

    # ============ adjectives ============
    "big": "🐘", "small": "🐁", "good": "👍", "bad": "👎",
    "new": "✨", "old": "📜", "fast": "🏃", "slow": "🐢",
    "tall": "📏", "short": "📏", "high": "⬆️", "low": "⬇️",
    "long": "📏", "beautiful": "🌸", "pretty": "🌸", "ugly": "😖",
    "easy": "😌", "difficult": "😣", "important": "⭐", "famous": "🌟",

    # ============ romance ============
    "i like you": "💕", "darling": "💖", "sweetheart": "💖",
    "honey": "🍯", "baby": "💕", "my love": "💘",
    "girlfriend": "💑", "boyfriend": "💑", "date": "💌",
    "will you marry me": "💍", "forever": "♾", "lifetime": "♾",
    "kiss": "💋", "kisses": "💋", "hug": "🤗", "hug me": "🤗",
    "break up": "💔", "miss you": "💌", "secret crush": "💘",
    "love at first sight": "💘", "have a crush on": "💘",
    "cheers!": "🥂", "enjoy your meal": "🍽", "bon appétit": "🍽",
    "no worries": "🙂", "no problem": "👌", "never mind": "🤷",
    "let's go": "🚀",
    "dating": "💑", "marry me": "💍",

    # ============ common fallbacks ============
    "thank you for your work": "💼", "let's eat": "🍴",
    "i don't understand": "🤷", "i don't know": "🤷",
    "once more please": "🔁", "speak slowly please": "🐢",
    "slow down": "🐢",
}


# ============ Category-level fallback emoji ============
# Used when no exact word match found but category is known.
CATEGORY_EMOJI = {
    "greetings": "👋",
    "numbers": "🔢",
    "time": "⏰",
    "family": "👨‍👩‍👧",
    "food": "🍽",
    "colors": "🎨",
    "body": "🧍",
    "weather": "🌤",
    "travel": "🧳",
    "shopping": "🛒",
    "emergency": "🚨",
    "feelings": "💭",
    "verbs": "🏃",
    "adjectives": "✨",
    "phrases": "💬",
    "romance": "❤️",
}


# Normalize a phrase for lookup: lowercase, strip punctuation, collapse spaces
_PUNCT_RE = re.compile(r"[,\.!?;:'\"‘’“”()（）。，！？：；、]")


def _normalize(s: str) -> str:
    if not s:
        return ""
    s = _PUNCT_RE.sub("", s).lower().strip()
    return re.sub(r"\s+", " ", s)


def find_emoji(meaning_en: str = None, meaning_zh: str = None, category: str = None) -> str | None:
    """Return a best-effort emoji for a vocab item. None if no match."""
    # 1. Exact match on normalized English meaning
    en_norm = _normalize(meaning_en or "")
    if en_norm and en_norm in EMOJI_MAP:
        return EMOJI_MAP[en_norm]

    # 2. Exact match on Chinese meaning (useful for Chinese dialects)
    zh_norm = _normalize(meaning_zh or "")
    if zh_norm and zh_norm in EMOJI_MAP:
        return EMOJI_MAP[zh_norm]

    # 3. Try key words from the English meaning (for multi-word definitions)
    if en_norm:
        # strip common articles / pronouns
        stop = {"a", "an", "the", "to", "my", "your", "his", "her", "i",
                "you", "it", "is", "are", "am", "in", "on", "of"}
        tokens = [t for t in en_norm.split() if t not in stop]
        # First try longer phrases (two words) then single
        for i in range(len(tokens)):
            for j in range(min(i + 3, len(tokens)), i, -1):
                phrase = " ".join(tokens[i:j])
                if phrase in EMOJI_MAP:
                    return EMOJI_MAP[phrase]
        # Last: any single word match
        for t in tokens:
            if t in EMOJI_MAP:
                return EMOJI_MAP[t]

    # 4. Category fallback — still gives a faint visual hint
    if category and category in CATEGORY_EMOJI:
        return CATEGORY_EMOJI[category]

    return None
