# ⛔ POSTING PAUSED (2026-11-13, owner's order)
The owner stopped ALL posting to @RegistanLC_Academy: subscribers disliked the current design.
Any scheduled run that reads this: do NOT render images, do NOT write queue files, do NOT post.
Just exit and report "posting paused". A new design and schedule (3 posts a day) will replace these rules.

# Registan LC | Academy filiali — Telegram autoposting rules

These rules are the source of truth for every scheduled posting run. The owner
(Komronbek Yuldashev) set them; follow them exactly.

## Where to post
- Channel: `@RegistanLC_Academy` ONLY. Never post to `@Registan_LC` (the network's main channel).
- Owner's private chat with the bot: `5663766757`. Use it only for problems or to ask for material
  (e.g. "videolar tugadi, yangi video yuboring").
- Bot: `@Registan_Academy_Post_bot`. You do NOT call Telegram yourself and you do NOT use AnythingMCP.
  You post by committing a queue file; GitHub Actions (`.github/workflows/post.yml`, `tools/tg_post.py`)
  sends it within ~1 minute of your push using the TELEGRAM_BOT_TOKEN repo secret. The owner pre-authorized
  these scheduled posts; no confirmation needed inside a scheduled run.

## How to post (queue)
Write `queue/pending/<YYYY-MM-DD>-<HHMM>-<slug>.json`, commit it together with its images, push:
```json
{"id":"2026-10-22-0800-motivation",
 "steps":[{"method":"sendMediaGroup","params":{"chat_id":"@RegistanLC_Academy","media":[
   {"type":"photo","media":"https://raw.githubusercontent.com/registan-academy-post/registan-mediaa/main/posts/2026-10-22/a.jpg","caption":"...","parse_mode":"HTML"},
   {"type":"photo","media":"https://raw.githubusercontent.com/registan-academy-post/registan-mediaa/main/posts/2026-10-22/b.jpg"}]}}]}
```
- `method` and `params` are plain Telegram Bot API (sendPhoto, sendMediaGroup, sendMessage, sendPoll, sendVideo).
  Steps run in order (e.g. sendPhoto then sendPoll). Only `@RegistanLC_Academy` and the owner `5663766757`
  are accepted as chat_id.
- After pushing, wait (poll `git fetch` every 10 s, up to 4 min) until the file appears in `queue/sent/` or
  `queue/failed/`. `queue/sent/<file>` contains Telegram's `results` (message ids for the log).
  If it lands in `queue/failed/`, read the error, fix the item, and queue it once more with a new id.
  The workflow itself already tells the owner about failures.
- Validate the JSON (`python3 -m json.tool`) before committing. Telegram HTML allows only
  b, i, u, s, a, code, pre, blockquote; escape stray `<`, `>`, `&`.

## Owner's media inbox
`.github/workflows/inbox.yml` runs every 30 minutes and stores what the owner sends to the bot:
`inbox/index.jsonl` (one line per item: type photo/video, file_id, path or null if >20 MB, caption, date,
duration/width/height, used) and the files in `inbox/photos/`, `inbox/videos/`. Videos can be posted by
`file_id` (no upload needed); downloaded files can be edited with ffmpeg / used in designs.

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
- Brand orange `#E84E0F`, light airy backgrounds. 6 styles in render.py: 1 editorial cream (Lora italic),
  2 bold white (Inter Black caps), 3 classic peach centered (Pagella), 4 split with orange band (Poppins),
  5 minimal frame (Baskerville), 6 news card (cream, orange eyebrow, huge Inter Black title; for the 08:00
  Morning post, see 'Morning post style'). `<em>` in `text` highlights a phrase in orange.
- Rotate styles; never use the same style twice in a row in the same slot (check the log).
- Russian text: styles 1, 2 and 4 render Cyrillic best.

## Caption footer (append to every post caption, parse_mode HTML, exactly this)
```
📌 <a href="https://registan.edutizim.uz/order/entry/?survey=s33">Bepul darsga yozilish</a>

📞 +998935512700

📱 <a href="https://t.me/Registan_LC">Follow us on social media</a>:

📱<a href="https://t.me/RegistanLC_Academy">Telegram</a>   📱<a href="https://instagram.com/registanlc_academy">Instagram</a>   📱<a href="https://goo.gl/maps/ziHA5ukgVtbGmwwR6">Location</a>
```
Separate the post body from the footer with one empty line. Whole caption ≤ 1024 visible characters.

## Inline buttons
Every `sendPhoto`, `sendMessage` and `sendVideo` step to the channel also gets `reply_markup` with one row of two
URL buttons (in addition to the footer):
```json
"reply_markup": {"inline_keyboard": [[
  {"text": "✍️ Bepul darsga yozilish", "url": "https://registan.edutizim.uz/order/entry/?survey=s33"},
  {"text": "📍 Xaritada ochish", "url": "https://goo.gl/maps/ziHA5ukgVtbGmwwR6"}]]}
```
- Write `reply_markup` as a normal nested JSON object inside `params`, NOT as a JSON string. `tools/tg_post.py`
  sends the whole `params` as a JSON request body (`Content-Type: application/json`), so Telegram receives the
  object as is.
- `sendMediaGroup` cannot carry buttons: albums keep only the footer. `sendPoll` steps get no buttons.

## Voice (must read like a real person from the branch wrote it)
The owner does not want readers to feel posts are machine-made. Write like the branch's own SMM person:
- NO hashtags. Ever.
- Natural, conversational Uzbek (Latin) the way people in Tashkent actually write in Telegram; English only for the
  actual English material. Russian only in the Russian slot.
- Vary the shape every time: sometimes one or two lines, sometimes a short story, a question, a mini-dialogue,
  a list only when it truly helps. Never reuse the same skeleton two posts in a row.
- Emoji: 0–3 per post, never one per line, never as bullet markers.
- No labelled headers like "Meaning:", "Tarjima:", "Examples:", "Tip:", "Fun Break", "Did you know?",
  "Phrasal verb of the day". Weave the explanation into normal sentences.
- No em dashes (—); use commas, colons or full stops. No "!!!", no ALL CAPS sentences.
- Do not over-explain; one clear idea per post. Sound warm and confident, not salesy.
- Address parents and students as "siz"; light humour is fine.
- Facts must be correct. Quotes must be real and verifiably said/written by that person (skip proverbs and
  sayings that are only traditionally attributed). Uzbek translations accurate and natural.
- Never invent people, students, results or teacher quotes. Never mention AI, automation or bots.
- Never: copyrighted characters, film stills, celebrity photos, politics, religion, other brands' content.

### Image text
- No English template labels on images ("DAILY MOTIVATION", "ENGLISH TIP", "FUN BREAK", "DID YOU KNOW?").
  Use a short Uzbek label or none. The `tag` and `eyebrow` fields may be empty strings.
- Minimum readable size: nothing on the image smaller than ~28px at 1080 width.
- Vary layouts: never the same render style twice in one day.

## Daily schedule (Asia/Tashkent)
- **08:00 Morning post**: a rich, useful post in the style other Registan branches use (see 'Morning post style').
  Thursdays: Speaking Club poster instead (see 'Speaking Club (Thursday 08:00)').
- **12:00 English** — one image (`sendPhoto`) + detailed caption with genuinely useful English:
  rotate Word of the Day (meaning, Uzbek translation, example, synonyms), grammar rule with examples,
  IELTS Speaking/Writing tip, common mistakes ("Don't say / Say"), collocations, phrasal verbs, idioms.
  Image: kind `card`, eyebrow = topic, text = the key item, sub = one-line Uzbek hook, short Uzbek tag or none.
- **15:00 Quiz** — daily 5-question English quiz exactly as `kit/QUIZ.md` describes (intro message + 5 quiz polls).
  Owner videos are posted only if the owner explicitly asks for a specific video; never otherwise.
- **20:00 Engagement** — by weekday: Mon/Thu **Math** (image with the problem + caption, then a
  `sendPoll` quiz (type "quiz") with 4 options, `correct_option_id`, short Uzbek `explanation`);
  Tue/Fri/Sun **Russian** (a fun Russian phrase or question that invites comments, with Uzbek explanation,
  e.g. "Как бы вы ответили?"); Wed/Sat **Admission** (Academy branch IELTS / General English courses,
  free trial lesson, "IELTS 9.0 darajali o'qituvchilar", call to action with the link in the footer).

## Morning post style
At the owner's request this section overrides the Voice rules on emoji and bold labels, for the 08:00 slot only.
- One `sendPhoto` with the inline buttons above.
- Image: `kit/render.py` style 6 (news card), kind `card`: light cream background, small orange letter-spaced
  Uzbek `eyebrow` (e.g. TA'LIM YANGILIKLARI, IELTS, OTA-ONALAR UCHUN, CHET ELDA O'QISH), `text` = a very big bold
  title of 2-4 words (`<em>` for one orange word), `sub` = one line. Brand rules unchanged (logo top-left,
  'Academy filiali' top-right, @RegistanLC_Academy bottom-left).
- Caption (HTML), in this order:
  1. First line bold with one emoji, e.g. `<b>🎓 ...</b>`.
  2. `<blockquote>` one-line hook for students or parents.
  3. 3-4 lines, each starting with ✅ then a bold short phrase and one sentence: `✅ <b>Qisqa ibora:</b> bir gap.`
  4. A source link (`<a href="...">Manba</a>`) whenever facts come from news.
  5. One engaging question to the comments.
  6. The footer.
- Rotate topics (check the log, never two days in a row on the same topic): real education news in Uzbekistan
  or abroad, IELTS and exam facts, study abroad and grants, useful advice for parents, English learning tips.
- News must be real and recent: verify with WebSearch, cite the source, never invent numbers. Facts must be correct.
- Whole caption still ≤ 1024 visible characters.

## Speaking Club (Thursday 08:00)
On these dates the 08:00 slot posts the Speaking Club poster instead of the usual morning post:

| Post date (08:00) | Poster file | Club day | Time |
|---|---|---|---|
| 2026-11-07 (Saturday, one-off) | speaking-club-2026-11-08.jpg | Sun 2026-11-08 | 10:00 |
| 2026-11-12 | speaking-club-2026-11-15.jpg | Sun 2026-11-15 | 10:00 |
| 2026-11-19 | speaking-club-2026-11-22.jpg | Sun 2026-11-22 | 10:00 |
| 2026-11-26 | speaking-club-2026-11-29.jpg | Sun 2026-11-29 | 10:00 |
| 2026-12-03 | speaking-club-2026-12-06.jpg | Sun 2026-12-06 | 09:30 |
| 2026-12-10 | speaking-club-2026-12-13.jpg | Sun 2026-12-13 | 09:30 |
| 2026-12-17 | speaking-club-2026-12-20.jpg | Sun 2026-12-20 | 09:30 |
| 2026-12-24 | speaking-club-2026-12-27.jpg | Sun 2026-12-27 | 09:30 |

- One `sendPhoto` with the inline buttons. Photo:
  `https://raw.githubusercontent.com/registan-academy-post/registan-mediaa/main/library/speaking-club/speaking-club-<Sunday date>.jpg`
  (do not re-render or edit the poster).
- Caption: invite to the Speaking Club on Sunday <date> at <time>, place: Registan Academy Branch; then the footer.
- Each poster is posted only once: check `log/posted.jsonl` (topic `speaking-club <Sunday date>`) before posting.
- If the poster file is missing from `library/speaking-club/`, do the usual morning post instead and message the
  owner (`5663766757`) asking for the poster.

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
`{"date":"YYYY-MM-DD","slot":"08:00","style":[1,4],"topic":"...","quotes":["Author: first words..."],"queue":"queue/sent/<file>","message_ids":[...]}`
Before writing, read the last 120 lines and never repeat a quote, word, rule, problem or phrase used before.

## On failure
If an item lands in queue/failed, fix and requeue once with a new id. If it fails again, stop (the owner was
already notified by the workflow). Never post a half-finished or broken post.
