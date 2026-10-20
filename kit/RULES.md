# Registan LC | Academy filiali — Telegram autoposting rules

These rules are the source of truth for every scheduled posting run. The owner
(Komronbek Yuldashev) set them; follow them exactly.

## Where to post
- Channel: `@RegistanLC_Academy` ONLY. Never post to `@Registan_LC` (the network's main channel).
- Owner's private chat with the bot: `5663766757`. Use it only for problems or to ask for material
  (e.g. "videolar tugadi, yangi video yuboring").
- Bot: `@Registan_Academy_Post_bot`, reached through the AnythingMCP connector
  (`anythingmcp_run_write_tool` with `telegram_bot_send_album`, `telegram_bot_send_photo`,
  `telegram_bot_send_message`, `telegram_bot_send_poll`, `telegram_bot_send_video`,
  `telegram_bot_get_updates`). The owner pre-authorized these scheduled posts; no confirmation needed
  inside a scheduled run.

## Images
1. Attach the repo with `add_repo` (owner `registan-academy-post`, repo `registan-mediaa`, access `push`),
   then `git clone --depth 1 https://github.com/registan-academy-post/registan-mediaa /home/claude/registan-mediaa`.
2. Write a spec JSON and render: `python3 kit/render.py spec.json posts/YYYY-MM-DD` (Tashkent date).
   Output is 2160x2700 JPEG, 4:5, under 5 MB.
3. Look at each rendered image once (Read tool) before posting: no overflow, no clipped text, no fallback fonts.
4. `git config user.name Claude; git config user.email noreply@anthropic.com`, commit, `git fetch origin main && git rebase origin/main`, push.
5. Public URL: `https://raw.githubusercontent.com/registan-academy-post/registan-mediaa/main/<path>`.
   Always use a new file name (never overwrite) so caches never serve an old picture.

### Brand rules (never break)
- Official logo `brand/logo_full.png`, top-left, unmodified. render.py already does this.
- "Academy filiali" alone at top-right, plain text, no frame. The @handle never sits next to it.
- `@RegistanLC_Academy` alone at bottom-left.
- Brand orange `#E84E0F`, light airy backgrounds. 5 styles in render.py: 1 editorial cream (Lora italic),
  2 bold white (Inter Black caps), 3 classic peach centered (Pagella), 4 split with orange band (Poppins),
  5 minimal frame (Baskerville). `<em>` in `text` highlights a phrase in orange.
- Rotate styles; never use the same style twice in a row in the same slot (check the log).
- Russian text: styles 1, 2 and 4 render Cyrillic best.

## Caption footer (append to every post caption, parse_mode HTML, exactly this)
```
📌 <a href="https://registan.edutizim.uz/order/entry/?survey=s33">https://registan.edutizim.uz/order/entry/?survey=s33</a>

📞 +998935512700

📱 <a href="https://t.me/Registan_LC">Follow us on social media</a>:

📱<a href="https://t.me/RegistanLC_Academy">Telegram</a>   📱<a href="https://instagram.com/registanlc_academy">Instagram</a>   📱<a href="https://goo.gl/maps/ziHA5ukgVtbGmwwR6">Location</a>
```
Separate the post body from the footer with one empty line. Whole caption ≤ 1024 visible characters.

## Voice
- Uzbek (Latin) + English mix; Russian only in the Russian slot. Short, energetic, warm, many but tasteful emoji.
- Audience: IELTS / General English learners of the Academy branch (teens and young adults) and their parents.
- 2–4 relevant hashtags at the end of the body, e.g. `#IELTS #RegistanAcademy #EnglishTips`.
- Facts must be correct. Quotes must be real and correctly attributed (skip anything commonly misattributed).
  Uzbek translations must be accurate and natural.
- Never: copyrighted characters, film stills, celebrity photos, politics, religion, other brands' content.

## Daily schedule (Asia/Tashkent)
- **08:00 Motivation** — album of 2 images (`telegram_bot_send_album`), caption on the first item.
  Two different real quotes on one theme (e.g. discipline, learning, starting the day), each in a different style,
  kind `quote`, with author and Uzbek translation in `sub`, tag "Daily Motivation". Caption: a short energetic
  good-morning message (2–4 lines) + hashtags + footer.
- **12:00 English** — one image (`telegram_bot_send_photo`) + detailed caption with genuinely useful English:
  rotate Word of the Day (meaning, Uzbek translation, example, synonyms), grammar rule with examples,
  IELTS Speaking/Writing tip, common mistakes ("Don't say / Say"), collocations, phrasal verbs, idioms.
  Image: kind `card`, eyebrow = topic, text = the key item, sub = one-line Uzbek hook, tag "English Tip".
- **15:00 Video** — videos come from the owner. Run `telegram_bot_get_updates`; keep every update whose
  `message.from.id` is 5663766757 and which has `video` (or `document` with mime video/*). Append each
  new file_id (with its caption, if any) to `log/videos.jsonl` with `"used": false` and push.
  Post the oldest unused video with `telegram_bot_send_video` (video = file_id) and an energetic caption
  (use the owner's caption if given) + footer, then mark it used and push.
  If no unused video exists: post one original, light, education-themed humour image instead
  (kind `card`, tag "Fun Break"; relatable student life, e.g. "IELTS kunidan oldingi kecha"), and send the
  owner a short private note: "15:00 uchun video qolmadi — botga yangi video yuboring 🎬".
- **20:00 Engagement** — by weekday: Mon/Thu **Math** (image with the problem + caption, then a
  `telegram_bot_send_poll` quiz with 4 options, `correct_option_id`, short Uzbek `explanation`);
  Tue/Fri/Sun **Russian** (a fun Russian phrase or question that invites comments, with Uzbek explanation,
  e.g. "Как бы вы ответили?"); Wed/Sat **Admission** (Academy branch IELTS / General English courses,
  free trial lesson, "IELTS 9.0 darajali o'qituvchilar", call to action with the link in the footer).

## Design library
`library/academy/` holds finished Academy posts the owner approved as on-brand; `library/references/` holds the
owner's reference posters (style ideas only — never post them, they carry other branches' contacts). For 20:00
Admission days you may post one of `library/academy/` images (rotate, check the log so the same one is not reused
within 14 days) instead of rendering a new card. Facts you may state about the branch: General English and IELTS
courses, Beginner and Elementary groups at 09:30, free trial lesson, teachers up to IELTS 9.0, Mr Johns
(English instructor, IELTS 7.5, 9 years, 2,700+ students). Do not invent prices, durations, dates or other courses.

## Owner videos
Use the owner's caption, but if it names a past month or date (e.g. "sentyabr oyi uchun qabul" in October) rewrite
that part to be current or remove it, and always replace the footer with the exact footer above. Keep any bot or
registration link the owner included.

## Log
Append one JSON line per post to `log/posted.jsonl`:
`{"date":"YYYY-MM-DD","slot":"08:00","style":[1,4],"topic":"...","quotes":["Author: first words..."],"message_ids":[...]}`
Before writing, read the last 120 lines and never repeat a quote, word, rule, problem or phrase used before.

## On failure
If posting fails, retry once. If it still fails, send the owner a short private message in Uzbek with what
failed. Never post a half-finished or broken post.
