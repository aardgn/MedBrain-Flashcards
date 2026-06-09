import streamlit as st
from supabase import create_client, Client
import datetime

# Sayfa Yapılandırması
st.set_page_config(page_title="MedBrain Flashcards", page_icon="🧠", layout="centered")

# Supabase Bağlantısı
url = st.secrets["SUPABASE_URL"]
key = st.secrets["SUPABASE_KEY"]
supabase: Client = create_client(url, key)

# Giriş Ekranı (Sol Menü)
st.sidebar.title("👤 Profil Girişi")
username_input = st.sidebar.text_input("Kullanıcı Adınız:", value="").strip().lower()

if not username_input:
    st.title("🧠 MedBrain Flashcards")
    st.info("Hoş geldiniz! Çalışmaya başlamak için lütfen sol menüden kendinize bir kullanıcı adı belirleyin veya mevcut adınızı girin.")
    st.stop()

# Kullanıcı adı girildiyse session_state'e kaydet
st.session_state.username = username_input

# Veritabanından Kullanıcı Verilerini Çekme Fonksiyonları
def load_user_data(username):
    cards_resp = supabase.table("cards").select("*").eq("username", username).execute()
    stats_resp = supabase.table("stats").select("*").eq("username", username).execute()
    
    if not stats_resp.data:
        supabase.table("stats").insert({"username": username, "streak": 0, "son_calisma": "2000-01-01"}).execute()
        user_stats = {"username": username, "streak": 0, "son_calisma": "2000-01-01"}
    else:
        user_stats = stats_resp.data[0]
        
    return cards_resp.data, user_stats

# Verileri Yükle
if "current_user" not in st.session_state or st.session_state.current_user != st.session_state.username:
    cards, stats = load_user_data(st.session_state.username)
    st.session_state.flashcards = cards
    st.session_state.stats = stats
    st.session_state.current_user = st.session_state.username
    st.session_state.card_index = 0
    st.session_state.show_answer = False

# Ana Uygulama Ekranı
st.title(f"🧠 {st.session_state.username.capitalize()} Profili")

# Sol Menü Bilgileri
st.sidebar.write(f"🔥 Güncel Seri: {st.session_state.stats.get('streak', 0)} Gün")
st.sidebar.divider()

# Yeni Kart Ekleme Bölümü
with st.sidebar.expander("➕ Yeni Kart Ekle"):
    yeni_soru = st.text_area("Soru:")
    yeni_cevap = st.text_area("Cevap:")
    yeni_ders = st.text_input("Ders (Örn: Anatomi):", value="Genel")
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
            supabase.table("cards").update({"durum": "ogrenildi"}).eq("id", kart["id"]).execute()
            
            bugun = str(datetime.date.today())
            if st.session_state.stats["son_calisma"] != bugun:
                yeni_streak = st.session_state.stats["streak"] + 1
                supabase.table("stats").update({"streak": yeni_streak, "son_calisma": bugun}).eq("username", st.session_state.username).execute()
                st.session_state.stats["streak"] = yeni_streak
                st.session_state.stats["son_calisma"] = bugun
            
            st.session_state.card_index = (st.session_state.card_index + 1) % len(st.session_state.flashcards)
            st.session_state.show_answer = False
            st.rerun()

    with col3:
        if st.button("❌ Bilemedim (Tekrar Göster)"):
            st.session_state.card_index = (st.session_state.card_index + 1) % len(st.session_state.flashcards)
            st.session_state.show_answer = False
            st.rerun()
