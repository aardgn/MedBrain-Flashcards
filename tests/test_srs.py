import pytest
from services.srs import calculate_next_review, SRSResult, SANIYE_PER_GUN


def test_srs_bilemedim():
    assert calculate_next_review(0, "Bilemedim", 1000.0) == SRSResult(0, 1000.0)
    assert calculate_next_review(1, "Bilemedim", 1000.0) == SRSResult(0, 1000.0)
    assert calculate_next_review(100, "Bilemedim", 1000.0) == SRSResult(0, 1000.0)


def test_srs_zordu():
    assert calculate_next_review(0, "Zordu", 1000.0) == SRSResult(1, 1000.0 + SANIYE_PER_GUN)
    assert calculate_next_review(1, "Zordu", 1000.0) == SRSResult(1, 1000.0 + SANIYE_PER_GUN)
    assert calculate_next_review(100, "Zordu", 1000.0) == SRSResult(100, 1000.0 + 100 * SANIYE_PER_GUN)


def test_srs_kolaydi():
    assert calculate_next_review(0, "Kolaydı", 1000.0) == SRSResult(3, 1000.0 + 3 * SANIYE_PER_GUN)
    assert calculate_next_review(1, "Kolaydı", 1000.0) == SRSResult(2, 1000.0 + 2 * SANIYE_PER_GUN)
    assert calculate_next_review(4, "Kolaydı", 1000.0) == SRSResult(8, 1000.0 + 8 * SANIYE_PER_GUN)
    assert calculate_next_review(100, "Kolaydı", 1000.0) == SRSResult(200, 1000.0 + 200 * SANIYE_PER_GUN)


def test_srs_negative_interval():
    """Mevcut (bilinen, henüz düzeltilmemiş) davranışı kilitler."""
    assert calculate_next_review(-5, "Bilemedim", 1000.0) == SRSResult(0, 1000.0)
    assert calculate_next_review(-5, "Zordu", 1000.0) == SRSResult(1, 1000.0 + SANIYE_PER_GUN)
    # Bilinen bug: negatif aralık "Kolaydı" dalında negatif kalmaya devam ediyor.
    assert calculate_next_review(-5, "Kolaydı", 1000.0) == SRSResult(-10, 1000.0 + (-10) * SANIYE_PER_GUN)


def test_srs_unknown_button_type():
    """Mevcut kod bilinmeyen buton_tipi için UnboundLocalError fırlatıyor (else dalı yok)."""
    with pytest.raises(UnboundLocalError):
        calculate_next_review(10, "Bilinmeyen", 1000.0)


def test_srs_deterministic_with_fixed_time():
    """Aynı girdiler her zaman aynı çıktıyı vermeli (zaman kaynağı dışarıdan enjekte edilir)."""
    r1 = calculate_next_review(2, "Zordu", 5000.0)
    r2 = calculate_next_review(2, "Zordu", 5000.0)
    assert r1 == r2
