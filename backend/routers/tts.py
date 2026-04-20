"""TTS proxy for languages not supported by browser.
Currently handles Min Nan (Hokkien) by fetching audio from MOE Sutian."""
import json
import os
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Optional
import requests
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

_EXECUTOR = ThreadPoolExecutor(max_workers=8)

# Shared session: connection pooling + disables cert verification (MOE cert has
# issues on some Windows Python installs).
_SESSION = requests.Session()
_SESSION.verify = False
# Silence insecure warnings
try:
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
except Exception:
    pass

router = APIRouter(prefix="/api/tts", tags=["tts"])

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Load MOE word→id map at import time (one-time, ~14K entries)
_MOE_WORD_TO_ID: Dict[str, str] = {}


def _try_load_moe_map():
    """Build a word→entry-id map from the MOE JSON so we can construct audio URLs."""
    candidates = [
        r"C:\Users\悦\Downloads\dict_extracted\moedict\moedict-data-twblg-master\dict-twblg.json",
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "dict-twblg.json"),
    ]
    for path in candidates:
        if not os.path.exists(path):
            continue
        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            for entry in data:
                title = (entry.get("title") or "").strip()
                hets = entry.get("heteronyms") or []
                if not title or not hets:
                    continue
                eid = str(hets[0].get("id") or "").strip()
                if eid and title not in _MOE_WORD_TO_ID:
                    _MOE_WORD_TO_ID[title] = eid
            print(f"[tts] Loaded MOE map: {len(_MOE_WORD_TO_ID)} entries from {path}")
            return
        except Exception as e:
            print(f"[tts] Failed to load {path}: {e}")
    print("[tts] No MOE map loaded — Min Nan audio will fall back to Google")


_try_load_moe_map()


def _fetch(url: str, referer: Optional[str] = None, timeout: int = 10) -> bytes:
    headers = {
        "User-Agent": UA,
        "Accept": "audio/mpeg, audio/wav, audio/*;q=0.9, */*;q=0.5",
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
    }
    if referer:
        headers["Referer"] = referer
    # Fresh request (no session) to avoid cookies being carried over with
    # Chinese characters that would break latin-1 encoding of HTTP headers.
    r = requests.get(url, headers=headers, timeout=timeout, verify=False,
                     allow_redirects=True, cookies=None)
    if r.status_code >= 400:
        raise Exception(f"HTTP {r.status_code}")
    return r.content


def _moe_audio_url(entry_id: str) -> str:
    """MOE Sutian audio URL pattern: /media/senn/mp3/imtong/subak/{id//1000}/{id}.mp3"""
    subdir = int(entry_id) // 1000
    return f"https://sutian.moe.edu.tw/media/senn/mp3/imtong/subak/{subdir}/{entry_id}.mp3"


# Caches
_MOE_AUDIO_CACHE: Dict[str, bytes] = {}      # per-id MP3 bytes (stripped, ready to concat)
_MOE_SENTENCE_CACHE: Dict[str, bytes] = {}   # per-sentence assembled MP3


def _strip_id3(data: bytes) -> bytes:
    """Remove ID3v2 header and ID3v1 trailer so MP3 frames stitch cleanly."""
    # ID3v2 at start: "ID3" + 2-byte version + 1-byte flags + 4-byte syncsafe size
    if len(data) > 10 and data[:3] == b"ID3":
        size = ((data[6] & 0x7F) << 21) | ((data[7] & 0x7F) << 14) | \
               ((data[8] & 0x7F) << 7)  | (data[9] & 0x7F)
        data = data[10 + size:]
    # ID3v1 at end: last 128 bytes starting with "TAG"
    if len(data) > 128 and data[-128:-125] == b"TAG":
        data = data[:-128]
    return data


def _fetch_moe_cached(eid: str) -> bytes:
    cached = _MOE_AUDIO_CACHE.get(eid)
    if cached is not None:
        return cached
    url = _moe_audio_url(eid)
    try:
        audio = _fetch(url, referer="https://sutian.moe.edu.tw/", timeout=8)
        if len(audio) > 500:
            stripped = _strip_id3(audio)
            _MOE_AUDIO_CACHE[eid] = stripped
            return stripped
    except Exception as e:
        try:
            print(f"[tts] MOE miss id={eid}: {type(e).__name__}: {str(e).encode('ascii','replace').decode()}")
        except Exception:
            pass
    _MOE_AUDIO_CACHE[eid] = b""
    return b""


# In-process cache so repeated syllable lookups don't re-hit words.hk
_YUE_SYL_CACHE: Dict[str, bytes] = {}


def _fetch_yue_syllable(syll: str) -> bytes:
    """Fetch a single Cantonese syllable audio from words.hk (real human voice)."""
    syll = syll.strip().lower()
    if not syll:
        return b""
    cached = _YUE_SYL_CACHE.get(syll)
    if cached is not None:
        return cached
    url = f"https://words.hk/static/jyutping/{syll}.mp3"
    try:
        data = _fetch(url, referer="https://words.hk/", timeout=6)
        if len(data) > 500:
            _YUE_SYL_CACHE[syll] = data
            return data
    except Exception as e:
        print(f"[tts] words.hk syllable miss {syll}: {e}")
    _YUE_SYL_CACHE[syll] = b""
    return b""


@router.get("/yue")
def tts_yue(jp: str = Query(..., min_length=1, max_length=400)):
    """Concatenate real-voice Cantonese audio from words.hk for a jyutping sequence.
    jp is a space-separated jyutping string, e.g. 'nei5 hou2'."""
    # Strip non-jyutping chars (punctuation, etc.)
    syllables = []
    for token in jp.replace(",", " ").replace("，", " ").split():
        # A valid jyutping syllable is letters + digit 1-6
        clean = "".join(c for c in token if c.isalnum()).lower()
        if clean and len(clean) <= 8:
            syllables.append(clean)

    if not syllables:
        raise HTTPException(status_code=400, detail="No valid jyutping syllables")

    # Parallel fetch — all syllables at once; repeats resolved via cache
    results = list(_EXECUTOR.map(_fetch_yue_syllable, syllables))
    chunks = [_strip_id3(b) for b in results if b]
    hit = len(chunks)

    if not chunks:
        raise HTTPException(status_code=502, detail="No Cantonese audio found")

    # MP3 streams can be byte-concatenated (with ID3 stripped) and play smoothly
    combined = b"".join(chunks)
    return Response(
        content=combined, media_type="audio/mpeg",
        headers={
            "X-TTS-Source": f"words.hk-{hit}of{len(syllables)}",
            "Cache-Control": "public, max-age=86400",
        },
    )


@router.get("/google")
def tts_google(
    text: str = Query(..., min_length=1, max_length=200),
    tl: str = Query(..., regex=r"^[a-zA-Z-]{2,10}$"),
):
    """Generic Google Translate TTS proxy — works for any supported language."""
    try:
        url = ("https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob"
               f"&tl={tl}&q={urllib.parse.quote(text)}")
        audio = _fetch(url, referer="https://translate.google.com/", timeout=8)
        if len(audio) > 500:
            return Response(content=audio, media_type="audio/mpeg",
                            headers={"X-TTS-Source": "google-tts", "Cache-Control": "public, max-age=86400"})
    except Exception as e:
        print(f"[tts] Google TTS failed for tl={tl}: {e}")
    raise HTTPException(status_code=502, detail="Google TTS unavailable")


_MOE_MAX_TITLE_LEN = 12  # longest MOE entries are ~8-10 chars


def _segment_moe(text: str):
    """Greedy longest-match segmentation. Returns list of (piece, id_or_None).
    Pieces with no MOE match get id=None and will be skipped for audio."""
    # Strip obvious punctuation but preserve structure
    text = text.strip()
    segments = []
    i = 0
    n = len(text)
    while i < n:
        # Skip punctuation and whitespace
        if text[i] in "。？！?!.,，、；;：: \t\n　":
            i += 1
            continue
        # Try longest match first, backing off one char at a time
        matched = None
        max_len = min(_MOE_MAX_TITLE_LEN, n - i)
        for L in range(max_len, 0, -1):
            piece = text[i:i + L]
            if piece in _MOE_WORD_TO_ID:
                matched = (piece, _MOE_WORD_TO_ID[piece])
                break
        if matched:
            segments.append(matched)
            i += len(matched[0])
        else:
            # No match starting at i — still include as unvoiced piece
            segments.append((text[i], None))
            i += 1
    return segments


@router.get("/nan")
def tts_nan(text: str = Query(..., min_length=1, max_length=200)):
    """Play a full sentence by stitching MOE audio with parallel fetch + cache."""
    # Sentence-level cache: same text served instantly after first call
    cache_key = text.strip()
    cached_sentence = _MOE_SENTENCE_CACHE.get(cache_key)
    if cached_sentence is not None and cached_sentence:
        return Response(content=cached_sentence, media_type="audio/mpeg",
                        headers={"X-TTS-Source": "moe-sutian-cached", "Cache-Control": "public, max-age=86400"})

    segments = _segment_moe(text)
    voiced = [(piece, eid) for piece, eid in segments if eid is not None]
    if not voiced:
        # Try Google as last ditch
        try:
            gurl = ("https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob"
                    f"&tl=nan-TW&q={urllib.parse.quote(text)}")
            audio = _fetch(gurl, referer="https://translate.google.com/", timeout=8)
            if len(audio) > 500:
                return Response(content=audio, media_type="audio/mpeg",
                                headers={"X-TTS-Source": "google-tts", "Cache-Control": "public, max-age=86400"})
        except Exception as e:
            print(f"[tts] Google fetch failed: {e}")
        raise HTTPException(status_code=502, detail="No Min Nan audio source accessible")

    # Parallel fetch of all segment audios
    ids = [eid for _, eid in voiced]
    audio_by_id = {eid: b for eid, b in zip(ids, _EXECUTOR.map(_fetch_moe_cached, ids))}
    chunks = [audio_by_id[eid] for _, eid in voiced if audio_by_id.get(eid)]

    if not chunks:
        raise HTTPException(status_code=502, detail="All MOE audio fetches failed")

    combined = b"".join(chunks)
    _MOE_SENTENCE_CACHE[cache_key] = combined
    return Response(
        content=combined, media_type="audio/mpeg",
        headers={
            "X-TTS-Source": f"moe-sutian-{len(chunks)}of{len(voiced)}",
            "Cache-Control": "public, max-age=86400",
        },
    )


