import math
import re
import unicodedata

WORDS_PER_MINUTE = 200


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    value = re.sub(r"[^\w\s-]", "", value.lower())
    return re.sub(r"[-\s_]+", "-", value).strip("-")


def read_time_minutes(text: str) -> int:
    words = len(re.findall(r"\w+", text))
    return max(1, math.ceil(words / WORDS_PER_MINUTE))
