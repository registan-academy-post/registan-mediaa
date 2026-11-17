// Registan Academy — test boti (Du: matematika, Chor: ingliz tili, Ju: rus tili) (Cloudflare Worker, Telegram webhook)
// KV kalitlari:
//   user:<uid>              {name, username, state, joined}
//   quiz:<YYYY-MM-DD>       {subject, level, topic, questions:[...]}  yoki darajali:
//                           {subject, levels:[{id, name, topic, questions:[{q, o:[4], c:0-3, e}]}]}
//   att:<date>:<uid>        {i, ans:[], start, end, score, time, done}
//   res:<date>:<uid>        "" (metadata: {name, score, time, lvl})  — natijalar ro'yxati uchun

const TZ_OFFSET = 5 * 3600 * 1000; // Toshkent UTC+5
const LETTERS = ["A", "B", "C", "D"];

const today = (t = Date.now()) => new Date(t + TZ_OFFSET).toISOString().slice(0, 10);
const tashHour = (t = Date.now()) => new Date(t + TZ_OFFSET).getUTCHours();
const tashDay = (t = Date.now()) => new Date(t + TZ_OFFSET).getUTCDay(); // 0=yakshanba, 6=shanba
const DAY_NAMES = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
const testDays = (env) => String(env.TEST_DAYS ?? "1,3,5").split(",").map(Number);
const isTestDay = (env) => testDays(env).includes(tashDay());
const daysText = (env) => testDays(env).map(d => DAY_NAMES[d]).join(", ");
const fmtTime = (ms) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function tg(env, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  return r.json();
}
const send = (env, chat_id, text, extra = {}) => tg(env, "sendMessage", { chat_id, text, parse_mode: "HTML", ...extra });
const getJ = async (env, k) => { const v = await env.KV.get(k); return v ? JSON.parse(v) : null; };
const putJ = (env, k, v, opt) => env.KV.put(k, JSON.stringify(v), opt);
const isAdmin = (env, uid) => String(env.ADMINS || "").split(",").map(s => s.trim()).includes(String(uid));

// darajali testdan bitta darajani ajratib olish
function pack(quiz, lvl) {
  if (!quiz.levels) return { subject: quiz.subject, level: quiz.level, topic: quiz.topic, questions: quiz.questions, lvl: null };
  const L = quiz.levels.find(x => x.id === lvl) || quiz.levels[0];
  return { subject: quiz.subject, level: L.name, topic: L.topic, questions: L.questions, lvl: L.id };
}
const MENU = { reply_markup: { inline_keyboard: [[{ text: "📝 Testni boshlash", callback_data: "start_test" }], [{ text: "🏆 Natijalar", callback_data: "top" }]] } };

// ---------- test oqimi ----------
// Foydalanuvchini Telegram ismidan avtomatik yaratish (ism so'ralmaydi)
async function ensureUser(env, from) {
  let user = await getJ(env, `user:${from.id}`);
  if (!user || !user.name) {
    const name = [from.first_name, from.last_name].filter(Boolean).join(" ").slice(0, 40) || "O‘quvchi";
    user = { ...(user || {}), joined: user?.joined || Date.now(), name, username: from.username || null, state: null };
    await putJ(env, `user:${from.id}`, user);
  }
  return user;
}
// Bitta xabarni yangilab borish: msgId bo'lsa tahrirlaydi, bo'lmasa yangi yuboradi
function show(env, chat, msgId, text, kb) {
  const extra = kb ? { reply_markup: { inline_keyboard: kb } } : {};
  if (msgId) return tg(env, "editMessageText", { chat_id: chat, message_id: msgId, text, parse_mode: "HTML", ...extra });
  return send(env, chat, text, extra);
}
function questionView(Q, i, note = "") {
  const q = Q.questions[i];
  const text = (note ? note + "\n\n" : "") + `<b>${esc(Q.subject)}</b> · ${esc(Q.level)}\n❓ <b>${i + 1}/${Q.questions.length}</b>\n\n${esc(q.q)}`;
  const kb = q.o.map((o, k) => [{ text: o.length > 60 ? o.slice(0, 57) + "…" : o, callback_data: `a:${i}:${k}` }]);
  return [text, kb];
}

async function startTest(env, from, chat, lvl = null, msgId = null) {
  const uid = from.id;
  await ensureUser(env, from);
  const d = today(), h = tashHour();
  const open = Number(env.OPEN_HOUR ?? 0), close = Number(env.CLOSE_HOUR ?? 24);
  if (!isAdmin(env, uid) && (!isTestDay(env) || h < open || h >= close)) {
    return show(env, chat, msgId, `⏰ Testlar har <b>${daysText(env)}</b> kuni <b>${open}:00 dan ${close}:00 gacha</b> bo‘ladi.\nO‘sha vaqtda shu yerga kiring!`, MENU.reply_markup.inline_keyboard);
  }
  const quiz = await getJ(env, `quiz:${d}`);
  if (!quiz) return show(env, chat, msgId, "📭 Bugungi test hali joylanmagan. Kanalda e’lonni kuting!");
  const att = await getJ(env, `att:${d}:${uid}`);
  if (att && att.done) { const Q = pack(quiz, att.lvl); return show(env, chat, msgId, `✅ Siz bugungi testni ishlab bo‘lgansiz: <b>${att.score}/${Q.questions.length}</b> (${fmtTime(att.time)}).\nKeyingi testda ham omad!`, MENU.reply_markup.inline_keyboard); }
  if (att) { const [t, kb] = questionView(pack(quiz, att.lvl), att.i); return show(env, chat, msgId, t, kb); }
  if (quiz.levels && lvl == null) {
    const kb = quiz.levels.map(L => [{ text: L.name, callback_data: `lvl:${L.id}` }]);
    return show(env, chat, msgId, `📝 <b>${esc(quiz.subject)}</b> testi\n\nDarajangizni tanlang 👇`, kb);
  }
  const Q = pack(quiz, lvl);
  await putJ(env, `att:${d}:${uid}`, { i: 0, ans: [], start: Date.now(), done: false, lvl: Q.lvl }, { expirationTtl: 60 * 60 * 24 * 40 });
  const [t, kb] = questionView(Q, 0, `🚀 ${Q.questions.length} ta savol. Vaqt ketdi!`);
  return show(env, chat, msgId, t, kb);
}

async function onAnswer(env, cb, i, k) {
  const uid = cb.from.id, chat = cb.message.chat.id, mid = cb.message.message_id, d = today();
  const raw = await getJ(env, `quiz:${d}`);
  const att = await getJ(env, `att:${d}:${uid}`);
  const quiz = raw && att ? pack(raw, att.lvl) : null;
  if (!quiz || !att || att.done || att.i !== i) { await tg(env, "answerCallbackQuery", { callback_query_id: cb.id }); return; }
  const q = quiz.questions[i], ok = k === q.c;
  att.ans.push(k); att.i = i + 1;
  await tg(env, "answerCallbackQuery", { callback_query_id: cb.id, text: ok ? "✅ To‘g‘ri!" : `❌ To‘g‘ri javob: ${q.o[q.c]}`.slice(0, 190) });
  const note = ok ? "✅ To‘g‘ri!" : `❌ Noto‘g‘ri. To‘g‘ri javob: <b>${esc(q.o[q.c])}</b>`;
  if (att.i < quiz.questions.length) {
    await putJ(env, `att:${d}:${uid}`, att, { expirationTtl: 60 * 60 * 24 * 40 });
    const [t, kb] = questionView(quiz, att.i, note);
    return show(env, chat, mid, t, kb);
  }
  // tugadi
  att.done = true; att.end = Date.now(); att.time = att.end - att.start;
  att.score = att.ans.reduce((s, a, n) => s + (a === quiz.questions[n].c ? 1 : 0), 0);
  await putJ(env, `att:${d}:${uid}`, att, { expirationTtl: 60 * 60 * 24 * 40 });
  const user = await ensureUser(env, cb.from);
  await env.KV.put(`res:${d}:${uid}`, "", { metadata: { name: user.name, score: att.score, time: att.time, lvl: att.lvl || null }, expirationTtl: 60 * 60 * 24 * 40 });
  const wrong = quiz.questions.map((qq, n) => ({ qq, n, a: att.ans[n] })).filter(x => x.a !== x.qq.c);
  let text = `🏁 <b>Test tugadi!</b>\n\nNatija: <b>${att.score}/${quiz.questions.length}</b> · Vaqt: <b>${fmtTime(att.time)}</b>\n`;
  text += att.score === quiz.questions.length ? "\n🔥 Ajoyib! Hammasi to‘g‘ri!" : `\n📚 <b>Xatolaringiz:</b>\n` +
    wrong.map(x => `\n<b>${x.n + 1}.</b> ${esc(x.qq.q)}\n✅ ${esc(x.qq.o[x.qq.c])}\n💡 ${esc(x.qq.e)}`).join("\n");
  text += `\n\n🏆 G‘oliblar soat ${env.CLOSE_HOUR ?? 21}:00 dan keyin e’lon qilinadi.`;
  return show(env, chat, mid, text.slice(0, 4000), MENU.reply_markup.inline_keyboard);
}

// ---------- natijalar ----------
async function results(env, d) {
  const out = []; let cursor;
  do {
    const r = await env.KV.list({ prefix: `res:${d}:`, cursor });
    for (const k of r.keys) if (k.metadata) out.push({ uid: k.name.split(":")[2], ...k.metadata });
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  out.sort((a, b) => b.score - a.score || a.time - b.time);
  return out;
}
const medal = (n) => ["🥇", "🥈", "🥉"][n] || `${n + 1}.`;
// natijalarni darajalar bo'yicha guruhlash: [{name, rows}]
async function grouped(env, d) {
  const r = await results(env, d);
  const quiz = await getJ(env, `quiz:${d}`);
  if (!quiz || !quiz.levels) return [{ name: null, rows: r }];
  return quiz.levels.map(L => ({ name: L.name, rows: r.filter(x => x.lvl === L.id) })).filter(g => g.rows.length);
}
async function sendTop(env, chat, d = today()) {
  const gs = await grouped(env, d);
  const total = gs.reduce((s, g) => s + g.rows.length, 0);
  if (!total) return send(env, chat, "Hozircha bu testni hech kim ishlamagan.");
  const body = gs.map(g => (g.name ? `\n<b>${esc(g.name)}</b>\n` : "\n") + g.rows.slice(0, 10).map((x, n) => `${medal(n)} ${esc(x.name)} — <b>${x.score}</b> (${fmtTime(x.time)})`).join("\n")).join("\n");
  return send(env, chat, `🏆 <b>${d} natijalari</b>\nQatnashdi: ${total} nafar\n${body}`);
}

// ---------- ro'yxatdan o'tish ----------
async function askName(env, uid, chat) {
  const user = (await getJ(env, `user:${uid}`)) || { joined: Date.now() };
  user.state = "await_name";
  await putJ(env, `user:${uid}`, user);
  return send(env, chat, "Natijalarda ko‘rinadigan ism-familiyangizni yozing (masalan: <i>Aziza Karimova</i>).");
}

async function onMessage(env, m) {
  const uid = m.from.id, chat = m.chat.id, text = (m.text || "").trim();
  if (m.chat.type !== "private") return;
  if (text.startsWith("/start") || text === "/test") {
    await ensureUser(env, m.from);
    if (text === "/start") await send(env, chat, "👋 Assalomu alaykum! <b>Registan Academy</b> test boti.");
    return startTest(env, m.from, chat);
  }
  if (text === "/top") return sendTop(env, chat);
  if (text === "/ism") return askName(env, uid, chat);
  if (text === "/id") return send(env, chat, `Sizning ID: <code>${uid}</code>`);
  if (text === "/stats" && isAdmin(env, uid)) {
    const r = await results(env, today());
    return send(env, chat, `📊 Bugun (${today()}): ${r.length} nafar testni tugatdi.`);
  }
  const user = await getJ(env, `user:${uid}`);
  if (user && user.state === "await_name") {
    const name = text.replace(/\s+/g, " ").slice(0, 40);
    if (name.length < 3 || name.startsWith("/")) return send(env, chat, "Iltimos, ism va familiyangizni yozing.");
    user.name = name; user.username = m.from.username || null; user.state = null;
    await putJ(env, `user:${uid}`, user);
    return send(env, chat, `✅ Ism saqlandi: <b>${esc(name)}</b>`, MENU);
  }
  return send(env, chat, "Testni boshlash uchun tugmani bosing 👇", MENU);
}

// ---------- kechki yakun: g'oliblarni tabriklash ----------
async function dailyWrap(env) {
  const d = today();
  const gs = await grouped(env, d);
  const r = gs.flatMap(g => g.rows);
  const admins = String(env.ADMINS || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!r.length) { for (const a of admins) await send(env, a, `📊 ${d}: testni hech kim ishlamadi.`); return; }
  const minScore = Number(env.MIN_SCORE ?? 5); // sovg'a uchun eng kam ball
  for (const g of gs) for (const [n, x] of g.rows.slice(0, 3).entries()) {
    if (x.score < minScore) continue;
    await send(env, x.uid, `${medal(n)} <b>Tabriklaymiz, ${esc(x.name)}!</b>\n\nSiz bugungi testda${g.name ? " (" + esc(g.name) + ")" : ""} <b>${n + 1}-o‘rinni</b> egalladingiz: ${x.score} ball, ${fmtTime(x.time)}.\n\n🎁 Sizga <b>Registan sertifikati</b> va <b>bepul sinov darsi</b>! Markazimiz administratori siz bilan bog‘lanadi.`);
  }
  const body = gs.map(g => (g.name ? `\n<b>${esc(g.name)}</b>\n` : "\n") + g.rows.slice(0, 10).map((x, n) => `${medal(n)} ${esc(x.name)} — ${x.score} (${fmtTime(x.time)})`).join("\n")).join("\n");
  for (const a of admins) await send(env, a, `📊 <b>${d} test yakuni</b>\nQatnashdi: ${r.length} nafar\n${body}`);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/tg" && req.method === "POST") {
      if (req.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.WEBHOOK_SECRET) return new Response("forbidden", { status: 403 });
      const u = await req.json();
      try {
        if (u.message) await onMessage(env, u.message);
        else if (u.callback_query) {
          const cb = u.callback_query, data = cb.data || "";
          if (data === "start_test") { await tg(env, "answerCallbackQuery", { callback_query_id: cb.id }); await startTest(env, cb.from, cb.message.chat.id, null, cb.message.message_id); }
          else if (data === "top") { await tg(env, "answerCallbackQuery", { callback_query_id: cb.id }); await sendTop(env, cb.message.chat.id); }
          else if (data.startsWith("lvl:")) { await tg(env, "answerCallbackQuery", { callback_query_id: cb.id }); await startTest(env, cb.from, cb.message.chat.id, data.slice(4), cb.message.message_id); }
          else if (data.startsWith("a:")) { const [, i, k] = data.split(":").map(Number); await onAnswer(env, cb, i, k); }
        }
      } catch (e) { console.log("error", e.stack || e); }
      return new Response("ok");
    }
    if (url.pathname === "/setup") {
      if (url.searchParams.get("key") !== env.WEBHOOK_SECRET) return new Response("forbidden", { status: 403 });
      const hook = await tg(env, "setWebhook", { url: `${url.origin}/tg`, secret_token: env.WEBHOOK_SECRET, allowed_updates: ["message", "callback_query"] });
      await tg(env, "setMyCommands", { commands: [
        { command: "test", description: "Testni boshlash" },
        { command: "top", description: "Test natijalari" },
        { command: "ism", description: "Natijadagi ismni o‘zgartirish" } ] });
      const me = await tg(env, "getMe", {});
      const ok = hook.ok && me.ok;
      return new Response(`<meta charset="utf-8"><body style="font:20px system-ui;padding:40px">${ok ? "✅ Bot ulandi: @" + me.result.username + "<br><br>Endi Telegramda botga /start yozing." : "❌ Xato: " + esc(JSON.stringify(hook))}</body>`, { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    return new Response("Registan Academy test bot ishlayapti ✅", { headers: { "content-type": "text/plain; charset=utf-8" } });
  },
  async scheduled(event, env, ctx) { if (isTestDay(env)) ctx.waitUntil(dailyWrap(env)); },
};
