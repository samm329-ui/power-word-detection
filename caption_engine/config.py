# config.py - FYAP Pro Full Stack

PIPELINE_VERSION = '1.0.0'

# -- Backend --
SERVER_HOST = '127.0.0.1'
SERVER_PORT = 8000

DATA_DIR = 'data'
UPLOAD_DIR  = 'data/uploads'
OUTPUT_DIR  = 'data/outputs'
DB_PATH     = 'data/fyap_pro.db'

MAX_UPLOAD_SIZE_MB = 500

# -- Config Profile --
PROFILE = 'balanced'  # 'fast' | 'balanced' | 'accurate'

# -- Base Thresholds (overridden by adaptive engine) --
DUAL_SCORE_THRESHOLD   = 0.80
ALIGN_AVG_THRESHOLD    = 0.65
CONFIDENCE_REPROCESS   = 0.50
CONFIDENCE_DIM         = 0.60
CONFIDENCE_MICRO_REALIGN = 0.40

# -- Adaptive Engine Deltas --
NOISY_SNR_THRESHOLD      = 10
NOISY_DUAL_DELTA         = -0.05
NOISY_ALIGN_DELTA        = -0.05
FAST_SPEECH_THRESHOLD    = 3.5
FAST_SPEECH_ALIGN_DELTA  = -0.03

# -- Scoring Weights --
SEMANTIC_WEIGHT          = 0.60
KEYWORD_WEIGHT           = 0.40
ALIGN_LOW_RATIO_MAX      = 0.30
ALIGN_WORD_THRESHOLD     = 0.50

# -- Chunking --
CHUNK_SIZE_NORMAL        = 30
CHUNK_OVERLAP_NORMAL     = 2
CHUNK_SIZE_STRICT        = 15
CHUNK_OVERLAP_STRICT     = 3

# -- Sentence Split --
SENTENCE_MAX_WORDS       = 10
SENTENCE_MAX_WORDS_STRICT = 8
PROSODY_PAUSE_THRESHOLD  = 0.4

# -- Retry --
RETRY_GROQ  = 2
RETRY_LLM   = 1
RETRY_ALIGN = 2

# -- Alignment --
OVERLAP_TOLERANCE        = 0.10
DRIFT_MIN_GAP            = 0.02
MICRO_REALIGN_WINDOW     = 1.0

# -- Embedding --
EMBED_BATCH_SIZE         = 16

# -- LLM --
LLM_MODE                 = 'normal'

# -- LM Check --
LM_CHECK_MIN_SCORE       = 0.50

# -- Consistency Pass --
CONSISTENCY_WORD_DIFF_MAX = 0.05

# -- Cache --
CACHE_DIR                = 'data/cache'

# -- Alignment Models --
MODEL_ALIGN_EN           = 'WAV2VEC2_ASR_BASE_960H'
MODEL_ALIGN_HI           = 'theainerd/Wav2Vec2-large-xlsr-hindi'

# -- Fallback Score --
MIN_SCORE_FALLBACK       = 0.60

# -- Language-Aware Confidence --
CONFIDENCE_HINDI         = 0.70
CONFIDENCE_ENGLISH       = 0.78
CONFIDENCE_HINGLISH      = 0.72

# -- Hallucination Guard --
MAX_WORD_DIFF_RATIO      = 0.40

# -- Observability --
LOG_STRUCTURED           = True
LOG_DIR                  = 'data/logs'

# -- Power Word Detection --
POWER_WORD_MODEL         = 'llama-3.3-70b-versatile'
POWER_WORD_TEMPERATURE   = 0.1
POWER_WORD_MAX_TOKENS    = 800
POWER_WORD_BATCH_SIZE    = 50

# Intensity levels: controls max power words per segment
INTENSITY_LEVELS = {
    'light':      {'max_per_segment': 1, 'prompt_strength': 'subtle'},
    'medium':     {'max_per_segment': 2, 'prompt_strength': 'moderate'},
    'aggressive': {'max_per_segment': 3, 'prompt_strength': 'strong'},
}
DEFAULT_INTENSITY = 'medium'

# Short segment threshold: segments with fewer words get max 1 power word
SHORT_SEGMENT_THRESHOLD = 4

# ---------------------------------------------------------------------------
# 7-Tier Priority System
# Rank 1 (100) = highest priority, Rank 7 (70) = lowest
# When over limit, keep words with HIGHER weight
# ---------------------------------------------------------------------------
PRIORITY_WEIGHTS = {
    'number':        100,   # Rank 1: Numbers & Stats (42, 40%, ₹50,000, 2025)
    'contrast':       95,   # Rank 2: Strong Contrast Words (लेकिन, however, still, yet)
    'problem':        90,   # Rank 3: Problem / Pain Words (खाली, loss, empty, zero)
    'adjective':      85,   # Rank 4: Strong Adjectives/Adverbs (बड़ा, amazing, shocking)
    'cta_verb':       80,   # Rank 5: Call-to-Action Verbs (check, do, चेक करो, देख लो)
    'business_noun':  75,   # Rank 6: Business/Power Nouns (revenue, profit, secret, formula)
    'urgency':        70,   # Rank 7: Urgency Words (now, today, अभी, तुरंत)
    'other':           1,   # Everything else
}

# ---------------------------------------------------------------------------
# Category word lists (EN + HI + Hinglish) for fallback detection
# ---------------------------------------------------------------------------

# Rank 1: Numbers & Stats — detected by regex, not word list
# Pattern: digits, percentages, currency, year ranges

# Rank 2: Strong Contrast Words
CONTRAST_WORDS_EN = [
    'but', 'however', 'still', 'yet', 'although', 'though',
    'despite', 'nevertheless', 'otherwise', 'instead', 'rather',
    'meanwhile', 'whereas', 'nonetheless',
]
CONTRAST_WORDS_HI = [
    'लेकिन', 'पर', 'परंतु', 'फिर भी', 'इसके बावजूद',
    'वरना', 'अन्यथा', 'बल्कि', 'दूसरी ओर', 'जबकि',
    'तब भी', 'फिर भी', 'मगर',
]

# Rank 3: Problem / Pain Words
PROBLEM_WORDS_EN = [
    'loss', 'empty', 'zero', 'fail', 'failure', 'problem',
    'struggle', 'pain', 'broke', 'broken', 'worst', 'terrible',
    'horrible', 'disaster', 'crisis', 'danger', 'risk', 'threat',
    'poverty', 'debt', 'bankrupt', 'fired', 'rejected',
]
PROBLEM_WORDS_HI = [
    'खाली', 'नहीं', 'समस्या', 'हार', 'हानि', 'घाटा',
    'टूट', 'बर्बाद', 'तबाह', 'संकट', 'खतरा', 'गरीबी',
    'कर्ज', 'दिवालिया', 'निकाला', 'ठुकराया', 'बुरा',
    'भयानक', 'डर', 'डूब', 'खोया',
]

# Rank 4: Strong Adjectives / Adverbs
ADJECTIVE_WORDS_EN = [
    'amazing', 'incredible', 'shocking', 'devastating', 'stunning',
    'powerful', 'ultimate', 'exclusive', 'massive', 'extreme',
    'revolutionary', 'insane', 'brutal', 'terrifying', 'mind-blowing',
    'unstoppable', 'deadly', 'savage', 'legendary', 'epic',
    'unbelievable', 'crazy', 'wild', 'fierce', 'cunning',
    'biggest', 'best', 'worst', 'greatest', 'fastest',
    'absolutely', 'completely', 'totally', 'utterly',
]
ADJECTIVE_WORDS_HI = [
    'बड़ा', 'सबसे', 'शानदार', 'जबरदस्त', 'खतरनाक',
    'रहस्यमय', 'अद्भुत', 'चौंकाने वाला', 'भयानक',
    'ताकतवर', 'शक्तिशाली', 'घातक', 'अविश्वसनीय',
    'रोमांचक', 'धमाकेदार', 'तूफानी', 'सबसे बड़ा',
    'सबसे अच्छा', 'सबसे खराब', 'बिल्कुल', 'पूरी तरह',
]

# Rank 5: Call-to-Action Verbs
CTA_VERBS_EN = [
    'start', 'check', 'do', 'try', 'grab', 'get', 'grab',
    'stop', 'watch', 'see', 'click', 'subscribe', 'join',
    'download', 'learn', 'discover', 'build', 'create', 'use',
    'apply', 'implement', 'execute', 'launch', 'begin',
]
CTA_VERBS_HI = [
    'चेक करो', 'देख लो', 'करो', 'जान लो', 'शुरू करो',
    'रोको', 'देखो', 'सुनो', 'समझो', 'बनाओ', 'सीखो',
    'पकड़ो', 'ले लो', 'डाउनलोड करो', 'ज्वाइन करो',
    'सब्सक्राइब करो', 'क्लिक करो', 'ट्राई करो',
]

# Rank 6: Business / Power Nouns
BUSINESS_NOUNS_EN = [
    'revenue', 'profit', 'margin', 'secret', 'formula', 'hack',
    'strategy', 'method', 'system', 'blueprint', 'framework',
    'millionaire', 'billionaire', 'income', 'salary', 'investment',
    'stock', 'market', 'brand', 'startup', 'growth', 'scale',
    'algorithm', 'funnel', 'conversion', 'roi', 'leverage',
]
BUSINESS_NOUNS_HI = [
    'मार्जिन', 'टर्नओवर', 'रेवेन्यू', 'प्रॉफिट', 'सीक्रेट',
    'फॉर्मूला', 'हैक', 'स्ट्रैटेजी', 'सिस्टम', 'ब्लूप्रिंट',
    'करोड़पति', 'इनकम', 'सैलरी', 'निवेश', 'शेयर',
    'मार्केट', 'ब्रांड', 'स्टार्टअप', 'ग्रोथ',
]

# Rank 7: Urgency Words
URGENCY_WORDS_EN = [
    'now', 'today', 'immediately', 'instantly', 'urgent',
    'hurry', 'quick', 'fast', 'asap', 'deadline', 'limited',
    'last chance', 'final', 'ending', 'before', 'run out',
]
URGENCY_WORDS_HI = [
    'अभी', 'तुरंत', 'फौरन', 'आज', 'जल्दी', 'फटाफट',
    'आखिरी मौका', 'सीमित', 'खत्म', 'पहले', 'बचा लो',
]

# Aggregated fallback dictionaries per language
POWER_WORDS_EN = {
    'contrast': CONTRAST_WORDS_EN,
    'problem': PROBLEM_WORDS_EN,
    'adjective': ADJECTIVE_WORDS_EN,
    'cta_verb': CTA_VERBS_EN,
    'business_noun': BUSINESS_NOUNS_EN,
    'urgency': URGENCY_WORDS_EN,
}

POWER_WORDS_HI = {
    'contrast': CONTRAST_WORDS_HI,
    'problem': PROBLEM_WORDS_HI,
    'adjective': ADJECTIVE_WORDS_HI,
    'cta_verb': CTA_VERBS_HI,
    'business_noun': BUSINESS_NOUNS_HI,
    'urgency': URGENCY_WORDS_HI,
}

POWER_WORDS_HINGLISH = {
    'contrast': CONTRAST_WORDS_EN + CONTRAST_WORDS_HI,
    'problem': PROBLEM_WORDS_EN + PROBLEM_WORDS_HI,
    'adjective': ADJECTIVE_WORDS_EN + ADJECTIVE_WORDS_HI,
    'cta_verb': CTA_VERBS_EN + CTA_VERBS_HI,
    'business_noun': BUSINESS_NOUNS_EN + BUSINESS_NOUNS_HI,
    'urgency': URGENCY_WORDS_EN + URGENCY_WORDS_HI,
}
