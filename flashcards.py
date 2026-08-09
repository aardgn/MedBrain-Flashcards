import streamlit as st
from PIL import Image
from google import genai
import json
import time
from supabase import create_client, Client
from datetime import date, timedelta

# --- 1. BULUT BAĞLANTISI ---
url = st.secrets["SUPABASE_URL"]
key = st.secrets["SUPABASE_KEY"]
supabase: Client = create_client(url, key)

# --- 2. ÇOKLU KULLANICI PROFİL GİRİŞİ ---
st.sidebar.title("👤 Profil Girişi")
username_input = st.sidebar.text_input("Kullanıcı Adınız:", value="").strip().lower()

if not username_input:
    st.title("Medonie 🧠")
    st.info("👋 Hoş geldin! Çalışmaya başlamak için sol menüden kendine bir kullanıcı adı belirle veya mevcut adınızı gir.")
    st.stop()

st.session_state.username = username_input

# --- 3. VERİTABANI FONKSİYONLARI (SUPABASE - USERNAME DESTEKLİ) ---
def get_streak_info(username):
    try:
        response = supabase.table("stats").select("streak, son_calisma").eq("username", username).execute()
        if response.data:
            streak = response.data[0]['streak']
            son_calisma = response.data[0]['son_calisma']
        else:
            supabase.table("stats").insert({"username": username, "streak": 0, "son_calisma": "2000-01-01"}).execute()
            streak = 0
            son_calisma = '2000-01-01'
    except:
        streak = 0
        son_calisma = '2000-01-01'

    bugun_str = date.today().isoformat()
    gunu_kurtardi_mi = (son_calisma == bugun_str)
    return streak, gunu_kurtardi_mi

def update_streak(username):
    try:
        response = supabase.table("stats").select("streak, son_calisma").eq("username", username).execute()
        if response.data:
            mevcut_streak = response.data[0]['streak']
            son_calisma = response.data[0]['son_calisma']
        else:
            mevcut_streak = 0
            son_calisma = '2000-01-01'
        
        bugun = date.today().isoformat()
        
        if son_calisma != bugun:
            dun = (date.today() - timedelta(days=1)).isoformat()
            yeni_streak = mevcut_streak + 1 if son_calisma == dun else 1
            
            supabase.table("stats").update({"streak": yeni_streak, "son_calisma": bugun}).eq("username", username).execute()
    except Exception as e:
        st.error(f"Seri güncellenirken hata: {e}")

def add_cards_to_db(cards, ders_adi, username):
    for card in cards:
        supabase.table("cards").insert({
            "username": username,
            "soru": card['soru'], 
            "cevap": card['cevap'], 
            "ders": ders_adi,
            "durum": "yeni",
            "sonraki_tekrar": 0,
            "aralik": 0
        }).execute()

def delete_cards_from_db(card_id):
    supabase.table("cards").delete().eq("id", card_id).execute()

def get_total_card_count(username):
    response = supabase.table("cards").select("id", count="exact").eq("username", username).execute()
    return response.count if response.count is not None else 0

def load_cards_from_db(username, secilen_ders=None):
    su_an = time.time()
    query = supabase.table("cards").select("id, soru, cevap, durum, ders").lte("sonraki_tekrar", su_an).eq("username", username)
    
    if secilen_ders and secilen_ders != "Tümü":
        query = query.eq("ders", secilen_ders)
        
    response = query.execute()
    return response.data if response.data else []

def update_card_progress(card_id, buton_tipi):
    response = supabase.table("cards").select("aralik").eq("id", card_id).execute()
    if not response.data:
        return
        
    mevcut_aralik = response.data[0]['aralik']
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
        
    supabase.table("cards").update({
        "aralik": yeni_aralik, 
        "sonraki_tekrar": sonraki_tarih
    }).eq("id", card_id).execute()

def get_all_subjects(username):
    response = supabase.table("cards").select("ders").eq("username", username).execute()
    if response.data:
        dersler = list(set([row['ders'] for row in response.data]))
        return dersler
    return []

# --- 4. API AYARLARI ---
API_KEY = st.secrets["GEMINI_API_KEY"]
client = genai.Client(api_key=API_KEY)

# --- 5. UYGULAMA HAFIZASI ---
if 'current_user' not in st.session_state or st.session_state.current_user != st.session_state.username:
    st.session_state.flashcards = load_cards_from_db(st.session_state.username) 
    st.session_state.current_index = 0
    st.session_state.show_answer = False
    st.session_state.current_user = st.session_state.username

# --- ÜST BİLGİ PANELİ ---
col_sol, col_sag = st.columns([3, 1])

with col_sol:
    st.title(f"Medonie 🧠 ({st.session_state.username.capitalize()})")
    
    mevcut_dersler = get_all_subjects(st.session_state.username)
    if mevcut_dersler:
        def ders_degisti():
            st.session_state.current_index = 0
            st.session_state.show_answer = False
            st.session_state.flashcards = load_cards_from_db(st.session_state.username, st.session_state.secili_ders_kutusu)

        ders_secenekleri = ["Tümü"] + mevcut_dersler
        st.selectbox("📚 Çalışılacak Dersi Seçin:", ders_secenekleri, key='secili_ders_kutusu', on_change=ders_degisti)

with col_sag:
    streak_sayisi, bugun_calisti_mi = get_streak_info(st.session_state.username)
    
    if streak_sayisi == 0 and not bugun_calisti_mi: 
        st.subheader("Seri: 0🧊")
        st.caption("Donuyorsun, hemen başla!")
    else: 
        st.subheader(f"Seri: {streak_sayisi}🔥")
        st.caption("Alev alev devam!")

st.divider()

# --- 6. SOL MENÜ (SIDEBAR): FOTOĞRAF VEYA PDF YÜKLEME ---
with st.sidebar:
    st.header("📸 Yeni Not / PDF Ekle")
    ders_girdisi = st.text_input("Ders Adı (Örn: Anatomi, Biyokimya)", value="Genel")
    
    # type parametresine 'pdf' dosya türünü ekledik
    uploaded_file = st.file_uploader("Bir fotoğraf veya PDF dosyası yükleyin", type=["png", "jpg", "jpeg", "pdf"])
    
    if uploaded_file is not None:
        file_bytes = uploaded_file.getvalue()
        mime_type = uploaded_file.type
        
        # Arayüzde önizleme kontrolü
        if mime_type.startswith("image/"):
            image = Image.open(uploaded_file)
            st.image(image, caption="Yüklenen Not", use_container_width=True) 
        elif mime_type == "application/pdf":
            st.info("📄 PDF Dosyası Başarıyla Yüklendi. Yapay zeka dökümanı analiz edecek.")
        
        if st.button("Soruları Üret 🚀"):
            prompt = """
            Bu döküman bir tıp öğrencisinin ders notudur veya sunumudur. En önemli bilgileri tespit et ve Soru-Cevap formatında hazırla.
            Eğer döküman çok karmaşıksa, el yazısı okunamayacak kadar kötüyse veya tıbbi terimleri çıkaramıyorsan SADECE "REJECT" yaz.
            Eğer okuyabiliyorsan çıktıyı SADECE aşağıdaki gibi geçerli bir JSON formatında ver, başka hiçbir açıklama yazma:
            [
              {"soru": "1. soru metni", "cevap": "1. cevap metni"}
            ]
            """
            with st.spinner("Döküman okunuyor..."):
                # Dosya verisini ve mime_type bilgisini sözlük yapısında hazırlıyoruz
                file_part = {"data": file_bytes, "mime_type": mime_type}
                
                try:
                    response_flash = client.models.generate_content(
                        model='gemini-3-flash-preview',
                        contents=[prompt, file_part]
                    )
                    raw_text = response_flash.text.strip()
                    if "REJECT" in raw_text:
                        raise ValueError("Model okuyamadı.")
                        
                    raw_text = raw_text.replace('```json', '').replace('```', '').strip()
                    yeni_kartlar = json.loads(raw_text)
                    
                    add_cards_to_db(yeni_kartlar, ders_girdisi, st.session_state.username)
                    
                    secili = st.session_state.get('secili_ders_kutusu', "Tümü")
                    st.session_state.flashcards = load_cards_from_db(st.session_state.username, secili)
                    st.success(f"Sorular '{ders_girdisi}' dersine eklendi!")
                    time.sleep(2)
                    st.rerun()
                    
                except Exception as e_flash:
                    st.warning("Zorlu not, 2.5 modeline geçiliyor...")
                    try:
                        response_pro = client.models.generate_content(
                            model='gemini-2.5-flash',
                            contents=[prompt, file_part]
                        )
                        raw_text_pro = response_pro.text.replace('```json', '').replace('```', '').strip()
                        yeni_kartlar = json.loads(raw_text_pro)
                        
                        add_cards_to_db(yeni_kartlar, ders_girdisi, st.session_state.username)
                        
                        secili = st.session_state.get('secili_ders_kutusu', "Tümü")
                        st.session_state.flashcards = load_cards_from_db(st.session_state.username, secili)
                        st.success(f"Sorular '{ders_girdisi}' dersine eklendi!")
                        time.sleep(2)
                        st.rerun()

                    except Exception as e_pro:
                        st.error(f"Hata: {e_pro}")

# --- 7. ANA EKRAN: FLASHCARD ÇALIŞMA ALANI ---
if len(st.session_state.flashcards) > 0:
    card = st.session_state.flashcards[0]
    
    st.markdown(f"### Kalan Kart: {len(st.session_state.flashcards)} 🏷️ *{card.get('ders', 'Genel')}*")
    st.info(card["soru"])
    
    if st.button("🗑️ Bu Kartı Sil"):
        delete_cards_from_db(card["id"]) 
        st.session_state.flashcards.pop(0)
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
            update_streak(st.session_state.username) 
            update_card_progress(card["id"], "Bilemedim")
            
            aktif_kart = st.session_state.flashcards.pop(0)
            st.session_state.flashcards.append(aktif_kart)
            st.session_state.show_answer = False
            st.rerun()
            
        if col2.button("🟡 Zordu"):
            update_streak(st.session_state.username) 
            update_card_progress(card["id"], "Zordu")
            st.session_state.flashcards.pop(0)
            st.session_state.show_answer = False
            st.rerun()
            
        if col3.button("🟢 Kolaydı"):
            update_streak(st.session_state.username) 
            update_card_progress(card["id"], "Kolaydı")
            st.session_state.flashcards.pop(0)
            st.session_state.show_answer = False
            st.rerun()
else:
    if get_total_card_count(st.session_state.username) == 0:
        st.info(f"👋 Medonie'ye Hoş Geldin {st.session_state.username.capitalize()}! Şu an destende hiç kart yok. Sol menüden ilk tıp notunu veya PDF'ini yükleyerek maceraya başla! 🚀")
    else:
        st.success("Tebrikler! Bugünlük zamanı gelen tüm kartları bitirdiniz. 🎉 Mükemmel ilerliyorsun!")
