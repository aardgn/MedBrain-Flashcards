# MedBrain-Flashcards
An AI-powered spaced repetition flashcard app for medical students, built with Streamlit and Gemini API.
MedBrain Flashcards
Bu proje, tıp fakültesindeki yoğun ders yükünü ve karmaşık notları daha yönetilebilir hale getirmek için geliştirdiğim web tabanlı bir flashcard (çalışma kartı) uygulamasıdır.

Sistemi aslında bir arkadaşımın çalışma sürecini kolaylaştırmak ve aralıklı tekrar yöntemini dijitalleştirmek amacıyla tasarladım. Uygulama temelde el yazısı veya dijital ders notlarının fotoğrafını analiz ederek, içindeki en kritik bilgileri otomatik olarak soru-cevap formatına dönüştürüyor.

Öne Çıkan Özellikler

Otomatik Soru Üretimi: Sisteme yüklenen defter veya slayt fotoğrafları Gemini API kullanılarak analiz edilir ve anında çalışmaya hazır kartlar oluşturulur.

Aralıklı Tekrar Sistemi: Öğrenmeyi kalıcı hale getirmek için kartlar değerlendirilir. Bilemedim, Zordu veya Kolaydı butonlarına göre kartların bir sonraki ekrana gelme süresi algoritma tarafından belirlenir.

Seri (Streak) Takibi: Kullanıcıya günlük çalışma alışkanlığı kazandırmak ve motivasyonu yüksek tutmak için güncel seriyi takip eden bir mekanizma barındırır.

Kullanılan Teknolojiler

Python

Streamlit (Arayüz)

Google Gemini API (Görsel analiz ve metin üretimi)

SQLite (Lokal veritabanı yönetimi)
