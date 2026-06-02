from datetime import timedelta

def format_timestamp(seconds: float, use_comma: bool = True) -> str:
    """
    Formats seconds into WebVTT/SRT timestamp format.
    use_comma: True for SRT (00:00:00,000), False for WebVTT (00:00:00.000)
    """
    td = timedelta(seconds=seconds)
    hours, remainder = divmod(td.seconds, 3600)
    minutes, seconds_int = divmod(remainder, 60)
    milliseconds = int(td.microseconds / 1000)

    separator = ',' if use_comma else '.'
    return f"{hours:02d}:{minutes:02d}:{seconds_int:02d}{separator}{milliseconds:03d}"


def _wrap_power_word(word_text: str, is_power: bool) -> str:
    """Wrap power words with <b> tags for SRT/VTT bold rendering."""
    if is_power:
        return f"<b>{word_text}</b>"
    return word_text


def generate_srt(segments: list, word_level: bool = True) -> str:
    """Generates SubRip Text (SRT) format. Supports word-level resolution with power word bolding."""
    lines = []
    index = 1

    for seg in segments:
        if word_level and 'words' in seg:
            for w in seg['words']:
                if 'start' not in w or 'end' not in w:
                    continue
                start = format_timestamp(w['start'], use_comma=True)
                end = format_timestamp(w['end'], use_comma=True)
                word_text = w['word'].strip()
                is_power = w.get('is_power', False)
                display = _wrap_power_word(word_text, is_power)
                lines.append(f"{index}")
                lines.append(f"{start} --> {end}")
                lines.append(display)
                lines.append("")
                index += 1
        else:
            start = format_timestamp(seg['start'], use_comma=True)
            end = format_timestamp(seg['end'], use_comma=True)
            text = seg['text'].strip()
            lines.append(f"{index}")
            lines.append(f"{start} --> {end}")
            lines.append(f"{text}")
            lines.append("")
            index += 1

    return "\n".join(lines)

def generate_vtt(segments: list, word_level: bool = True) -> str:
    """Generates Web Video Text Tracks (WebVTT) format. Supports word-level resolution with power word bolding."""
    lines = ["WEBVTT", ""]
    for seg in segments:
        if word_level and 'words' in seg:
            for w in seg['words']:
                if 'start' not in w or 'end' not in w:
                    continue
                start = format_timestamp(w['start'], use_comma=False)
                end = format_timestamp(w['end'], use_comma=False)
                word_text = w['word'].strip()
                is_power = w.get('is_power', False)
                display = _wrap_power_word(word_text, is_power)
                lines.append(f"{start} --> {end}")
                lines.append(display)
                lines.append("")
        else:
            start = format_timestamp(seg['start'], use_comma=False)
            end = format_timestamp(seg['end'], use_comma=False)
            text = seg['text'].strip()
            lines.append(f"{start} --> {end}")
            lines.append(f"{text}")
            lines.append("")

    return "\n".join(lines)
