import os
import re
import json
import time
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

from .config import (
    POWER_WORD_MODEL, POWER_WORD_TEMPERATURE, POWER_WORD_MAX_TOKENS,
    INTENSITY_LEVELS, DEFAULT_INTENSITY, SHORT_SEGMENT_THRESHOLD,
)

# ---------------------------------------------------------------------------
# Fillers to NEVER pick
# ---------------------------------------------------------------------------
_FILLERS = {
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'must',
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as',
    'into', 'about', 'between', 'through', 'after', 'before',
    'and', 'or', 'but', 'nor', 'so', 'yet',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
    'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their',
    'this', 'that', 'these', 'those', 'here', 'there',
    'not', 'no', 'very', 'just', 'also', 'too', 'only', 'even',
    'hai', 'hain', 'tha', 'thi', 'ho', 'hua', 'hue',
    'ka', 'ki', 'ke', 'ko', 'se', 'me', 'pe',
    'aur', 'ya', 'jo', 'wo', 'yah', 'vah',
    'ek', 'iss', 'uss', 'yeh', 'woh',
    'main', 'mai', 'tu', 'tum', 'aap', 'ye',
    'kya', 'kaise', 'kyun', 'kab', 'kaha',
    'bhi', 'hi', 'toh', 'to',
    'isliye', 'shayad', 'phir',
}

# ---------------------------------------------------------------------------
# Simple per-segment prompt
# ---------------------------------------------------------------------------

_SIMPLE_PROMPT = """Pick the {max_count} most important words from this caption line. This is Hinglish content.

Line: "{text}"
Words: {word_list}

Rules:
- Pick exactly {max_count} word(s) that deserve highlighting
- Power words: numbers (chaar, 4), business (margin, revenue, turnover, profit, paisa), problems (khaali, nahi, loss, zero), contrast (lekin, par, magar), action (karo, dekh, check, start), urgency (aaj, abhi, turant), strong (bada, sabse, khatarnak)
- NEVER pick: hai, hain, tha, bhi, hi, main, kya, kaise, isliye, shayad, phir, ka, ki, ke, ko, se, me, aur, ya

Return ONLY a JSON array of word indices. Example: [0]"""

_CONTEXT_PROMPT = """Pick the {max_count} most important words from this caption line. This is Hinglish content.

Story context: "{context}"
Line: "{text}"
Words: {word_list}

Rules:
- Pick exactly {max_count} word(s) that deserve highlighting
- Use the story context to pick the most impactful words
- Power words: numbers, business (margin, revenue, turnover), problems (khaali, nahi, loss), contrast (lekin, par), action (karo, dekh, check), urgency (aaj, abhi), strong (bada, sabse)
- NEVER pick: hai, hain, tha, bhi, hi, main, kya, kaise, isliye, shayad, phir, ka, ki, ke, ko, se, me, aur, ya

Return ONLY a JSON array. Example: [2, 5]"""


# ---------------------------------------------------------------------------
# LLM helpers
# ---------------------------------------------------------------------------

def _get_client():
    try:
        from groq import Groq
        api_key = os.environ.get("GROQ_API_KEY", "")
        if api_key and "your_groq_api_key" not in api_key:
            return Groq(api_key=api_key)
    except ImportError:
        pass
    return None


def _call_llm(client, prompt: str, max_retries: int = 3) -> Optional[List[int]]:
    """Call LLM and return parsed indices. Handles rate limits with retry."""
    for attempt in range(max_retries):
        try:
            completion = client.chat.completions.create(
                model=POWER_WORD_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=POWER_WORD_TEMPERATURE,
                max_tokens=200,
            )

            response = completion.choices[0].message.content.strip()

            # Strip markdown
            if "```" in response:
                # Extract content between backticks
                parts = response.split("```")
                for part in parts:
                    part = part.strip()
                    if part.startswith("json"):
                        part = part[4:].strip()
                    if part.startswith("["):
                        response = part
                        break

            # Find JSON array in response
            match = re.search(r'\[[\d\s,]+\]', response)
            if match:
                response = match.group()
            elif not response.startswith("["):
                return None

            parsed = json.loads(response)
            if isinstance(parsed, list) and len(parsed) > 0:
                return [int(i) for i in parsed if isinstance(i, (int, float))]

            return None

        except Exception as e:
            err = str(e).lower()
            if 'rate' in err or '429' in err or 'limit' in err:
                wait = (attempt + 1) * 5
                logger.warning(f"Rate limited, waiting {wait}s (attempt {attempt+1}/{max_retries})")
                time.sleep(wait)
                continue
            logger.warning(f"LLM error: {e}")
            return None

    return None


# ---------------------------------------------------------------------------
# Heuristic pick (guarantee)
# ---------------------------------------------------------------------------

def _heuristic_pick(words: List[str], max_count: int) -> List[int]:
    """Pick best word(s) by length, skipping fillers. Always returns ≥1."""
    candidates = []
    for i, w in enumerate(words):
        wl = w.strip().lower().rstrip(',.!?;:')
        if not wl or wl in _FILLERS:
            continue
        candidates.append((i, len(wl)))

    if candidates:
        candidates.sort(key=lambda x: x[1], reverse=True)
        return [c[0] for c in candidates[:max_count]]

    # All filler — pick longest
    if words:
        longest_idx = max(range(len(words)), key=lambda i: len(words[i].strip()))
        return [longest_idx]

    return [0]


# ---------------------------------------------------------------------------
# Final guarantee
# ---------------------------------------------------------------------------

def _final_guarantee(segments: List[Dict[str, Any]], intensity: str = 'light'):
    divisor = {'light': 3, 'medium': 2, 'aggressive': 1}.get(intensity, 3)
    for seg_idx, seg in enumerate(segments):
        if 'words' not in seg or not seg['words']:
            continue
        if any(w.get('is_power', False) for w in seg['words']):
            continue

        word_texts = [w.get('word', '').strip() for w in seg['words']]
        if not any(word_texts):
            continue

        effective_max = max(1, len(word_texts) // divisor) if len(word_texts) >= SHORT_SEGMENT_THRESHOLD else 1
        picks = _heuristic_pick(word_texts, effective_max)
        for i in picks:
            if i < len(seg['words']):
                seg['words'][i]['is_power'] = True
        logger.warning(f"Final guarantee: segment {seg_idx}")


# ---------------------------------------------------------------------------
# Core: detect_power_words — Per-Segment LLM Detection
# ---------------------------------------------------------------------------

def detect_power_words(
    segments: List[Dict[str, Any]],
    intensity: str = DEFAULT_INTENSITY,
) -> List[Dict[str, Any]]:
    """
    Per-segment LLM detection with rate limiting and guarantee system.

    Each segment gets its own LLM call (simple prompt, max 100 tokens).
    Rate limit: 1.5s between calls.
    If LLM misses → heuristic pick → final guarantee.
    """
    logger.info("=" * 60)
    logger.info("POWER DETECTOR v3 (per-segment LLM + guarantee)")
    logger.info(f"Segments: {len(segments)}, Intensity: {intensity}")
    logger.info("=" * 60)

    if intensity not in INTENSITY_LEVELS:
        intensity = DEFAULT_INTENSITY

    # Base max from intensity (light=1, medium=2, aggressive=3 per SHORT segment)
    base_max = INTENSITY_LEVELS[intensity]['max_per_segment']
    client = _get_client()

    if not client:
        logger.warning("LLM unavailable — using heuristic for all segments")
    else:
        logger.info("LLM client ready")

    # Initialize all words
    for seg in segments:
        if 'words' in seg and seg['words']:
            for w in seg['words']:
                w['is_power'] = False

    total_words = 0
    llm_hits = 0
    heuristic_hits = 0

    # Build all segment texts
    seg_texts = []
    for seg in segments:
        if 'words' in seg and seg['words']:
            seg_texts.append(seg.get('text', ' '.join(w.get('word', '') for w in seg['words'])))
        else:
            seg_texts.append(seg.get('text', ''))

    # Process each segment
    for seg_idx, seg in enumerate(segments):
        if 'words' not in seg or not seg['words']:
            continue

        words = seg['words']
        word_texts = [w.get('word', '').strip() for w in words]
        total_words += len(word_texts)

        # Proportional max: light=1 per 3 words, medium=1 per 2, aggressive=1 per 1
        divisor = {'light': 3, 'medium': 2, 'aggressive': 1}.get(intensity, 3)
        effective_max = max(1, len(word_texts) // divisor) if len(word_texts) >= SHORT_SEGMENT_THRESHOLD else 1

        # Skip empty segments
        if not any(word_texts):
            continue

        # Try LLM
        power_indices = None
        if client:
            word_list = ", ".join(f"{w}({i})" for i, w in enumerate(word_texts))

            # Build context from surrounding segments
            context_parts = []
            if seg_idx > 0:
                context_parts.append(seg_texts[seg_idx - 1])
            if seg_idx < len(seg_texts) - 1:
                context_parts.append(seg_texts[seg_idx + 1])
            context = " | ".join(context_parts) if context_parts else ""

            if context:
                prompt = _CONTEXT_PROMPT.format(
                    text=seg_texts[seg_idx],
                    word_list=word_list,
                    max_count=effective_max,
                    context=context,
                )
            else:
                prompt = _SIMPLE_PROMPT.format(
                    text=seg_texts[seg_idx],
                    word_list=word_list,
                    max_count=effective_max,
                )

            power_indices = _call_llm(client, prompt)

            # Rate limit delay
            time.sleep(1.5)

        # Apply LLM results
        if power_indices and len(power_indices) > 0:
            valid = [i for i in power_indices if 0 <= i < len(words)]
            if len(valid) > effective_max:
                valid = valid[:effective_max]

            if valid:
                for i in valid:
                    words[i]['is_power'] = True
                picked = [word_texts[i] for i in valid]
                llm_hits += 1
                logger.info(f"  Seg {seg_idx:2d} LLM: {picked}")
                continue

        # LLM missed — use heuristic
        picks = _heuristic_pick(word_texts, effective_max)
        for i in picks:
            if i < len(words):
                words[i]['is_power'] = True
        picked = [word_texts[i] for i in picks if i < len(word_texts)]
        heuristic_hits += 1
        logger.info(f"  Seg {seg_idx:2d} HEURISTIC: {picked}")

    # Final guarantee (use divisor-based max for each segment)
    _final_guarantee(segments, intensity)

    final_power = sum(1 for seg in segments if 'words' in seg for w in seg['words'] if w.get('is_power'))
    logger.info(f"Power detection: {final_power}/{total_words} words (llm={llm_hits}, heuristic={heuristic_hits})")

    return segments
