import os
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

POWER_WORD_PROMPT = """You are an expert at identifying "power words" in captions — words that carry strong emotional impact, emphasis, or action. These are words that make captions engaging and attention-grabbing.

Given a list of words from a caption, mark which ones are power words.

Examples of power words:
- Strong verbs: discover, transform, unleash, dominate, explode, reveal, secret, proven
- Emotional words: amazing, incredible, shocking, devastating, stunning, powerful
- Action words: now, instantly, immediately, breakthrough, game-changing
- Impact words: ultimate, exclusive, massive, extreme, revolutionary
- Curiosity words: hidden, mystery, surprising, unexpected, strange

NOT power words (common/functional words):
- Articles: a, an, the
- Prepositions: in, on, at, to, for, with, by
- Conjunctions: and, but, or, so
- Pronouns: I, you, he, she, it, we, they
- Common verbs: is, are, was, were, be, been, have, has, had, do, does, did
- Common adjectives: good, bad, big, small (unless used for emphasis in context)

Return ONLY a JSON array of true/false values, one per word, in the same order as the input.
Example input: ["this", "is", "an", "amazing", "discovery"]
Example output: [false, false, false, true, true]"""


def detect_power_words(segments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Takes aligned segments (with word-level timestamps) and adds is_power flag to each word.
    Uses Groq LLM to identify power words efficiently by batching all words.
    """
    try:
        from groq import Groq
    except ImportError:
        logger.warning("groq package not available, skipping power word detection")
        return _mark_all_false(segments)

    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key or "your_groq_api_key" in api_key:
        logger.warning("GROQ_API_KEY not set, skipping power word detection")
        return _mark_all_false(segments)

    # Collect all words across all segments
    all_words = []
    word_map = []  # (segment_index, word_index) for mapping back

    for seg_idx, seg in enumerate(segments):
        if 'words' not in seg:
            continue
        for word_idx, word in enumerate(seg['words']):
            all_words.append(word.get('word', '').strip())
            word_map.append((seg_idx, word_idx))

    if not all_words:
        return segments

    # Process in batches of ~100 words to stay within token limits
    BATCH_SIZE = 100
    power_flags = [False] * len(all_words)

    try:
        client = Groq(api_key=api_key)

        for batch_start in range(0, len(all_words), BATCH_SIZE):
            batch_end = min(batch_start + BATCH_SIZE, len(all_words))
            batch_words = all_words[batch_start:batch_end]

            # Skip batches that are all empty
            if not any(batch_words):
                continue

            user_msg = json.dumps(batch_words)

            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": POWER_WORD_PROMPT},
                    {"role": "user", "content": user_msg}
                ],
                temperature=0.1,
                max_tokens=500,
            )

            response = completion.choices[0].message.content.strip()

            # Parse the JSON array response
            try:
                # Handle potential markdown code blocks
                if response.startswith("```"):
                    response = response.split("\n", 1)[1]
                    if response.endswith("```"):
                        response = response[:-3]
                    response = response.strip()

                flags = json.loads(response)
                if isinstance(flags, list) and len(flags) == len(batch_words):
                    for i, flag in enumerate(flags):
                        power_flags[batch_start + i] = bool(flag)
                else:
                    logger.warning(f"Power word response length mismatch: got {len(flags) if isinstance(flags, list) else 'non-list'}, expected {len(batch_words)}")
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse power word response: {response[:200]}")

    except Exception as e:
        logger.error(f"Power word detection failed: {e}")
        return _mark_all_false(segments)

    # Map flags back to segments
    for (seg_idx, word_idx), is_power in zip(word_map, power_flags):
        if 'words' in segments[seg_idx] and word_idx < len(segments[seg_idx]['words']):
            segments[seg_idx]['words'][word_idx]['is_power'] = is_power

    # Also mark words without explicit word entries
    for seg in segments:
        if 'words' not in seg:
            continue
        for word in seg['words']:
            if 'is_power' not in word:
                word['is_power'] = False

    power_count = sum(power_flags)
    logger.info(f"Power word detection complete: {power_count}/{len(all_words)} words marked as power words")
    return segments


def _mark_all_false(segments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Fallback: mark all words as non-power words."""
    for seg in segments:
        if 'words' in seg:
            for word in seg['words']:
                word['is_power'] = False
    return segments
