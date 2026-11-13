"""Render 5 sample post templates (1080x1350 @2x) for the new Academy design."""
import pathlib, base64

S = pathlib.Path(__file__).parent
F = '/usr/share/fonts/opentype/inter/'
LOGO = (S / 'logo.svg').read_text()

def img(name):
    return 'data:image/jpeg;base64,' + base64.b64encode((S / 'photos' / name).read_bytes()).decode()

def brand(color='#fff'):
    return f'''<div class="brand" style="color:{color}"><span class="mark">{LOGO}</span>
      <span class="wm"><b>REGISTON</b><i>ACADEMY FILIALI</i></span></div>'''

CSS = f'''
@font-face{{font-family:I;font-weight:500;src:url(file://{F}Inter-Medium.otf)}}
@font-face{{font-family:I;font-weight:600;src:url(file://{F}Inter-SemiBold.otf)}}
@font-face{{font-family:I;font-weight:700;src:url(file://{F}Inter-Bold.otf)}}
@font-face{{font-family:I;font-weight:800;src:url(file://{F}Inter-ExtraBold.otf)}}
@font-face{{font-family:I;font-weight:900;src:url(file://{F}Inter-Black.otf)}}
:root{{--o:#EA5A0C;--od:#C2410C;--k:#141414;--w:#fff;--y:#F5C518;--cream:#FFF6EF}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:I,sans-serif;background:#ddd}}
.post{{width:1080px;height:1350px;position:relative;overflow:hidden;color:var(--w)}}
.brand{{position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:16px;z-index:5}}
.brand .mark svg{{width:74px;height:auto;display:block}}
.brand .wm{{display:flex;flex-direction:column;line-height:1}}
.brand b{{font-weight:900;font-size:34px;letter-spacing:.01em}}
.brand i{{font-style:normal;font-weight:800;font-size:16px;letter-spacing:.2em;margin-top:6px}}
.photo{{position:absolute;inset:0 0 auto 0;background-size:cover;background-position:center}}
.shade{{position:absolute;inset:0 0 auto 0;height:260px;background:linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,0))}}
.pill{{display:inline-block;font-weight:700;font-size:30px;padding:10px 26px;border-radius:999px}}
.sub{{font-weight:600;font-size:38px;margin-top:26px;opacity:.95}}
h1{{font-weight:900;text-transform:uppercase;letter-spacing:-.025em;line-height:.93;margin-top:22px}}
.block{{position:absolute;left:0;right:0;bottom:0;padding:56px 64px 64px}}
.handle{{position:absolute;right:64px;bottom:40px;font-weight:600;font-size:24px;opacity:.85}}
'''

POSTS = {}

# 1. FOYDALI — photo top, orange block
POSTS['1_foydali'] = f'''
<div class="post" style="background:var(--o)">
  <div class="photo" style="height:780px;background-image:url({img('desk.jpg')})"></div>
  <div class="shade"></div>{brand()}
  <svg style="position:absolute;left:0;top:740px" width="1080" height="80" viewBox="0 0 1080 80"><path d="M0 40 L1080 0 L1080 80 L0 80Z" fill="#EA5A0C"/></svg>
  <div class="block" style="top:800px;padding-top:30px">
    <span class="pill" style="background:var(--y);color:var(--k)">Matematika</span>
    <div class="sub">3 ta usul · har kuni 10 daqiqa</div>
    <h1 style="font-size:150px">Tez<br>hisoblash</h1>
  </div>
  
</div>'''

# 2. USTOZ — full-bleed photo, dark gradient bottom
import base64 as _b
_cut='data:image/png;base64,'+_b.b64encode((S/'photos'/'johns_cut.png').read_bytes()).decode()
POSTS['2_ustoz'] = f'''
<div class="post" style="background:linear-gradient(180deg,#FFFFFF 0%,#FFF1E6 60%,#FFE3CF 100%)">
  <div style="position:absolute;left:110px;top:90px;width:720px;height:720px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#FFB27D,#FF8A45 55%,#F57328)"></div>
  <div style="position:absolute;left:30px;top:10px;width:880px;height:880px;border-radius:50%;border:4px solid rgba(234,90,12,.25)"></div>
  <img src="{_cut}" style="position:absolute;left:0;top:-10px;width:820px">
  <svg style="position:absolute;left:0;top:1010px" width="1080" height="70" viewBox="0 0 1080 70"><path d="M0 46 L1080 0 L1080 70 L0 70Z" fill="#EA5A0C"/></svg>
  <div class="block" style="top:1078px;background:var(--o);padding:6px 64px 44px">
    <span class="pill" style="background:#fff;color:var(--o);font-size:24px;padding:8px 22px">Ingliz tili · IELTS</span>
    <div class="sub" style="margin-top:12px;font-size:30px">Academy filiali ustozi</div>
    <h1 style="font-size:116px;margin-top:8px">Mr Johns</h1>
  </div>
  {brand('#EA5A0C')}
</div>'''

# 3. NATIJA — result card on orange
cert = '''<div style="position:absolute;right:-30px;top:250px;width:420px;height:560px;background:#fff;border-radius:14px;transform:rotate(6deg);box-shadow:0 30px 60px rgba(80,20,0,.35);padding:34px;color:#222">
  <div style="font-weight:900;font-size:44px;color:#C8102E">IELTS</div>
  <div style="font-weight:700;font-size:16px;margin:6px 0 22px;color:#555">Test Report Form</div>
  ''' + ''.join(f'<div style="height:12px;background:#E9E9E9;border-radius:6px;margin:14px 0;width:{w}%"></div>' for w in (90,70,80,55,85,60,75,65,88,50)) + '''
  <div style="display:flex;gap:10px;margin-top:26px">''' + ''.join(f'<div style="flex:1;border:2px solid #ddd;border-radius:8px;height:64px"></div>' for _ in range(4)) + '''</div></div>'''
def stat(v, l, solid):
    bg = 'background:#fff;color:#EA5A0C' if solid else 'background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.45)'
    return f'<div style="{bg};border-radius:22px;padding:26px 0 20px;text-align:center;flex:1"><div style="font-weight:900;font-size:74px;line-height:1">{v}</div><div style="font-weight:700;font-size:20px;letter-spacing:.14em;margin-top:10px;opacity:.85">{l}</div></div>'
POSTS['3_natija'] = f'''
<div class="post" style="background:radial-gradient(120% 90% at 85% 15%,#FF8A3D 0%,#EA5A0C 45%,#C9470A 100%)">
  {brand()}{cert}
  <div style="position:absolute;left:64px;top:230px;width:560px">
    <div style="font-weight:700;font-size:24px;letter-spacing:.2em;opacity:.9">MUVAFFAQIYAT</div>
    <h1 style="font-size:124px;margin-top:18px">Ajoyib<br>natija!</h1>
    <div style="font-weight:600;font-size:26px;margin-top:40px;opacity:.85">O‘quvchimiz</div>
    <div style="font-weight:900;font-size:62px;line-height:1.05">Ism<br><span style="font-weight:600">Familiya</span></div>
    <div style="font-weight:600;font-size:26px;margin-top:22px;opacity:.85">Ustozi: <b style="font-weight:800;opacity:1">Ustoz ismi</b></div>
  </div>
  <div style="position:absolute;left:64px;right:64px;top:930px;display:flex;gap:20px">{stat('7.5','OVERALL',True)}{stat('B2','CEFR',False)}{stat('8.0','LISTENING',False)}</div>
  <div style="position:absolute;left:64px;right:64px;top:1130px;font-weight:600;font-size:28px;text-align:center;opacity:.9">Tabriklaymiz! Navbatdagi marra sari olg‘a!</div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:110px;background:rgba(60,15,0,.55);display:flex;align-items:center;justify-content:center;padding:0 64px;font-weight:800;font-size:30px">
    <span>93 551 27 00</span></div>
</div>'''

# 4. KUNLIK TEST — photo top, black block, orange pill
POSTS['4_kunlik_test'] = f'''
<div class="post" style="background:var(--k)">
  <div class="photo" style="height:760px;background-image:url({img('test.jpg')})"></div>
  <div class="shade"></div>{brand()}
  <div style="position:absolute;left:0;right:0;top:700px;height:120px;background:linear-gradient(rgba(20,20,20,0),#141414)"></div>
  <div class="block" style="top:790px;padding-top:20px">
    <span class="pill" style="background:var(--o)">Ingliz tili · A1</span>
    <div class="sub">10 ta savol · TOP-3 ga sertifikat</div>
    <h1 style="font-size:156px">Kunlik<br>test</h1>
  </div>
  <div style="position:absolute;right:64px;top:1036px;background:#fff;color:var(--k);border-radius:24px;padding:22px 30px;text-align:center;transform:rotate(-4deg)">
    <div style="font-weight:700;font-size:22px;letter-spacing:.12em;color:var(--o)">BOTDA</div>
    <div style="font-weight:900;font-size:52px;line-height:1.05">18:00</div>
    <div style="font-weight:700;font-size:22px">dan 21:00 gacha</div>
  </div>
</div>'''

# 5. TEST NATIJALARI — white card, orange header, podium
def pod(place, name, score, t, h, gold=False):
    border = '#F5A623' if gold else '#E3D5CB'
    return f'''<div style="flex:1;display:flex;flex-direction:column;align-items:center">
      <div style="width:86px;height:86px;border-radius:50%;background:{'#F5A623' if gold else '#fff'};border:5px solid {'#F5A623' if gold else '#EA5A0C'};color:{'#fff' if gold else '#EA5A0C'};display:grid;place-items:center;font-weight:900;font-size:46px;margin-bottom:-26px;z-index:2;position:relative">{place}</div>
      <div style="width:100%;height:{h}px;background:#fff;border:3px solid {border};border-radius:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding-top:20px">
        <div style="font-weight:800;font-size:30px;color:#141414">{name}</div>
        <div style="font-weight:900;font-size:64px;color:#EA5A0C;line-height:1.1">{score}</div>
        <div style="font-weight:600;font-size:22px;color:#8a7a70">{t}</div></div></div>'''
rows = [('4','Ism F.','10/10'),('5','Ism F.','9/10'),('6','Ism F.','9/10'),('7','Ism F.','9/10'),('8','Ism F.','8/10'),('9','Ism F.','8/10'),('10','Ism F.','8/10'),('','','')]
row_html = ''.join(f'<div style="display:flex;align-items:center;gap:14px;font-size:28px;font-weight:600;color:#141414;height:52px">' + (f'<span style="width:40px;height:40px;border-radius:50%;background:#EA5A0C;color:#fff;font-weight:800;font-size:20px;display:grid;place-items:center">{n}</span><span style="flex:1">{nm}</span><b style="font-weight:800;color:#EA5A0C">{sc}</b>' if n else '') + '</div>' for n,nm,sc in rows)
POSTS['5_test_natijalari'] = f'''
<div class="post" style="background:var(--cream)">
  <div style="position:absolute;inset:0 0 auto 0;height:330px;background:var(--o)"></div>
  {brand()}
  <div style="position:absolute;right:64px;top:70px;font-weight:700;font-size:26px">12.11.2026</div>
  <h1 style="position:absolute;left:64px;top:150px;font-size:104px;margin:0">Test natijalari</h1>
  <div style="position:absolute;left:64px;top:290px;background:#fff;color:#EA5A0C;border-radius:999px;padding:12px 28px;font-weight:800;font-size:26px">Ingliz tili · 32 nafar qatnashdi</div>
  <div style="position:absolute;left:64px;right:64px;top:400px;display:flex;gap:22px;align-items:flex-end">
    {pod('2','Ism F.','10/10','1:01',230)}{pod('1','Ism F.','10/10','0:55',270,True)}{pod('3','Ism F.','10/10','1:05',210)}</div>
  <div style="position:absolute;left:64px;right:64px;top:760px;display:grid;grid-template-columns:1fr 1fr;column-gap:60px">{row_html}</div>
  <div style="position:absolute;left:64px;right:64px;top:1000px;height:2px;background:#EADBD0"></div>
  <div style="position:absolute;left:64px;right:64px;top:1040px;background:#EA5A0C;border-radius:999px;padding:24px;text-align:center;font-weight:800;font-size:32px">G‘oliblarga sertifikat va bepul sinov darsi</div>
  <div style="position:absolute;left:64px;right:64px;top:1170px;text-align:center;font-weight:700;font-size:28px;color:#141414">Keyingi test: Juma, 18:00 — Matematika</div>
  
</div>'''

html = f'<html><head><meta charset="utf-8"><style>{CSS}</style></head><body>' + ''.join(f'<div id="{k}" style="margin:20px">{v}</div>' for k, v in POSTS.items()) + '</body></html>'
(S / 'templates.html').write_text(html)
import json; (S/'ids.json').write_text(json.dumps(list(POSTS)))
print('html ok')
