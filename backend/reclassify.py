"""Re-categorise vocabulary items with weak or generic categories
(currently "general" / empty) into semantic buckets based on English meaning.

This lets categories like "colors", "body", "food", "weather" grow to 200+ items
using the large imported dictionaries (CC-CEDICT, ECDICT, JMdict, KENGDIC, etc.).
Items with specific categories (cet4, ielts, greetings, romance, ...) are left alone.

Run:
    python reclassify.py          # preview counts per category
    python reclassify.py --apply  # write changes to DB
"""
import re
import sys
from collections import defaultdict
from database import engine, SessionLocal
import models

models.Base.metadata.create_all(bind=engine)

# Categories considered "weak" — worth overwriting if a semantic match exists.
WEAK_CATEGORIES = {"general", "", None}

# Keyword maps. Each category is matched when any of its keywords appears as a
# standalone token in the English meaning (word boundaries respected).
CATEGORY_KEYWORDS = {
    "colors": [
        "color", "colour", "coloured", "colored", "red", "blue", "green", "yellow",
        "black", "white", "orange", "purple", "pink", "gray", "grey", "brown",
        "crimson", "scarlet", "azure", "golden", "silver", "amber", "bronze",
        "emerald", "ivory", "jade", "maroon", "navy", "olive", "plum", "ruby",
        "tan", "teal", "violet", "indigo", "turquoise", "beige", "khaki",
        "hue", "shade", "pigment", "dye", "tint", "chromatic", "pale", "dark",
    ],
    "body": [
        "head", "face", "eye", "eyes", "nose", "ear", "ears", "mouth", "lip",
        "lips", "tooth", "teeth", "tongue", "cheek", "chin", "jaw", "neck",
        "throat", "shoulder", "arm", "arms", "elbow", "hand", "hands", "finger",
        "fingers", "thumb", "wrist", "palm", "chest", "breast", "back", "waist",
        "hip", "stomach", "belly", "navel", "leg", "legs", "thigh", "knee",
        "ankle", "foot", "feet", "toe", "heel", "skin", "bone", "bones", "skull",
        "muscle", "hair", "beard", "moustache", "brain", "heart", "lung", "liver",
        "kidney", "spleen", "intestine", "blood", "vein", "artery", "nerve",
        "organ", "pulse", "anatomy", "anatomical", "spine", "rib", "pelvis",
    ],
    "weather": [
        "weather", "sunny", "rain", "rainy", "snow", "snowy", "wind", "windy",
        "cloud", "cloudy", "fog", "foggy", "mist", "misty", "storm", "stormy",
        "thunder", "lightning", "hail", "frost", "frosty", "sleet", "drizzle",
        "downpour", "blizzard", "hurricane", "tornado", "cyclone", "climate",
        "temperature", "humid", "humidity", "barometric", "breeze", "gale",
        "dew", "overcast", "drought", "monsoon", "forecast", "meteorology",
        "atmosphere", "atmospheric", "pressure", "sunshine", "shower",
    ],
    "time": [
        "time", "today", "tomorrow", "yesterday", "morning", "afternoon", "noon",
        "evening", "night", "midnight", "dawn", "dusk", "sunrise", "sunset",
        "day", "daily", "week", "weekly", "month", "monthly", "year", "yearly",
        "annual", "hour", "hourly", "minute", "moment", "instant", "clock",
        "watch", "calendar", "date", "schedule", "appointment", "period",
        "era", "epoch", "century", "decade", "millennium", "quarterly",
        "weekend", "weekday", "holiday", "season", "spring", "summer", "autumn",
        "winter", "monday", "tuesday", "wednesday", "thursday", "friday",
        "saturday", "sunday", "january", "february", "march", "april", "may",
        "june", "july", "august", "september", "october", "november", "december",
    ],
    "food": [
        "food", "rice", "bread", "noodle", "pasta", "dumpling", "meat", "fish",
        "chicken", "beef", "pork", "lamb", "mutton", "duck", "turkey", "seafood",
        "shrimp", "crab", "lobster", "oyster", "salmon", "tuna", "egg", "dairy",
        "milk", "cheese", "butter", "yogurt", "cream", "fruit", "apple", "pear",
        "banana", "grape", "strawberry", "peach", "watermelon", "cherry",
        "lemon", "lime", "mango", "pineapple", "papaya", "vegetable", "tomato",
        "potato", "carrot", "onion", "garlic", "ginger", "lettuce", "cabbage",
        "spinach", "broccoli", "cauliflower", "corn", "mushroom", "bean", "peas",
        "almond", "peanut", "walnut", "tea", "coffee", "juice", "wine", "beer",
        "liquor", "alcohol", "soda", "sauce", "spice", "salt", "sugar", "pepper",
        "vinegar", "honey", "snack", "cookie", "cake", "candy", "chocolate",
        "meal", "breakfast", "lunch", "dinner", "supper", "appetizer", "dessert",
        "cuisine", "restaurant", "cafe", "bakery", "dish", "recipe", "delicious",
        "tasty", "savory", "sweet", "bitter", "sour", "spicy", "salty", "menu",
        "edible", "cook", "cooked", "cooking", "bake", "fry", "boil", "steam",
        "grill", "roast", "eat", "eating", "drink", "drinking", "sip", "chew",
        "swallow", "digest", "nutrition", "nutrient", "vitamin", "protein",
    ],
    "family": [
        "family", "father", "mother", "dad", "parent", "parents", "son",
        "daughter", "child", "children", "kid", "baby", "infant", "brother",
        "sister", "sibling", "husband", "spouse", "couple", "relative", "uncle",
        "aunt", "cousin", "nephew", "niece", "grandfather", "grandmother",
        "grandpa", "grandma", "grandparent", "grandson", "granddaughter",
        "ancestor", "descendant", "generation", "in-law", "stepfather",
        "stepmother", "stepson", "stepdaughter", "twin", "household", "kin",
        "kinship", "clan", "dynasty",
    ],
    "feelings": [
        "happy", "happiness", "sad", "sadness", "angry", "anger", "upset",
        "joyful", "hatred", "fear", "afraid", "scared", "worry", "worried",
        "anxiety", "nervous", "tired", "exhausted", "bored", "boredom",
        "excited", "excitement", "shocked", "embarrassed", "proud", "ashamed",
        "guilty", "guilt", "regret", "jealous", "jealousy", "envious", "envy",
        "content", "satisfied", "frustrated", "depressed", "depression",
        "delighted", "ecstatic", "thrilled", "grief", "mourning", "lonely",
        "loneliness", "homesick", "relaxed", "calm", "peaceful", "mood",
        "emotion", "emotional", "sentiment", "affection", "compassion",
        "sympathy", "empathy", "cherish", "nostalgia", "melancholy",
    ],
    "travel": [
        "travel", "journey", "trip", "tour", "excursion", "voyage", "airport",
        "airline", "flight", "plane", "airplane", "pilot", "station", "train",
        "railway", "railroad", "subway", "metro", "tram", "taxi", "cab", "car",
        "vehicle", "motorcycle", "bicycle", "ship", "boat", "yacht", "cruise",
        "port", "harbor", "dock", "ferry", "hotel", "motel", "hostel", "inn",
        "resort", "lodging", "accommodation", "reservation", "ticket",
        "boarding", "passport", "visa", "customs", "luggage", "baggage",
        "suitcase", "backpack", "map", "guidebook", "tourist", "tourism",
        "destination", "itinerary", "route", "road", "street", "avenue",
        "highway", "freeway", "path", "lane", "alley", "bridge", "tunnel",
        "intersection", "traffic", "parking", "nearby", "abroad", "overseas",
        "foreign", "souvenir",
    ],
    "shopping": [
        "shop", "store", "market", "mall", "boutique", "supermarket", "grocery",
        "buy", "purchase", "sell", "sale", "price", "cost", "expensive", "cheap",
        "affordable", "discount", "bargain", "money", "cash", "payment", "pay",
        "receipt", "invoice", "refund", "return", "exchange", "cashier",
        "customer", "consumer", "retail", "wholesale", "merchandise", "goods",
        "product", "brand", "package", "order", "delivery", "transaction",
        "coupon", "voucher", "budget", "afford",
    ],
    "emergency": [
        "emergency", "urgent", "crisis", "disaster", "accident", "rescue",
        "safety", "danger", "dangerous", "risk", "hazard", "threat", "alarm",
        "alert", "police", "patrol", "arrest", "crime", "criminal", "thief",
        "robbery", "burglary", "doctor", "physician", "nurse", "medic",
        "paramedic", "hospital", "clinic", "ambulance", "fire", "firefighter",
        "flood", "earthquake", "typhoon", "tsunami", "evacuate", "evacuation",
        "injure", "injury", "wound", "bleed", "fracture", "poison", "overdose",
        "bandage", "paramedic",
    ],
    "numbers": [
        "zero", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
        "seventeen", "eighteen", "nineteen", "twenty", "thirty", "forty",
        "fifty", "sixty", "seventy", "eighty", "ninety", "hundred", "thousand",
        "million", "billion", "trillion", "count", "quantity", "percent",
        "percentage", "fraction", "dozen", "numeral",
    ],
    "verbs": [
        "(v.", "(verb)", "vt.", "vi.", "v.",
    ],
    "adjectives": [
        "(adj.)", "(adjective)", "adj.", "(a.)", "a.",
    ],
    "romance": [
        "love", "lover", "beloved", "romance", "romantic", "darling",
        "sweetheart", "affection", "affectionate", "passion", "passionate",
        "intimate", "intimacy", "tender", "crush", "infatuation", "flirt",
        "flirting", "dating", "engagement", "marriage", "wedding", "bride",
        "groom", "valentine", "adore", "adoring", "cherish", "kissing",
        "caress", "seduce", "seduction", "courtship", "proposal", "honeymoon",
        "fiancé", "fiance", "fiancée", "betrothed", "sweethearts", "lovemaking",
        "amour", "sweetie", "enamoured", "enamored", "smitten",
        # Chinese keywords for CC-CEDICT / CJK entries (substring matched)
        "爱情", "恋爱", "恋人", "情侣", "亲吻", "拥抱", "浪漫", "约会",
        "婚姻", "结婚", "情人", "暗恋", "初恋", "表白", "甜蜜", "思念",
        "心爱", "爱慕", "钟情", "倾心",
    ],
    "phrases": [
        "idiom", "saying", "proverb", "phrase", "expression", "slang",
        "catchphrase", "motto", "aphorism", "cliché", "cliche",
        # Chinese phrase-flag keywords
        "成语", "俗语", "谚语", "俚语", "口语", "惯用语", "熟语",
    ],
    "greetings": [
        "hello", "greeting", "greet", "welcome", "goodbye", "farewell",
        "regards", "salutation", "waving", "hi!", "hiya", "cheerio",
        "howdy", "salute", "bow",
        # Chinese
        "问候", "招呼", "寒暄", "道别", "致意", "打招呼", "告辞",
    ],
}

# (Weak categories that should be OVERWRITTEN on re-run — so re-running after
# adding keywords boosts categories that only had a few curated items.)
OVERWRITABLE = WEAK_CATEGORIES | {"romance", "phrases"}

# Priority when scores tie — specific categories beat generic ones
PRIORITY = ["colors", "body", "weather", "family", "numbers", "food",
            "travel", "feelings", "shopping", "emergency", "greetings",
            "time", "verbs", "adjectives"]

_WORD_RE = re.compile(r"[A-Za-z]+")


def _tokens(text: str):
    return set(_WORD_RE.findall((text or "").lower()))


def classify(meaning_en: str, meaning_zh: str) -> str | None:
    """Return best-fit category name, or None if no keyword matched."""
    text = (meaning_en or "").lower() + " | " + (meaning_zh or "").lower()
    tokens = _tokens(text)

    # Heuristic shortcuts specific to CC-CEDICT / dictionary formats
    en_lower = (meaning_en or "").strip().lower()
    if en_lower.startswith("to "):
        return "verbs"
    if any(en_lower.endswith(suf) for suf in (" adj.", "(adj)", " adjective")):
        return "adjectives"
    scores = {}
    for cat, kws in CATEGORY_KEYWORDS.items():
        score = 0
        for kw in kws:
            # Non-ASCII (Chinese etc.) or multi-word → substring match
            if not kw.isascii() or " " in kw or "(" in kw or "." in kw or "-" in kw or "!" in kw:
                if kw in text:
                    score += 1
            else:
                if kw in tokens:
                    score += 1
        if score > 0:
            scores[cat] = score
    if not scores:
        return None
    best = max(scores.values())
    winners = [c for c, s in scores.items() if s == best]
    if len(winners) == 1:
        return winners[0]
    for p in PRIORITY:
        if p in winners:
            return p
    return winners[0]


def run(apply: bool = False):
    db = SessionLocal()
    try:
        items = (
            db.query(models.VocabItem)
            .filter(models.VocabItem.category.in_(list(WEAK_CATEGORIES - {None}) or [""]))
            .yield_per(2000)
        )
        change_count = defaultdict(int)
        total = 0
        scanned = 0
        for v in items:
            scanned += 1
            new_cat = classify(v.meaning_en, v.meaning_zh)
            if new_cat and new_cat != v.category:
                change_count[new_cat] += 1
                total += 1
                if apply:
                    v.category = new_cat
            if scanned % 50000 == 0:
                print(f"  scanned {scanned}, reclassified {total}")
                if apply:
                    db.commit()

        if apply:
            db.commit()

        print(f"\nScanned {scanned} 'general'/empty items.")
        print(f"{'Would reclassify' if not apply else 'Reclassified'} {total} items:")
        for cat, n in sorted(change_count.items(), key=lambda x: -x[1]):
            print(f"  {cat:<12} +{n}")
        if not apply:
            print("\n(Dry run — re-run with --apply to commit.)")
    finally:
        db.close()


if __name__ == "__main__":
    run(apply=("--apply" in sys.argv))
