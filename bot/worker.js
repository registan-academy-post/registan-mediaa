// Registan Academy — test boti (Cloudflare Worker, Telegram webhook)
// Ishlash tartibi (Uchtepa filiallari boti kabi):
//   kanal posti "Boshlash" tugmasi -> t.me/<bot>?start=test_<id> -> test haqida qisqa ma'lumot + "Boshlash"
//   10 ta savol, 15 daqiqa, har kim bir marta; test ~1 sutka ochiq (opens..closes, Toshkent vaqti)
//   yopilgach: TOP-3 ga tabrik (sertifikat va bepul sinov darsi), adminga yakun.
// KV kalitlari:
//   quiz:<id>        {id, title, topics?, point? (har savol balli), opens:"YYYY-MM-DD HH:MM", closes:"YYYY-MM-DD HH:MM", limit_min, questions:[{q, o:[..], c, e}]}
//   user:<uid>       {name, username, joined, state}
//   att:<id>:<uid>   {i, ans:[], start, end, time, score, done, timeout}
//   res:<id>:<uid>   "" (metadata: {name, score, time})
//   wrapped:<id>     "1" — yakun yuborilgan

const TZ = 5 * 3600 * 1000; // Toshkent UTC+5
const TTL = { expirationTtl: 60 * 60 * 24 * 60 };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmtTime = (ms) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const tash = (str) => Date.parse(str.replace(" ", "T") + ":00Z") - TZ; // "YYYY-MM-DD HH:MM" (Toshkent) -> ms
const human = (str) => { const [d, t] = str.split(" "); const [, m, dd] = d.split("-"); return `${dd}.${m} soat ${t}`; };

async function tg(env, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  return r.json();
}
const send = (env, chat_id, text, extra = {}) => tg(env, "sendMessage", { chat_id, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra });
const getJ = async (env, k) => { const v = await env.KV.get(k); return v ? JSON.parse(v) : null; };
const putJ = (env, k, v, opt) => env.KV.put(k, JSON.stringify(v), opt);
const isAdmin = (env, uid) => String(env.ADMINS || "").split(",").map(s => s.trim()).includes(String(uid));

// "Karimova A." ko'rinishi (natijalarda filiallar kabi)
function shortName(full) {
  const p = String(full || "").trim().split(/\s+/).filter(Boolean);
  if (p.length < 2) return p[0] || "O‘quvchi";
  return `${p[p.length - 1]} ${p[0][0].toUpperCase()}.`;
}
async function ensureUser(env, from) {
  let u = await getJ(env, `user:${from.id}`);
  if (!u || !u.name) {
    u = { ...(u || {}), joined: u?.joined || Date.now(), name: [from.first_name, from.last_name].filter(Boolean).join(" ").slice(0, 40) || "O‘quvchi", username: from.username || null, state: null };
    await putJ(env, `user:${from.id}`, u);
  }
  return u;
}

async function allQuizzes(env) {
  const out = []; let cursor;
  do {
    const r = await env.KV.list({ prefix: "quiz:", cursor });
    for (const k of r.keys) out.push(k.name.slice(5));
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  return out.sort();
}
// hozir ochiq test / keyingi / oxirgi
async function findQuiz(env, mode = "active") {
  const now = Date.now(), ids = await allQuizzes(env);
  const qs = (await Promise.all(ids.map(id => getJ(env, `quiz:${id}`)))).filter(q => q && q.opens && q.closes);
  if (mode === "active") return qs.find(q => tash(q.opens) <= now && now < tash(q.closes)) || null;
  if (mode === "next") return qs.filter(q => tash(q.opens) > now).sort((a, b) => tash(a.opens) - tash(b.opens))[0] || null;
  return qs.filter(q => tash(q.opens) <= now).sort((a, b) => tash(b.closes) - tash(a.closes))[0] || null;
}

const startBtn = (id) => ({ inline_keyboard: [[{ text: "🚀 Boshlash", callback_data: `go:${id}` }]] });

function questionView(quiz, i, note = "") {
  const q = quiz.questions[i];
  const text = (note ? note + "\n\n" : "") + `❓ <b>${i + 1}/${quiz.questions.length}</b>\n\n${esc(q.q)}`;
  const kb = q.o.map((o, k) => [{ text: o.length > 60 ? o.slice(0, 57) + "…" : o, callback_data: `a:${quiz.id}:${i}:${k}` }]);
  return [text, kb];
}
function show(env, chat, msgId, text, kb) {
  const extra = kb ? { reply_markup: { inline_keyboard: kb } } : {};
  if (msgId) return tg(env, "editMessageText", { chat_id: chat, message_id: msgId, text, parse_mode: "HTML", ...extra });
  return send(env, chat, text, extra);
}

// test haqida ma'lumot (kanal postidagidek) + "Boshlash"
async function intro(env, from, chat, id) {
  const quiz = id ? await getJ(env, `quiz:${id}`) : await findQuiz(env, "active");
  if (!quiz) {
    const nx = await findQuiz(env, "next");
    return send(env, chat, nx ? `⏳ Hozir ochiq test yo‘q.\nKeyingi test: <b>${esc(nx.title)}</b> — ${human(nx.opens)} da boshlanadi.` : "⏳ Hozir ochiq test yo‘q. Keyingi test kanalda e’lon qilinadi.");
  }
  const now = Date.now();
  if (!isAdmin(env, from.id)) {
    if (now < tash(quiz.opens)) return send(env, chat, `⏳ <b>${esc(quiz.title)}</b>\nTest ${human(quiz.opens)} da ochiladi.`);
    if (now >= tash(quiz.closes)) return send(env, chat, `⌛ <b>${esc(quiz.title)}</b> testi yopilgan.\nKeyingi testni kanalda kuting!`);
  }
  const att = await getJ(env, `att:${quiz.id}:${from.id}`);
  if (att && att.done) return send(env, chat, `✅ Siz bu testda qatnashgansiz: <b>${pts(quiz, att.score)}</b> (${fmtTime(att.time)}).\nHar kim bir marta qatnashadi.`);
  if (att) { const [t, kb] = questionView(quiz, att.i); return show(env, chat, null, t, kb); }
  return send(env, chat,
    `🏆 <b>Kunlik test: ${esc(quiz.title)}</b>\n\n${quiz.topics ? `📚 Mavzular: ${esc(quiz.topics)}\n` : ""}📝 ${quiz.questions.length} ta savol · ⏱ ${quiz.limit_min || 15} daqiqa${quiz.point ? ` · har biri ${quiz.point} ball` : ""}\n📅 Test ${human(quiz.closes)} gacha ochiq\n🥇🥈🥉 TOP-3 ga <b>Registon sertifikati</b> va <b>bepul sinov darsi</b>!\n\n👇 Boshlash uchun tugmani bosing. Har kim bir marta qatnashadi.`,
    { reply_markup: startBtn(quiz.id) });
}

async function begin(env, cb, id) {
  const from = cb.from, chat = cb.message.chat.id, mid = cb.message.message_id;
  await ensureUser(env, from);
  const quiz = await getJ(env, `quiz:${id}`);
  if (!quiz) return show(env, chat, mid, "Test topilmadi.");
  const now = Date.now();
  if (!isAdmin(env, from.id) && (now < tash(quiz.opens) || now >= tash(quiz.closes))) return show(env, chat, mid, "⌛ Bu test hozir ochiq emas.");
  let att = await getJ(env, `att:${id}:${from.id}`);
  if (att && att.done) return show(env, chat, mid, `✅ Siz bu testda qatnashgansiz: <b>${pts(quiz, att.score)}</b>.`);
  if (!att) { att = { i: 0, ans: [], start: now, done: false }; await putJ(env, `att:${id}:${from.id}`, att, TTL); }
  const [t, kb] = questionView(quiz, att.i, `⏱ ${quiz.limit_min || 15} daqiqa. Omad!`);
  return show(env, chat, mid, t, kb);
}

async function finish(env, from, chat, mid, quiz, att, note = "") {
  att.done = true; att.end = Date.now(); att.time = att.end - att.start;
  att.score = att.ans.reduce((s, a, n) => s + (a === quiz.questions[n].c ? 1 : 0), 0);
  await putJ(env, `att:${quiz.id}:${from.id}`, att, TTL);
  const user = await ensureUser(env, from);
  await env.KV.put(`res:${quiz.id}:${from.id}`, "", { metadata: { name: user.name, score: att.score, time: att.time }, ...TTL });
  const wrong = quiz.questions.map((q, n) => ({ q, n, a: att.ans[n] })).filter(x => x.a !== x.q.c);
  let text = (note ? note + "\n\n" : "") + `🏁 <b>Test tugadi!</b>\n\nNatija: <b>${pts(quiz, att.score)}</b> (${att.score}/${quiz.questions.length} to‘g‘ri) · Vaqt: <b>${fmtTime(att.time)}</b>\n`;
  text += !wrong.length ? "\n🔥 Ajoyib! Hammasi to‘g‘ri!" : `\n📚 <b>Xatolar tahlili:</b>\n` +
    wrong.map(x => `\n<b>${x.n + 1}.</b> ${esc(x.q.q)}\n${x.a == null ? "⏱ Javob berilmadi" : "❌ " + esc(x.q.o[x.a])}\n✅ ${esc(x.q.o[x.q.c])}\n💡 ${esc(x.q.e)}`).join("\n");
  text += `\n\n🏆 Natijalar ${human(quiz.closes)} dan keyin e’lon qilinadi. TOP-3 ga sertifikat va bepul sinov darsi!`;
  return show(env, chat, mid, text.slice(0, 4000));
}

async function onAnswer(env, cb, id, i, k) {
  const from = cb.from, chat = cb.message.chat.id, mid = cb.message.message_id;
  const quiz = await getJ(env, `quiz:${id}`);
  const att = await getJ(env, `att:${id}:${from.id}`);
  if (!quiz || !att || att.done || att.i !== i) { await tg(env, "answerCallbackQuery", { callback_query_id: cb.id }); return; }
  if (Date.now() - att.start > (quiz.limit_min || 15) * 60000) {
    await tg(env, "answerCallbackQuery", { callback_query_id: cb.id, text: "⏱ Vaqt tugadi" });
    att.timeout = true;
    return finish(env, from, chat, mid, quiz, att, "⏱ <b>Vaqt tugadi.</b> Javob berilmagan savollar hisobga olinmadi.");
  }
  const q = quiz.questions[i], ok = k === q.c;
  att.ans.push(k); att.i = i + 1;
  await tg(env, "answerCallbackQuery", { callback_query_id: cb.id, text: ok ? "✅ To‘g‘ri!" : `❌ To‘g‘ri javob: ${q.o[q.c]}`.slice(0, 190) });
  if (att.i >= quiz.questions.length) return finish(env, from, chat, mid, quiz, att);
  await putJ(env, `att:${id}:${from.id}`, att, TTL);
  const [t, kb] = questionView(quiz, att.i, ok ? "✅ To‘g‘ri!" : `❌ Noto‘g‘ri. To‘g‘ri javob: <b>${esc(q.o[q.c])}</b>`);
  return show(env, chat, mid, t, kb);
}

// ---------- natijalar ----------
async function results(env, id) {
  const out = []; let cursor;
  do {
    const r = await env.KV.list({ prefix: `res:${id}:`, cursor });
    for (const k of r.keys) if (k.metadata) out.push({ uid: k.name.split(":")[2], ...k.metadata });
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  return out.sort((a, b) => b.score - a.score || a.time - b.time);
}
// ball: har bir to'g'ri javob quiz.point (masalan 2.5) ball
const pts = (quiz, n) => quiz.point ? `${+(n * quiz.point).toFixed(1)} ball` : `${n}/${quiz.questions.length}`;
const medal = (n) => ["🥇", "🥈", "🥉"][n] || `${n + 1}.`;
function resultsText(quiz, r, n = 10) {
  return `🏆 <b>${esc(quiz.title)} — natijalar</b>\n\n👥 Qatnashdi: ${r.length} nafar\n\n` +
    r.slice(0, n).map((x, i) => `${medal(i)} ${esc(shortName(x.name))} — ${pts(quiz, x.score)} (${fmtTime(x.time)})`).join("\n");
}
async function sendTop(env, chat) {
  const quiz = (await findQuiz(env, "active")) || (await findQuiz(env, "last"));
  if (!quiz) return send(env, chat, "Hozircha natijalar yo‘q.");
  const r = await results(env, quiz.id);
  if (!r.length) return send(env, chat, `<b>${esc(quiz.title)}</b>\nHozircha hech kim qatnashmagan.`);
  return send(env, chat, resultsText(quiz, r));
}

// ---------- yopilgan testlar yakuni (cron) ----------
async function wrapClosed(env) {
  const now = Date.now(), admins = String(env.ADMINS || "").split(",").map(s => s.trim()).filter(Boolean);
  const minScore = Number(env.MIN_SCORE ?? 5);
  for (const id of await allQuizzes(env)) {
    const quiz = await getJ(env, `quiz:${id}`);
    if (!quiz || !quiz.closes || now < tash(quiz.closes) || now - tash(quiz.closes) > 3 * 86400e3) continue;
    if (await env.KV.get(`wrapped:${id}`)) continue;
    await env.KV.put(`wrapped:${id}`, "1", TTL);
    const r = await results(env, id);
    for (const [n, x] of r.slice(0, 3).entries()) {
      if (x.score < minScore) continue;
      await send(env, x.uid, `${medal(n)} <b>Tabriklaymiz, ${esc(x.name)}!</b>\n\n<b>${esc(quiz.title)}</b> testida <b>${n + 1}-o‘rinni</b> egalladingiz: ${pts(quiz, x.score)} (${fmtTime(x.time)}).\n\n🎓 Sizga <b>Registon sertifikati</b> va <b>bepul sinov darsi</b>! Markazimiz administratori siz bilan bog‘lanadi.`);
    }
    for (const a of admins) await send(env, a, r.length ? `📊 ${resultsText(quiz, r)}` : `📊 <b>${esc(quiz.title)}</b>: hech kim qatnashmadi.`);
  }
}

async function onMessage(env, m) {
  const uid = m.from.id, chat = m.chat.id, text = (m.text || "").trim();
  if (m.chat.type !== "private") return;
  await ensureUser(env, m.from);
  if (text.startsWith("/start")) {
    const p = text.split(" ")[1] || "";
    return intro(env, m.from, chat, p.startsWith("test_") ? p.slice(5) : null);
  }
  if (text === "/test") return intro(env, m.from, chat, null);
  if (text === "/top") return sendTop(env, chat);
  if (text === "/id") return send(env, chat, `Sizning ID: <code>${uid}</code>`);
  if (text === "/ism") {
    const u = await getJ(env, `user:${uid}`); u.state = "await_name"; await putJ(env, `user:${uid}`, u);
    return send(env, chat, "Natijalarda ko‘rinadigan ism-familiyangizni yozing (masalan: <i>Aziza Karimova</i>).");
  }
  if (text === "/havola" && isAdmin(env, uid)) {
    const me = await tg(env, "getMe", {});
    const qs = (await Promise.all((await allQuizzes(env)).map(id => getJ(env, `quiz:${id}`)))).filter(q => q && q.opens);
    return send(env, chat, "🔗 Testlar havolalari (kanal posti uchun):\n\n" + qs.map(q => `<b>${esc(q.title)}</b> (${human(q.opens)} – ${human(q.closes)})\nhttps://t.me/${me.result.username}?start=test_${q.id}`).join("\n\n"));
  }
  const u = await getJ(env, `user:${uid}`);
  if (u && u.state === "await_name") {
    const name = text.replace(/\s+/g, " ").slice(0, 40);
    if (name.length < 3 || name.startsWith("/")) return send(env, chat, "Iltimos, ism va familiyangizni yozing.");
    u.name = name; u.state = null; await putJ(env, `user:${uid}`, u);
    return send(env, chat, `✅ Ism saqlandi: <b>${esc(name)}</b>`);
  }
  return intro(env, m.from, chat, null);
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
          if (data.startsWith("go:")) { await tg(env, "answerCallbackQuery", { callback_query_id: cb.id }); await begin(env, cb, data.slice(3)); }
          else if (data.startsWith("a:")) { const [, id, i, k] = data.split(":"); await onAnswer(env, cb, id, Number(i), Number(k)); }
          else await tg(env, "answerCallbackQuery", { callback_query_id: cb.id });
        }
      } catch (e) { console.log("error", e.stack || e); }
      return new Response("ok");
    }
    if (url.pathname === "/setup") {
      if (url.searchParams.get("key") !== env.WEBHOOK_SECRET) return new Response("forbidden", { status: 403 });
      const hook = await tg(env, "setWebhook", { url: `${url.origin}/tg`, secret_token: env.WEBHOOK_SECRET, allowed_updates: ["message", "callback_query"] });
      await tg(env, "setMyCommands", { commands: [
        { command: "test", description: "Ochiq testni boshlash" },
        { command: "top", description: "Natijalar" },
        { command: "ism", description: "Natijadagi ismni o‘zgartirish" } ] });
      const me = await tg(env, "getMe", {});
      const ok = hook.ok && me.ok;
      return new Response(`<meta charset="utf-8"><body style="font:20px system-ui;padding:40px">${ok ? "✅ Bot ulandi: @" + me.result.username : "❌ Xato: " + esc(JSON.stringify(hook))}</body>`, { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    return new Response("Registan Academy test bot ishlayapti ✅", { headers: { "content-type": "text/plain; charset=utf-8" } });
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(wrapClosed(env)); },
};
