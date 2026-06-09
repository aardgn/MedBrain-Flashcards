import streamlit as st
from supabase import create_client, Client
import datetime
import google.generativeai as genai
from PIL import Image

# Sayfa Yapılandırması
st.set_page_config(page_title="MedBrain Flashcards", page_icon="🧠", layout="centered")

# Supabase ve Gemini Bağlantıları
url = st.secrets["SUPABASE_URL"]
key = st.secrets["SUPABASE_KEY"]
supabase: Client = create_client(url, key)

genai.configure(api_key=st.secrets["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-3.1-flash')

# Giriş Ekranı (Sol Menü)
st.sidebar.title("👤 Profil Girişi")
username_input = st.sidebar.text_input("Kullanıcı Adınız:", value="").strip().lower()

if not username_input:
    st.title("🧠 MedBrain Flashcards")
    st.info("Hoş geldiniz! Çalışmaya başlamak için lütfen sol menüden kendinize bir kullanıcı adı belirleyin veya mevcut adınızı girin.")
    st.stop()

st.session_state.username = username_input

# Veritabanından Kullanıcı Verilerini Çekme
def load_user_data(username):
    cards_resp = supabase.table("cards").select("*").eq("username", username).execute()
    stats_resp = supabase.table("stats").select("*").eq("username", username).execute()
    
    if not stats_resp.data:
        supabase.table("stats").insert({"username": username, "streak": 0, "son_calisma": "2000-01-01"}).execute()
        user_stats = {"username": username, "streak": 0, "son_calisma": "2000-01-01"}
    else:
        user_stats = stats_resp.data[0]
        
    return cards_resp.data, user_stats

if "current_user" not in st.session_state or st.session_state.current_user != st.session_state.username:
    cards, stats = load_user_data(st.session_state.username)
    st.session_state.flashcards = cards
    st.session_state.stats = stats
    st.session_state.current_user = st.session_state.username
    st.session_state.card_index = 0
    st.session_state.show_answer = False

st.title(f"🧠 {st.session_state.username.capitalize()} Profili")

st.sidebar.write(f"🔥 Güncel Seri: {st.session_state.stats.get('streak', 0)} Gün")
st.sidebar.divider()

# YENİ EKLENEN KISIM: Fotoğraf Yükleme ve Yapay Zeka Entegrasyonu
with st.sidebar.expander("📸 Yapay Zeka ile Kart Ekle", expanded=True):
    uploaded_file = st.file_uploader("Notunuzun fotoğrafını yükleyin", type=["png", "jpg", "jpeg"])
    ai_ders = st.text_input("Ders (Örn: Anatomi):", value="Genel", key="ai_ders")
    
    if uploaded_file is not None:
        image = Image.open(uploaded_file)
        st.image(image, caption="Yüklenen Not", use_container_width=True)
        
        if st.button("✨ Soruyu ve Cevabı Çıkar"):
            with st.spinner("Notlar okunuyor..."):
                try:
                    prompt = "Bu tıp ders notu fotoğrafındaki en önemli bilgiyi bul ve tıp sınavlarında sorulabilecek sorular için flashcard için uygun bir 'Soru' ve kısa bir 'Cevap' çıkar. Lütfen sadece şu formatta yanıt ver:\nSoru: [Soru buraya]\nCevap: [Cevap buraya]"
                    response = model.generate_content([prompt, image])
                    
                    text = response.text
                    soru_kismi = text.split("Soru:")[1].split("Cevap:")[0].strip() if "Soru:" in text else text
                    cevap_kismi = text.split("Cevap:")[1].strip() if "Cevap:" in text else "Otomatik çıkarılamadı."
                    
                    yeni_kart = {
                        "username": st.session_state.username,
                        "soru": soru_kismi,
                        "cevap": cevap_kismi,
                        "ders": ai_ders
                    }
                    resp = supabase.table("cards").insert(yeni_kart).execute()
                    
                    if resp.data:
                        st.success("Yapay zeka kartı başarıyla ekledi!")
                        st.session_state.flashcards.append(resp.data[0])
                        
                except Exception as e:
                    st.error(f"Yapay zeka ile işlem yaparken bir hata oluştu: {e}")

# Manuel Ekleme Seçeneği
with st.sidebar.expander("✍️ Manuel Kart Ekle"):
    yeni_soru = st.text_area("Soru:")
    yeni_cevap = st.text_area("Cevap:")
    yeni_ders = st.text_input("Ders (Örn: Anatomi):", value="Genel", key="manuel_ders")
    if st.button("Kartı Kaydet"):
        if yeni_soru and yeni_cevap:
            yeni_kart = {
                "username": st.session_state.username,
                "soru": yeni_soru,
                "cevap": yeni_cevap,
                "ders": yeni_ders
            }
            resp = supabase.table("cards").insert(yeni_kart).execute()
            if resp.data:
                st.success("Kart profilinize eklendi!")
                st.session_state.flashcards.append(resp.data[0])
        else:
            st.error("Soru ve cevap alanları boş bırakılamaz.")

# Kartları Gösterme Mantığı
if not st.session_state.flashcards:
    st.warning("Henüz bu profilde eklenmiş bir kart yok. Sol menüyü kullanarak ilk kartınızı ekleyebilirsiniz!")
else:
    if st.session_state.card_index >= len(st.session_state.flashcards):
        st.session_state.card_index = 0

    kart = st.session_state.flashcards[st.session_state.card_index]
    
    st.subheader(f"📚 Ders: {kart['ders']}")
    
    with st.container(border=True):
        st.markdown(f"### **Soru:**\n{kart['soru']}")
        
        if st.session_state.show_answer:
            st.divider()
            st.markdown(f"### **Cevap:**\n{kart['cevap']}")

    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("👁️ Cevabı Göster/Gizle"):
            st.session_state.show_answer = not st.session_state.show_answer
            st.rerun()
            
    with col2:
        if st.button("✅ Bildim (Sonra Sor)"):
            supabase.table("cards").update({"durum": "ogren
