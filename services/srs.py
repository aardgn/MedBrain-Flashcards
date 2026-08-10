"""
Saf SRS (Spaced Repetition System) mantığı.

Bu modül BİLİNÇLİ OLARAK sıfır dış bağımlılık içerir:
Streamlit, Supabase, Gemini veya başka bir uygulama katmanı import edilmez.
Zaman kaynağı (`su_an`) dışarıdan enjekte edilir; modül `time.time()` çağırmaz.

NOT: Bu, flashcards.py içindeki update_card_progress fonksiyonunun
mevcut davranışının BİREBİR taşınmış halidir. Algoritma değiştirilmemiştir.
"""

from typing import NamedTuple

SANIYE_PER_GUN = 86400


class SRSResult(NamedTuple):
    """calculate_next_review çıktısı.

    yeni_aralik: yeni interval (gün cinsinden, tam sayı)
    sonraki_tekrar: bir sonraki tekrarın MUTLAK unix timestamp'i (delta değil)
    """
    yeni_aralik: int
    sonraki_tekrar: float


def calculate_next_review(mevcut_aralik: int, buton_tipi: str, su_an: float) -> SRSResult:
    """Mevcut flashcards.py davranışının birebir korunmuş hali.

    BİLİNEN, BİLİNÇLİ OLARAK ERTELENMİŞ DURUMLAR (bu fonksiyonda DEĞİŞTİRİLMEDİ):
    - `mevcut_aralik` negatifse ve buton_tipi "Kolaydı" ise, sonuç da negatif
      kalabilir (örn. -5 -> -10). Orijinal kodun davranışı budur.
    - `buton_tipi` üç bilinen değerden biri değilse (örn. yazım hatası), fonksiyon
      `yeni_aralik`/`sonraki_tarih` hiç atanmadığı için UnboundLocalError fırlatır.
      Bu, orijinal kodun (if/elif zincirinde else olmaması) davranışıdır.
    Her iki durum da bu extraction'ın kapsamı dışında; sonraki bir SRS
    iyileştirme adımında ayrıca ele alınmalıdır.
    """
    if buton_tipi == "Bilemedim":
        yeni_aralik = 0
        sonraki_tarih = su_an
    elif buton_tipi == "Zordu":
        yeni_aralik = max(1, mevcut_aralik)
        sonraki_tarih = su_an + (yeni_aralik * SANIYE_PER_GUN)
    elif buton_tipi == "Kolaydı":
        yeni_aralik = mevcut_aralik + 3 if mevcut_aralik == 0 else mevcut_aralik * 2
        sonraki_tarih = su_an + (yeni_aralik * SANIYE_PER_GUN)
    else:
        # Orijinal kodla birebir aynı: bilinmeyen buton_tipi -> UnboundLocalError.
        # Kasıtlı olarak "düzeltilmedi" - bkz. docstring.
        raise UnboundLocalError(
            f"Bilinmeyen buton_tipi: {buton_tipi!r} (orijinal koddaki davranış korundu)"
        )

    return SRSResult(yeni_aralik=yeni_aralik, sonraki_tekrar=sonraki_tarih)
