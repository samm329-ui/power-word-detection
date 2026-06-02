"""Tests for LLM-Only Power Word Detection with Guarantee."""
import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from caption_engine.power_detector import (
    _heuristic_pick,
    _final_guarantee,
    detect_power_words,
    _FILLERS,
)
from caption_engine.config import INTENSITY_LEVELS, SHORT_SEGMENT_THRESHOLD


# =========================================================================
# Fillers
# =========================================================================

class TestFillers:
    def test_english_fillers(self):
        for w in ['the', 'a', 'an', 'is', 'are', 'was', 'in', 'on', 'at']:
            assert w in _FILLERS

    def test_hindi_fillers(self):
        for w in ['hai', 'hain', 'tha', 'ka', 'ki', 'ke', 'ko', 'aur', 'bhi', 'main', 'kya']:
            assert w in _FILLERS

    def test_power_words_not_in_fillers(self):
        for w in ['margin', 'revenue', 'khaali', 'nahi', 'paisa', 'karo', 'dekh', 'lekin', 'par', 'aaj', 'chaar']:
            assert w not in _FILLERS, f"'{w}' should NOT be a filler"


# =========================================================================
# Intensity
# =========================================================================

class TestIntensity:
    def test_light(self):
        assert INTENSITY_LEVELS['light']['max_per_segment'] == 1

    def test_medium(self):
        assert INTENSITY_LEVELS['medium']['max_per_segment'] == 2

    def test_aggressive(self):
        assert INTENSITY_LEVELS['aggressive']['max_per_segment'] == 3


# =========================================================================
# Heuristic Pick
# =========================================================================

class TestHeuristicPick:
    def test_picks_non_filler(self):
        words = ["the", "margin", "is", "good"]
        result = _heuristic_pick(words, 1)
        assert result == [1]

    def test_picks_longest(self):
        words = ["margin", "revenue", "is"]
        result = _heuristic_pick(words, 1)
        assert result == [1]  # revenue (7) > margin (6)

    def test_multiple(self):
        words = ["margin", "revenue", "profit", "is"]
        result = _heuristic_pick(words, 2)
        assert len(result) == 2

    def test_all_filler(self):
        words = ["the", "a", "is", "basically"]
        result = _heuristic_pick(words, 1)
        assert result == [3]

    def test_empty(self):
        result = _heuristic_pick([], 1)
        assert result == [0]


# =========================================================================
# Final Guarantee
# =========================================================================

class TestFinalGuarantee:
    def test_adds_power(self):
        segs = [{'text': 'hi', 'start': 0, 'end': 1, 'words': [
            {'word': 'hello', 'start': 0, 'end': 0.5, 'is_power': False},
            {'word': 'world', 'start': 0.5, 'end': 1, 'is_power': False},
        ]}]
        _final_guarantee(segs, 2)
        assert any(w.get('is_power') for w in segs[0]['words'])

    def test_skips_existing(self):
        segs = [{'text': 'hi', 'start': 0, 'end': 1, 'words': [
            {'word': 'hello', 'start': 0, 'end': 0.5, 'is_power': True},
            {'word': 'world', 'start': 0.5, 'end': 1, 'is_power': False},
        ]}]
        _final_guarantee(segs, 2)
        assert segs[0]['words'][0]['is_power'] == True
        assert segs[0]['words'][1]['is_power'] == False

    def test_handles_empty(self):
        _final_guarantee([{'text': '', 'start': 0, 'end': 0, 'words': []}], 2)


# =========================================================================
# Full detect_power_words (no LLM)
# =========================================================================

class TestDetectNoLLM:
    def _no_llm(self):
        old = os.environ.get("GROQ_API_KEY")
        os.environ["GROQ_API_KEY"] = ""
        return old

    def _restore(self, old):
        if old: os.environ["GROQ_API_KEY"] = old
        else: os.environ.pop("GROQ_API_KEY", None)

    def _seg(self, words):
        w = [{'word': w, 'start': i*0.5, 'end': (i+1)*0.5} for i, w in enumerate(words)]
        return {'text': ' '.join(words), 'start': 0, 'end': len(words)*0.5, 'words': w}

    def test_every_line_gets_power(self):
        old = self._no_llm()
        try:
            segs = [
                self._seg(["chaar", "businesses,", "phir"]),
                self._seg(["bhi", "account", "khaali,"]),
                self._seg(["turnover", "hai,", "revenue"]),
                self._seg(["hai,", "lekin", "shayad"]),
                self._seg(["margin", "nahi", "hai,"]),
                self._seg(["isliye", "numbers", "bade"]),
                self._seg(["dikhate", "hain,", "par"]),
                self._seg(["paisa", "nahi", "hota,"]),
                self._seg(["aaj", "hi", "apna"]),
                self._seg(["margin", "check", "karo,"]),
                self._seg(["kaise", "karna", "hai,"]),
                self._seg(["kya", "action", "main"]),
                self._seg(["hai,", "dekh", "lo"]),
            ]
            result = detect_power_words(segs, intensity="medium")
            for i, seg in enumerate(result):
                power = [w['word'] for w in seg['words'] if w.get('is_power')]
                assert len(power) >= 1, f"Line {i} has 0 power words: '{seg['text']}'"
        finally:
            self._restore(old)

    def test_is_power_flag_present(self):
        old = self._no_llm()
        try:
            seg = self._seg(["the", "margin", "is", "good"])
            result = detect_power_words([seg], intensity="medium")
            for w in result[0]['words']:
                assert 'is_power' in w
                assert isinstance(w['is_power'], bool)
        finally:
            self._restore(old)

    def test_empty_segment(self):
        result = detect_power_words([{'text': '', 'start': 0, 'end': 0, 'words': []}], intensity="medium")
        assert result[0]['words'] == []

    def test_invalid_intensity(self):
        old = self._no_llm()
        try:
            seg = self._seg(["margin", "revenue", "profit", "hai"])
            result = detect_power_words([seg], intensity="invalid")
            assert any(w.get('is_power') for w in result[0]['words'])
        finally:
            self._restore(old)

    def test_medium_max_2(self):
        old = self._no_llm()
        try:
            seg = self._seg(["margin", "revenue", "profit", "paisa"])
            result = detect_power_words([seg], intensity="medium")
            power = [w for w in result[0]['words'] if w.get('is_power')]
            assert 1 <= len(power) <= 2
        finally:
            self._restore(old)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
