import streamlit as st 
from PIL import Image
from google import genai
import json
import time
import sqlite3
from datetime import date, timedelta

# --- 1. VERİTABANI FONKSİYONLARI ---
def init_db():
    conn = sqlite3.connect('flashcards.db')
    c = conn.cursor()
    # YENİLİK: 'ders' sütunu eklendi
    c.execute('''
        CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            soru TEXT,
            cevap TEXT,
            durum TEXT DEFAULT 'yeni',
            ders TEXT DEFAULT 'Genel'
        )
    ''')
    conn.commit()
    conn.close()

def init_stats_db():
    conn = sqlite3.connect('flashcards.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY,
            streak INTEGER DEFAULT 0,
            son_calisma TEXT DEFAULT '2000-01-01'
        )
    ''')
    # Eğer tablo boşsa, id'si 1 olan başlangıç verisini ekle
    c.execute("SELECT COUNT(*) FROM stats")
    if c.fetchone()[0] == 0:
        c.execute("INSERT INTO stats (streak, son_calisma) VALUES (0, '2000-01-01')")
    conn.commit()
    conn.close()

def get_streak_info():
    conn = sqlite3.connect('flashcards.db')
    c = conn.cursor()
    c.execute("SELECT streak, son_calisma FROM stats WHERE id=1")
    row = c.fetchone()
    conn.close()

    bugun_str = date.today().isoformat()
    gunu_kurtardi_mi = (row[1] == bugun_str)
    return row[0], gunu_kurtardi_mi

def update_streak():
    conn = sqlite3.connect('flashcards.db')
    c = conn.cursor()
    c.execute("SELECT streak, son_calisma FROM stats WHERE id=1")
    row = c.fetchone()
    
    mevcut_streak = row[0]
    son_calisma = row[1]
    bugun = date.today().isoformat()
    
    if son_calisma != bugun:
        dun = (date.today() - timedelta(days=1)).isoformat()
        yeni_streak = mevcut_streak + 1 if son_calisma == dun else 1
        
        c.execute("UPDATE stats SET streak=?, son_calisma=? WHERE id=1", (yeni_streak, bugun))
        conn.commit()
    conn.close()

def add_cards_to_db(cards, ders_adi):
    conn = sqlite3.connect('flashcards.db')
    c = conn.cursor()
    for card in cards:
        # YENİLİK: Artık soruların hangi derse ait olduğunu da kaydediyoruz
        c.execute("INSERT INTO cards (soru, cevap, ders) VALUES (?, ?, ?)", (card['soru'], card['cevap'], ders_adi))
    conn.commit()
    conn.close()

def delete_cards_from_db(card_id):
    conn = sqlite3.connect('flashcards.db')
    c = conn.cursor()
    c.execute("DELETE FROM cards WHERE id=?", (card_id,))
    conn.commit()
    conn.close()

def get_total_card_count():
    conn = sqlite3.connect('flashcards.db')
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM cards")
    count = c.fetchone()[0]
    conn.close()
    return count

def load_cards_from_db(secilen_ders=None):
    conn = sqlite3.connect('flashcards.db')
    c = conn.cursor()
    
    su_an = time.time() # Şu anki zamanı alıyoruz
    
    # YENİLİK: Sadece "sonraki_tekrar" zamanı gelmiş VEYA geçmiş olanları getir
    if secilen_ders and secilen_ders != "Tümü":
        c.execute("SELECT id, soru, cevap, durum, ders FROM cards WHERE ders=? AND sonraki_tekrar <= ?", (secilen_ders, su_an))
    else:
        c.execute("SELECT id, soru, cevap, durum, ders FROM cards WHERE sonraki_tekrar <= ?", (su_an,))
        
    rows = c.fetchall()
    conn.close()
    
    cards_list = []
    for row in rows:
        cards_list.append({"id": row[0], "soru": row[1], "cevap": row[2], "durum": row[3], "ders": row[4]})
    return cards_list

def upgrade_db_for_spaced_repetation():
    conn = sqlite3.connect('flashcards.db')
    c = conn.cursor()
    try:
        c.execute("ALTER TABLE cards ADD COLUMN sonraki_tekrar REAL DEFAULT 0")
        c.execute("ALTER TABLE cards ADD COLUMN aralik INTEGER DEFAULT 0")
    except:
        pass
    conn.commit()
    conn.close()
def update_card_progress(card_id, buton_tipi):
    conn = sqlite3.connect('flashcards.db')
    c = conn.cursor()
    c.execute("SELECT aralik FROM cards WHERE id=?", (card_id,))
    mevcut_aralik = c.fetchone()[0]
    su_an = time.time()
    if buton_tipi == "Bilemedim":
        yeni_aralik = 0
        sonraki_tarih = su_an
    elif buton_tipi == "Zordu":
        yeni_aralik = max(1, mevcut_aralik)
        sonraki_tarih = su_an + (yeni_aralik * 86400)
    elif buton_tipi == "Kolaydı":
        yeni_aralik = mevcut_aralik + 3 if mevcut_aralik == 0 else mevcut_aralik * 2
        sonraki_tarih = su_an + (yeni_aralik * 86400)
    c.execute("UPDATE cards SET aralik=?, sonraki_tekrar=? WHERE id=?", (yeni_aralik, sonraki_tarih, card_id))
    conn.commit()
    conn.close()


def get_all_subjects():
    # Veritabanında kayıtlı olan benzersiz (farklı) ders isimlerini çeker
    conn = sqlite3.connect('flashcards.db')
    c = conn.cursor()
    c.execute("SELECT DISTINCT ders FROM cards")
    rows = c.fetchall()
    conn.close()
    return [row[0] for row in rows] if rows else []


init_db()
upgrade_db_for_spaced_repetation()
init_stats_db()

# --- 2. API AYARLARI ---
API_KEY = st.secrets["GEMINI_API_KEY"]
client = genai.Client(api_key=API_KEY)

# --- 3. UYGULAMA HAFIZASI ---
if 'flashcards' not in st.session_state:
    st.session_state.flashcards = load_cards_from_db() 
if 'current_index' not in st.session_state:
    st.session_state.current_index = 0
if 'show_answer' not in st.session_state:
    st.session_state.show_answer = False

# --- YENİ TASARIM: ÜST BİLGİ PANELİ (SOL: BAŞLIK, SAĞ: MASKOT) ---
col_sol, col_sag = st.columns([3, 1])

with col_sol:
    st.title("Med Brain 🧠")
    
    mevcut_dersler = get_all_subjects()
    if mevcut_dersler:
        def ders_degisti():
            st.session_state.current_index = 0
            st.session_state.show_answer = False
            st.session_state.flashcards = load_cards_from_db(st.session_state.secili_ders_kutusu)

        ders_secenekleri = ["Tümü"] + mevcut_dersler
        st.selectbox("📚 Çalışılacak Dersi Seçin:", ders_secenekleri, key='secili_ders_kutusu', on_change=ders_degisti)

with col_sag:
    streak_sayisi, bugun_calisti_mi = get_streak_info()
    
    if streak_sayisi == 0 and not bugun_calisti_mi: 
        st.subheader("Seri: 0🧊")
        st.caption("Donuyorsun, hemen başla!")
    else: 
        st.subheader(f"Seri: {streak_sayisi}🔥")
        st.caption("Alev alev devam!")

st.divider()

# --- 4. SOL MENÜ (SIDEBAR): SADECE FOTOĞRAF YÜKLEME ---
with st.sidebar:
    st.header("📸 Yeni Not Ekle")
    ders_girdisi = st.text_input("Ders Adı (Örn: Anatomi, Biyokimya)", value="Genel")
    uploaded_file = st.file_uploader("Bir fotoğraf yükleyin", type=["png", "jpg", "jpeg"])
    
    if uploaded_file is not None:
        image = Image.open(uploaded_file)
        st.image(image, caption="Yüklenen Not", width='stretch') 
        
        if st.button("Soruları Üret 🚀"):
# ... (Alt tarafı senin kodundaki API çağrısı ve kaydetme işlemleriyle aynı şekilde devam ediyor) ...
            prompt = """
            Bu görsel bir tıp öğrencisinin ders notudur. En önemli bilgileri tespit et ve Soru-Cevap formatında hazırla.
            Eğer görsel çok karmaşıksa, el yazısı okunamayacak kadar kötüyse veya tıbbi terimleri çıkaramıyorsan SADECE "REJECT" yaz.
            Eğer okuyabiliyorsan çıktıyı SADECE aşağıdaki gibi geçerli bir JSON formatında ver, başka hiçbir açıklama yazma:
            [
              {"soru": "1. soru metni", "cevap": "1. cevap metni"}
            ]
            """
            with st.spinner("Not okunuyor..."):
                try:
                    response_flash = client.models.generate_content(
                        model='gemini-3-flash-preview',
                        contents=[prompt, image]
                    )
                    raw_text = response_flash.text.strip()
                    if "REJECT" in raw_text:
                        raise ValueError("Model okuyamadı.")
                        
                    raw_text = raw_text.replace('```json', '').replace('```', '').strip()
                    yeni_kartlar = json.loads(raw_text)
                    
                    # YENİLİK: Kartları kaydederken kullanıcının yazdığı ders adını da gönderiyoruz
                    add_cards_to_db(yeni_kartlar, ders_girdisi)
                    
                    # Seçili filtreye göre kartları tekrar yükle
                    secili = st.session_state.get('secili_ders_kutusu', "Tümü")
                    st.session_state.flashcards = load_cards_from_db(secili)
                    st.success(f"Sorular '{ders_girdisi}' dersine eklendi!")
                    time.sleep(2)
                    st.rerun()
                    
                except Exception as e_flash:
                    st.warning("Zorlu not, 2.5 modeline geçiliyor...")
                    try:
                        response_pro = client.models.generate_content(
                            model='gemini-2.5-flash',
                            contents=[prompt, image]
                        )
                        raw_text_pro = response_pro.text.replace('```json', '').replace('```', '').strip()
                        yeni_kartlar = json.loads(raw_text_pro)
                        
                        add_cards_to_db(yeni_kartlar, ders_girdisi)
                        
                        secili = st.session_state.get('secili_ders_kutusu', "Tümü")
                        st.session_state.flashcards = load_cards_from_db(secili)
                        st.success(f"Sorular '{ders_girdisi}' dersine eklendi!")
                        time.sleep(2)
                        st.rerun()

                    except Exception as e_pro:
                        st.error(f"Hata: {e_pro}")

# --- 5. ANA EKRAN: FLASHCARD ÇALIŞMA ALANI ---
if len(st.session_state.flashcards) > 0:
    # ARTIK SAYAÇ YOK: Her zaman listenin en üstündeki (0. sıradaki) kartı gösteriyoruz
    card = st.session_state.flashcards[0]
    
    st.markdown(f"### Kalan Kart: {len(st.session_state.flashcards)} 🏷️ *{card.get('ders', 'Genel')}*")
    st.info(card["soru"])
    
    # SİLME BUTONU
    if st.button("🗑️ Bu Kartı Sil"):
        delete_cards_from_db(card["id"]) 
        st.session_state.flashcards.pop(0) # Aktif listeden de uçur
        st.session_state.show_answer = False
        st.success("Kart başarıyla silindi!")
        time.sleep(1)
        st.rerun()
    
    if not st.session_state.show_answer:
        if st.button("Cevabı Gör 👁️"):
            st.session_state.show_answer = True
            st.rerun()
    else:
        st.success(card["cevap"])
        st.write("Bu kart nasıldı:")
        col1, col2, col3 = st.columns(3)
        
        if col1.button("🔴 Bilemedim"):
            update_streak() # YENİ
            update_card_progress(card["id"], "Bilemedim")
            
            aktif_kart = st.session_state.flashcards.pop(0)
            st.session_state.flashcards.append(aktif_kart)
            st.session_state.show_answer = False
            st.rerun()
            
        if col2.button("🟡 Zordu"):
            update_streak() # YENİ
            update_card_progress(card["id"], "Zordu")
            st.session_state.flashcards.pop(0)
            st.session_state.show_answer = False
            st.rerun()
            
        if col3.button("🟢 Kolaydı"):
            update_streak() # YENİ
            update_card_progress(card["id"], "Kolaydı")
            st.session_state.flashcards.pop(0)
            st.session_state.show_answer = False
            st.rerun()
else:
    # Veritabanında hiç kart olup olmadığını kontrol ediyoruz
    if get_total_card_count() == 0:
        st.info("👋 Med Brain'e Hoş Geldin! Şu an destende hiç kart yok. Sol menüden ilk tıp notunu yükleyerek maceraya başla! 🚀")
    else:
        st.success("Tebrikler! Bugünlük zamanı gelen tüm kartları bitirdiniz. 🎉 Mükemmel ilerliyorsun!")