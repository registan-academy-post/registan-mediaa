# KANAL YURITISH — Registan Academy "Post" loyihasi

Egasi "post" yoki "kanal yuritish" deganda shu loyihani nazarda tutadi: @RegistanLC_Academy Telegram kanali postlari, dizayni va botlari.

- Loyiha sahifasi (tahlil va reja, pin qilingan): https://claude.ai/artifact/RkC3qPc8w7JgaDREmQyxxF
- Holat (2026-11-13): postlash TO'XTATILGAN. Obunachilarga eski dizayn (och bej fon, serif+kursiv aralash, faqat yozuv) yoqmadi.
  12:00/15:00/20:00 avtomatik vazifalar o'chirilgan, "Post to Telegram" workflow o'chirilgan, kit/RULES.md boshida PAUSED belgisi.
  Egasi yangi dizaynni tasdiqlamaguncha hech narsa postlanmaydi.
- Yangi reja: kuniga 3 post (09:00 foydali/yangilik, 13:00 markaz hayoti, 18:00 kunlik test).
- Namuna kanallar: t.me/registan_uchtepa, t.me/registan_uchtepa_farxadskiy
  (botlar: @registan_uchtepa_javobber_bot — test, @RegistanUchtepaYordamchiBot — darsga yozilish).

## Yangi dizayn qoidalari (namuna kanallardan)
- 2 asosiy rang: Registon to'q sariq #EA5A0C + oq; foto ustida qora; sariq faqat yorliq uchun.
- Shrift: sarlavha Inter Black, KATTA HARF, zich, 2-3 so'z; kichik matn Inter SemiBold. Serif va kursiv yo'q.
- 4:5 tik rasm: yuqori ~60% surat, pastda rangli blok: yorliq (pill) -> kichik qator -> ulkan sarlavha. Chap yuqorida oq REGISTON logotipi.
- Ko'p ko'riladigan postlar: real suratlar (g'oliblar, darslar, ustozlar), natija kartalari, test natijalari TOP-3.
- Odam (ustoz, o'quvchi) bor postlar YORUG' fonda: oq / och to'q sariq fon, orqada to'q sariq doira, yozuvlar pastdagi to'q sariq blokda. Qora/to'q fon ishlatilmaydi, odam aniq ko'rinishi kerak.
- Post rasmlarida pastda hech qanday username (@RegistanLC_Academy va h.k.) yozilmaydi. Telefon raqam mumkin.
- Testlar kanalda 5 ta poll emas: botda o'tadi, kanalga e'lon va natija chiqadi.

## Test boti
- @RegistanAcademyYordamchiBot, kod: bot/ (README ichida). Uchtepa filiallari botidek: kanal posti -> ?start=test_<id> -> Boshlash,
  10 savol / 15 daqiqa / bir marta, test oldingi kun 20:00 dan shu kun 20:00 gacha. Du matematika, Chor ingliz tili, Ju rus tili.
  Darajalar (3 daraja) egasining "xuddi filiallardagidek" talabi bilan olib tashlandi (17-noyabr) — bitta test, masalan A1–A2.

## Qayerda to'xtadik (2026-11-13) — keyingi safar shu yerdan davom etamiz
Bajarildi: raqobatchi kanallar tahlili, yangi dizayn (kit/design2, egasi ma'qulladi), test boti joylandi (Cloudflare),
Du/Chor/Ju jadvali, rus tili (13-noyabr) va ingliz tili (16-noyabr) savollari KV ga qo'yildi.
Qilinadigan ishlar:
1. Egasi bot setup havolasini ochib, botni sinab ko'rishi kerak (13-noyabr holatida hali hech kim /start qilmagan).
   Setup havolasi kaliti WEBHOOK_SECRET da (Cloudflare secret); kerak bo'lsa yangisini qo'yib, yangi havola berish mumkin.
2. Bot ULANDI (17-noyabr, egasi /start qildi). Egasi test botida: ID 7010322914 (@UchtepaAcademyManager). ADMINS = 7010322914,5663766757
   (5663766757 — post boti/inbox egasi, ehtimol egasining boshqa akkaunti).
3. Egasi testlar uchun kitoblar yuboradi (ingliz tili, matematika, rus tili; mundarija + joriy unitlar).
   17-noyabr: egasi kitoblarni @Registan_Academy_Post_bot ga yubordi. Repo OCHIQ (public), shuning uchun kitoblar repodan olib tashlandi
   va egasining Cloudflare KV `registan-books` (yopiq) ga `book:<fayl nomi>` kaliti bilan saqlandi (14 fayl). Endi inbox hujjatlarni repoga yuklamaydi (faqat file_id).
   20 MB dan katta 5 ta fayl yuklanmadi (index.jsonl da path null). Git tarixida kitoblar hali bor — tozalash egasining qaroriga bog'liq.
   Matematika mavzulari: bot/syllabus/matematika.md (Yosh matematiklar I-II, Milliy sertifikat).
4. KV dagi testlar: 20261118 ingliz tili A1–A2, 20261120 rus tili, 20261123 matematika.
   Hali yo'q: 25-noyabr ingliz tili, 27-noyabr rus tili, 30-noyabr matematika.
   17-noyabr holati: botdan hali hech kim foydalanmagan (KV da user: kaliti yo'q) — setup havolasi ochilmagan bo'lishi mumkin.
5. Kanalga avtomatik "Kunlik test" e'loni (18:00) va ertasi "Test natijalari" TOP-3 rasmi (5_test_natijalari shabloni).
6. Postlashni yangi dizayn bilan qayta yoqish: kuniga 3 post — faqat egasi "boshla" desa.
7. Ism tasdiqlandi: "MR JOHNS" (egasi, 17-noyabr; kartochkadagi "JHONS" xato). library/academy 06 va 07 egasining buyrug'i bilan o'chirildi (17-noyabr). Eslatma: library/academy 06 va 07 (Johnsning xato tahrirlangan surati) o'chirilsinmi/qayta yasalsinmi?
8. Egasidan ustozlar (oq fonda), darslar, g'oliblar suratlari kerak.
