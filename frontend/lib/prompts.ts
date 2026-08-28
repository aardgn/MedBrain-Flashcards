export const FLASHCARD_PROMPT = `
Bu bir tıp öğrencisinin ders notu, PDF'i veya sunumudur.

Görevin:
- Kaynaktaki önemli ve sınav değeri yüksek tıbbi bilgileri tespit etmek
- Bu bilgilerden tıp fakültesi / TUS benzeri kaliteli AÇIK UÇLU çalışma
  soruları üretmek
- Soruları SADECE kaynak içerikte açıkça desteklenen bilgilerle
  oluşturmak

Eğer doküman okunamıyorsa, anlamsızsa veya yeterli tıbbi içerik
içermiyorsa SADECE:
REJECT
yaz.

Bunun dışında çıktı SADECE geçerli bir JSON array olmalıdır. JSON
dışında hiçbir açıklama, markdown veya ek metin yazma.

SORU TARZI
Sorular Türkiye'deki TUS/KTBT sınavlarındaki klinik vaka sorularının
ruhuna benzemeli: gerçek bir hastayla karşılaşmış gibi hissettiren,
doğal akan bir anlatım. Ama bunu katı bir şablon gibi uygulama - sabit
bir sıralama veya sabit cümle kalıpları kullanma. Bazı sorularda sadece
kısa bir bulgu yeterli olabilir, bazılarında öykü + muayene + tetkik
birlikte gerekebilir. Kaynağın izin verdiği kadarını, konuya en uygun
şekilde ve her seferinde farklı bir dille kur. Art arda gelen sorularda
aynı açılış cümlesini, aynı soru kökünü veya aynı yapıyı tekrarlama;
doğal dil çeşitliliği kullan.

Yaş, cinsiyet, semptom, öykü, muayene bulgusu, laboratuvar/görüntüleme
değeri gibi klinik ayrıntılar SADECE kaynak tarafından destekleniyorsa
kullanılabilir. Kaynakta olmayan hiçbir klinik detayı, hastalığı,
ilacı, mutasyonu veya bulguyu uydurma.

DEKORATİF VAKA YASAK
Sadece "Bir hastada...", "Bir bireyde..." gibi ifadeler ekleyerek düz
bir tanım sorusunu klinik soru gibi göstermek yasaktır. Kendine şu
kontrolü uygula: "Vinyetteki bilgileri kaldırsam soru aynı kolaylıkla
cevaplanabiliyor mu?" Cevap evetse bu dekoratif bir vakadır - ya vinyeti
kaldır ve doğrudan kaliteli bir soru sor, ya da vinyeti gerçekten
gerekli hale getirecek şekilde yeniden kur.

TEK DOĞRU CEVAP GARANTİSİ
Bu sorular şıksız olacağı için cevap kaynak içerikte tek ve net olmalı.
Eğer kurduğun vinyetten kaynağa dayanarak birden fazla makul cevap
çıkabiliyorsa, o vinyeti kullanma - cevabı tartışmasız olan bir soru
üret.

ZORLUK
Mümkün olduğunca tek bir ezber bilgiyle veya bariz şekilde
cevaplanabilen sorulardan kaçın. Kaynak yeterliyse birden fazla bilgiyi
aynı soruda birleştir. Sorunun uzun olması tek başına zor olduğu
anlamına gelmez - gereksiz ayrıntı ekleme.

CEVAP
Cevap kısa ve net olmalı (bir tanı adı, bir mekanizma adı, bir tetkik
adı gibi - uzun cümle olmamalı).

KALİTE KONTROLÜ (üretmeden önce kendine sor)
- Cevap tamamen kaynaktan destekleniyor mu?
- Cevap tek ve tartışmasız mı?
- Soru tıp öğrencisi seviyesinde mi, çok kolay mı?
- Vaka varsa vaka bilgileri gerçekten gerekli mi (dekoratif değil mi)?
- Aynı soru kökü/yapı bir önceki soruyla tekrar mı ediyor?
Kalitesi düşük ya da tekrar eden soruyu üretme.

JSON FORMAT:
[
  {
    "soru": "Soru metni",
    "cevap": "Beklenen doğru cevap (kısa)"
  }
]
`.trim()
