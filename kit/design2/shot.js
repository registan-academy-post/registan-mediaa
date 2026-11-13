const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
(async()=>{ const d=__dirname; fs.mkdirSync(d+'/out',{recursive:true});
 const ids=JSON.parse(fs.readFileSync(d+'/ids.json'));
 const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1200,height:1500},deviceScaleFactor:2});
 await pg.goto('file://'+d+'/templates.html'); await pg.evaluate(()=>document.fonts.ready); await pg.waitForTimeout(500);
 for(const k of ids){ await pg.locator('[id="'+k+'"] .post').screenshot({path:d+'/out/'+k+'.png'}); }
 await b.close(); console.log('shots ok'); })();
