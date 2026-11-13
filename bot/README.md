# Test boti — @RegistanAcademyYordamchiBot

Cloudflare Worker `registan-test-bot` (hisob: egasining Cloudflare hisobi), KV: `registan-test-kv`.
- Jadval: Dushanba — ingliz tili, Chorshanba — matematika, Juma — rus tili; 18:00–21:00 (Toshkent).
- 21:05 da (cron `5 16 * * 1,3,5` UTC) TOP-3 ga tabrik, adminga (5663766757) yakun.
- Admin (ADMINS) testni istalgan vaqtda sinab ko'ra oladi.
- Savollar KV da `quiz:<YYYY-MM-DD>` kalitida: {subject, level, topic, questions:[{q, o:[4], c, e}]}. Namunalar: quizzes/.
- Maxfiy: BOT_TOKEN (egasi Cloudflare da qo'ygan), WEBHOOK_SECRET. Repoga yozilmaydi.
- Joylash: Cloudflare API (api.cloudflare.com, token muhitda saqlangan), metadata `keep_bindings: ["secret_text"]` bilan — aks holda BOT_TOKEN o'chib ketadi.
