import worker from './worker.js';
const store = new Map(), meta = new Map(); const sent = [];
const KV = { async get(k){return store.get(k)??null}, async put(k,v,o){store.set(k,v); if(o?.metadata) meta.set(k,o.metadata)},
  async list({prefix}){return {keys:[...store.keys()].filter(k=>k.startsWith(prefix)).map(n=>({name:n,metadata:meta.get(n)})),list_complete:true}} };
globalThis.fetch = async (url, init) => { const m=url.split('/').pop(); const b=JSON.parse(init.body); sent.push({m,b}); return {json:async()=>({ok:true,result:{username:'x'}})}; };
const env = { KV, BOT_TOKEN:'T', WEBHOOK_SECRET:'S', ADMINS:'1', TEST_DAYS:'0,1,2,3,4,5,6', OPEN_HOUR:'0', CLOSE_HOUR:'24', MIN_SCORE:'2' };
const d = new Date(Date.now()+5*3600e3).toISOString().slice(0,10);
const mk=(n,c)=>Array.from({length:3},(_,i)=>({q:`${n} q${i}`,o:['a','b','c','d'],c}));
store.set(`quiz:${d}`, JSON.stringify({subject:'Matematika',levels:[{id:'b',name:"🟢 Boshlang'ich",topic:'t1',questions:mk('B',0)},{id:'y',name:'🔴 Yuqori',topic:'t3',questions:mk('Y',2)}]}));
let mid=1; const upd=(u)=>worker.fetch(new Request('https://x/tg',{method:'POST',headers:{'X-Telegram-Bot-Api-Secret-Token':'S'},body:JSON.stringify(u)}),env);
const msg=(uid,text)=>upd({message:{from:{id:uid,first_name:'U'},chat:{id:uid,type:'private'},text}});
const cb=(uid,data)=>upd({callback_query:{id:'c',from:{id:uid},data,message:{chat:{id:uid},message_id:mid++}}});
for (const [uid,name,lvl,ans] of [[10,'Ali V.','b',0],[11,'Vali S.','b',1],[12,'Sara K.','y',2]]) {
  await msg(uid,'/start'); await msg(uid,name); await cb(uid,'start_test'); await cb(uid,'lvl:'+lvl);
  for (let i=0;i<3;i++) await cb(uid,`a:${i}:${ans}`);
}
await cb(10,'start_test');
await msg(10,'/top');
await worker.scheduled({}, env, {waitUntil:p=>p});
await new Promise(r=>setTimeout(r,50));
const show = sent.filter(x=>x.m==='sendMessage').map(x=>`[${x.b.chat_id}] ${x.b.text.split('\n').slice(0,6).join(' | ')}`);
console.log(show.filter(t=>/darajangizni|Test tugadi|natijalari|Tabriklaymiz|yakuni|ishlab bo/.test(t)).join('\n'));
