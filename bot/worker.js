// Registan Academy — test boti (Du: ingliz tili, Chor: matematika, Ju: rus tili) (Cloudflare Worker, Telegram webhook)
// KV kalitlari:
//   user:<uid>              {name, username, state, joined}
//   quiz:<YYYY-MM-DD>       {subject, level, topic, questions:[{q, o:[4], c:0-3, e}]}
//   att:<date>:<uid>        {i, ans:[], start, end, score, time, done}
//   res:<date>:<uid>        "" (metadata: {name, score, time})  — natijalar ro'yxati uchun

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

const MENU = { reply_markup: { inline_keyboard: [[{ text: "📝 Testni boshlash", callback_data: "start_test" }], [{ text: "🏆 Natijalar", callback_data: "top" }]] } };

// ---------- test oqimi ----------
async function startTest(env, uid, chat) {
  const user = await getJ(env, `user:${uid}`);
  if (!user || !user.name) { await askName(env, uid, chat); return; }
  const d = today(), h = tashHour();
  const open = Number(env.OPEN_HOUR ?? 0), close = Number(env.CLOSE_HOUR ?? 24);
  if (!isAdmin(env, uid) && (!isTestDay(env) || h < open || h >= close)) {
    return send(env, chat, `⏰ Testlar har <b>${daysText(env)}</b> kuni <b>${open}:00 dan ${close}:00 gacha</b> ochiq bo‘ladi.\nO‘sha vaqtda qayta kiring!`);
  }
  const quiz = await getJ(env, `quiz:${d}`);
  if (!quiz) return send(env, chat, "📭 Bugungi test hali joylanmagan. Kanalda e’lonni kuting!");
  const att = await getJ(env, `att:${d}:${uid}`);
  if (att && att.done) return send(env, chat, `✅ Siz bugungi testni ishlab bo‘lgansiz: <b>${att.score}/${quiz.questions.length}</b> (${fmtTime(att.time)}).\nKeyingi testda ham omad!`, MENU);
  if (att) return sendQuestion(env, chat, quiz, att.i); // davom ettirish
  const fresh = { i: 0, ans: [], start: Date.now(), done: false };
  await putJ(env, `att:${d}:${uid}`, fresh, { expirationTtl: 60 * 60 * 24 * 40 });
  await send(env, chat, `🚀 <b>${esc(quiz.subject)} · ${esc(quiz.level)}</b>\nMavzu: ${esc(quiz.topic)}\n\n${quiz.questions.length} ta savol. Vaqt hisoblanmoqda — tez va to‘g‘ri javob bering!`);
  return sendQuestion(env, chat, quiz, 0);
}

function sendQuestion(env, chat, quiz, i) {
  const q = quiz.questions[i];
  const text = `❓ <b>${i + 1}/${quiz.questions.length}</b>\n\n${esc(q.q)}\n\n` + q.o.map((o, k) => `<b>${LETTERS[k]})</b> ${esc(o)}`).join("\n");
  const kb = [[0, 1], [2, 3]].map(row => row.filter(k => k < q.o.length).map(k => ({ text: LETTERS[k], callback_data: `a:${i}:${k}` })));
  return send(env, chat, text, { reply_markup: { inline_keyboard: kb } });
}

async function onAnswer(env, cb, i, k) {
  const uid = cb.from.id, chat = cb.message.chat.id, d = today();
  const quiz = await getJ(env, `quiz:${d}`);
  const att = await getJ(env, `att:${d}:${uid}`);
  if (!quiz || !att || att.done || att.i !== i) { await tg(env, "answerCallbackQuery", { callback_query_id: cb.id }); return; }
  const q = quiz.questions[i], ok = k === q.c;
  att.ans.push(k); att.i = i + 1;
  await tg(env, "answerCallbackQuery", { callback_query_id: cb.id, text: ok ? "✅ To‘g‘ri!" : "❌ Noto‘g‘ri" });
  const mark = q.o.map((o, n) => `${n === q.c ? "✅" : n === k ? "❌" : "▫️"} ${esc(o)}`).join("\n");
  await tg(env, "editMessageText", { chat_id: chat, message_id: cb.message.message_id, parse_mode: "HTML",
    text: `❓ <b>${i + 1}/${quiz.questions.length}</b>\n\n${esc(q.q)}\n\n${mark}` });
  if (att.i < quiz.questions.length) {
    await putJ(env, `att:${d}:${uid}`, att, { expirationTtl: 60 * 60 * 24 * 40 });
    return sendQuestion(env, chat, quiz, att.i);
  }
  // tugadi
  att.done = true; att.end = Date.now(); att.time = att.end - att.start;
  att.score = att.ans.reduce((s, a, n) => s + (a === quiz.questions[n].c ? 1 : 0), 0);
  await putJ(env, `att:${d}:${uid}`, att, { expirationTtl: 60 * 60 * 24 * 40 });
  const user = await getJ(env, `user:${uid}`);
  await env.KV.put(`res:${d}:${uid}`, "", { metadata: { name: user?.name || cb.from.first_name, score: att.score, time: att.time }, expirationTtl: 60 * 60 * 24 * 40 });
  const wrong = quiz.questions.map((qq, n) => ({ qq, n, a: att.ans[n] })).filter(x => x.a !== x.qq.c);
  let text = `🏁 <b>Test tugadi!</b>\n\nNatija: <b>${att.score}/${quiz.questions.length}</b>\nVaqt: <b>${fmtTime(att.time)}</b>\n`;
  text += att.score === quiz.questions.length ? "\n🔥 Ajoyib! Hammasi to‘g‘ri!" : `\n📚 <b>Xatolar tahlili:</b>\n` +
    wrong.map(x => `\n<b>${x.n + 1}.</b> ${esc(x.qq.q)}\nTo‘g‘ri javob: <b>${esc(x.qq.o[x.qq.c])}</b>\n💡 ${esc(x.qq.e)}`).join("\n");
  text += `\n\n🏆 TOP-3 natijalar soat ${env.CLOSE_HOUR ?? 21}:00 dan keyin e’lon qilinadi. G‘oliblarga sertifikat va bepul sinov darsi!`;
  return send(env, chat, text.slice(0, 4000), MENU);
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
async function sendTop(env, chat, d = today()) {
  const r = await results(env, d);
  if (!r.length) return send(env, chat, "Hozircha bu testni hech kim ishlamagan.");
  const lines = r.slice(0, 10).map((x, n) => `${medal(n)} ${esc(x.name)} — <b>${x.score}</b> (${fmtTime(x.time)})`);
  return send(env, chat, `🏆 <b>${d} natijalari</b>\nQatnashdi: ${r.length} nafar\n\n${lines.join("\n")}`);
}

// ---------- ro'yxatdan o'tish ----------
async function askName(env, uid, chat) {
  const user = (await getJ(env, `user:${uid}`)) || { joined: Date.now() };
  user.state = "await_name";
  await putJ(env, `user:${uid}`, user);
  return send(env, chat, "👋 Assalomu alaykum! <b>Registan Academy</b> test botiga xush kelibsiz.\n\nIsm va familiyangizni yozing (masalan: <i>Aziza Karimova</i>). Natijalarda shu ism ko‘rinadi.");
}

async function onMessage(env, m) {
  const uid = m.from.id, chat = m.chat.id, text = (m.text || "").trim();
  if (m.chat.type !== "private") return;
  if (text.startsWith("/start")) {
    const user = await getJ(env, `user:${uid}`);
    if (!user || !user.name) return askName(env, uid, chat);
    if (text.includes("test")) return startTest(env, uid, chat);
    return send(env, chat, `Salom, <b>${esc(user.name)}</b>! 👋\nTestni boshlash uchun pastdagi tugmani bosing.`, MENU);
  }
  if (text === "/test") return startTest(env, uid, chat);
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
    return send(env, chat, `Rahmat, <b>${esc(name)}</b>! ✅\nTestlar har ${daysText(env)} kuni ${env.OPEN_HOUR ?? 18}:00 dan ${env.CLOSE_HOUR ?? 21}:00 gacha ochiq bo‘ladi.`, MENU);
  }
  return send(env, chat, "Testni boshlash uchun tugmani bosing 👇", MENU);
}

// ---------- kechki yakun: g'oliblarni tabriklash ----------
async function dailyWrap(env) {
  const d = today();
  const r = await results(env, d);
  const admins = String(env.ADMINS || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!r.length) { for (const a of admins) await send(env, a, `📊 ${d}: testni hech kim ishlamadi.`); return; }
  for (const [n, x] of r.slice(0, 3).entries()) {
    await send(env, x.uid, `${medal(n)} <b>Tabriklaymiz, ${esc(x.name)}!</b>\n\nSiz bugungi testda <b>${n + 1}-o‘rinni</b> egalladingiz: ${x.score} ball, ${fmtTime(x.time)}.\n\n🎁 Sizga <b>Registan sertifikati</b> va <b>bepul sinov darsi</b>! Markazimiz administratori siz bilan bog‘lanadi.`);
  }
  const lines = r.slice(0, 10).map((x, n) => `${medal(n)} ${esc(x.name)} — ${x.score} (${fmtTime(x.time)})`);
  for (const a of admins) await send(env, a, `📊 <b>${d} test yakuni</b>\nQatnashdi: ${r.length} nafar\n\n${lines.join("\n")}`);
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
          if (data === "start_test") { await tg(env, "answerCallbackQuery", { callback_query_id: cb.id }); await startTest(env, cb.from.id, cb.message.chat.id); }
          else if (data === "top") { await tg(env, "answerCallbackQuery", { callback_query_id: cb.id }); await sendTop(env, cb.message.chat.id); }
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
        { command: "ism", description: "Ismni o‘zgartirish" } ] });
      const me = await tg(env, "getMe", {});
      const ok = hook.ok && me.ok;
      return new Response(`<meta charset="utf-8"><body style="font:20px system-ui;padding:40px">${ok ? "✅ Bot ulandi: @" + me.result.username + "<br><br>Endi Telegramda botga /start yozing." : "❌ Xato: " + esc(JSON.stringify(hook))}</body>`, { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    return new Response("Registan Academy test bot ishlayapti ✅", { headers: { "content-type": "text/plain; charset=utf-8" } });
  },
  async scheduled(event, env, ctx) { if (isTestDay(env)) ctx.waitUntil(dailyWrap(env)); },
};
