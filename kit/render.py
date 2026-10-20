"""Registan LC | Academy filiali — Telegram post image renderer.

Usage:
    python3 kit/render.py spec.json OUT_DIR

spec.json is a list of cards:
[
  {
    "style": 1,                 # 1..5 (see STYLES below)
    "kind": "quote",            # "quote" (shows a quote mark) or "card"
    "eyebrow": "DAILY MOTIVATION", # small label (card kind shows it above the text)
    "text": "Education is the most <em>powerful weapon</em> ...",  # <em> = orange highlight
    "author": "Nelson Mandela", # optional
    "sub": "O'zbekcha tarjima yoki izoh",  # optional
    "tag": "DAILY MOTIVATION",  # bottom-right label
    "name": "01_motivation"     # output file name (without extension)
  }
]

Brand rules (from the client, never change):
- Always the official logo file brand/logo_full.png, top-left corner, unmodified.
- "Academy filiali" on its own, top-right, plain text, no frame, never next to the @handle.
- "@RegistanLC_Academy" on its own, bottom-left.
- Brand orange #E84E0F; light, airy backgrounds (white, cream, peach, sand, mist).
Output: 2160x2700 JPEG (4:5), under 5 MB (Telegram URL limit).
"""
import asyncio, base64, json, os, sys
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
b64 = lambda p: "data:image/png;base64," + base64.b64encode((ROOT / p).read_bytes()).decode()
LOGO = b64("brand/logo_full.png")
MARK = b64("brand/logo_mark.png")
OR = "#E84E0F"
GRAIN = """<div style="position:absolute;inset:0;opacity:.35;mix-blend-mode:multiply;pointer-events:none;background-image:url(&quot;data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .55  0 0 0 0 .4  0 0 0 0 .3  0 0 0 .16 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>&quot;)"></div>"""

def esc(s):
    return (s or "")

def shell(bg, deco, content, css, branch="#8a6a58", handle=OR, rule="rgba(42,24,16,.18)", tagc=None, tag=""):
    tagc = tagc or branch
    return f"""<html><head><meta charset="utf-8"><style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1080px;height:1350px;position:relative;overflow:hidden;font-family:Poppins,'Inter',sans-serif;background:{bg}}}
.abs{{position:absolute}}
.logo{{position:absolute;left:90px;top:86px;height:64px;z-index:5}}
.branch{{position:absolute;right:90px;top:104px;font-size:22px;font-weight:500;letter-spacing:6px;color:{branch};text-transform:uppercase;z-index:5}}
.rule{{position:absolute;left:90px;right:90px;bottom:150px;height:1px;background:{rule};z-index:5}}
.handle{{position:absolute;left:90px;bottom:90px;font-size:26px;font-weight:600;color:{handle};z-index:5}}
.tag{{position:absolute;right:90px;bottom:92px;font-size:22px;font-weight:500;letter-spacing:6px;color:{tagc};text-transform:uppercase;z-index:5}}
#box{{position:absolute;display:flex;flex-direction:column;z-index:4}}
#txt em{{font-style:inherit}}
{css}
</style></head><body>{deco}
<img class="logo" src="{LOGO}"><div class="branch">Academy filiali</div>
<div id="box">{content}</div>
<div class="rule"></div><div class="handle">@RegistanLC_Academy</div><div class="tag">{tag}</div>
</body></html>"""

def s1(c):
    q = '<div style="font-family:Lora;font-style:italic;font-size:260px;line-height:.75;color:%s;height:150px">“</div>' % OR if c["kind"] == "quote" else \
        f'<div style="font-size:24px;font-weight:600;letter-spacing:7px;color:{OR};text-transform:uppercase">{esc(c.get("eyebrow"))}</div>'
    au = f'<div style="display:flex;align-items:center;gap:24px;margin-top:56px"><i style="width:70px;height:3px;background:{OR}"></i><span style="font-size:26px;font-weight:600;letter-spacing:7px;color:#2a1810;text-transform:uppercase">{esc(c.get("author"))}</span></div>' if c.get("author") else ""
    sub = f'<div style="margin-top:24px;font-size:28px;line-height:1.5;color:#7a5a48;max-width:780px">{esc(c.get("sub"))}</div>' if c.get("sub") else ""
    content = f'{q}<div id="txt" style="margin-top:40px;font-family:Lora,serif;font-style:italic;font-weight:500;font-size:88px;line-height:1.2;color:#2a1810;letter-spacing:-1px">{c["text"]}</div>{au}{sub}'
    deco = f'<div class="abs" style="width:900px;height:900px;right:-380px;top:-300px;border-radius:50%;background:radial-gradient(circle,rgba(232,78,15,.16),rgba(232,78,15,0) 65%)"></div><img class="abs" src="{MARK}" style="right:-300px;bottom:190px;width:700px;opacity:.06">{GRAIN}'
    css = "#box{left:90px;right:60px;top:260px;bottom:190px;justify-content:center} #txt em{color:%s}" % OR
    return shell("#FBF4EC", deco, content, css, tag=c.get("tag", ""))

def s2(c):
    eb = f'<div style="align-self:flex-start;background:{OR};color:#fff;font-size:22px;font-weight:600;letter-spacing:5px;padding:10px 22px;text-transform:uppercase">{esc(c.get("eyebrow") or "QUOTE OF THE DAY")}</div>'
    au = f'<div style="margin-top:56px;font-family:\'Inter Display\';font-weight:700;font-size:34px;color:#151515">— {esc(c.get("author"))}</div>' if c.get("author") else ""
    sub = f'<div style="margin-top:20px;font-family:Inter;font-size:27px;line-height:1.5;color:#6b6b6b;max-width:800px">{esc(c.get("sub"))}</div>' if c.get("sub") else ""
    content = f'{eb}<div id="txt" style="margin-top:44px;font-family:\'Inter Display\';font-weight:900;font-size:96px;line-height:1.05;color:#151515;letter-spacing:-1px;word-spacing:6px;text-transform:uppercase">{c["text"]}</div>{au}{sub}'
    deco = f'<div class="abs" style="left:0;top:0;width:22px;height:100%;background:{OR}"></div><div class="abs" style="right:-120px;top:300px;font-family:\'Inter Display\';font-weight:900;font-size:620px;line-height:1;color:{OR};opacity:.07">”</div>'
    css = "#box{left:90px;right:80px;top:250px;bottom:190px;justify-content:center} #txt em{color:%s} .branch{font-family:Inter}" % OR
    return shell("#FFFFFF", deco, content, css, branch="#777", rule="rgba(0,0,0,.12)", tag=c.get("tag", ""))

def s3(c):
    eb = f'<div style="text-align:center"><span style="display:inline-block;width:90px;height:2px;background:{OR};vertical-align:middle"></span><span style="font-family:\'TeX Gyre Pagella\';font-size:30px;letter-spacing:8px;color:{OR};margin:0 22px;vertical-align:middle;text-transform:uppercase">{esc(c.get("eyebrow") or "WISDOM")}</span><span style="display:inline-block;width:90px;height:2px;background:{OR};vertical-align:middle"></span></div>'
    au = f'<div style="margin-top:48px;text-align:center;font-family:\'TeX Gyre Pagella\';font-style:italic;font-size:38px;color:{OR}">{esc(c.get("author"))}</div>' if c.get("author") else ""
    sub = f'<div style="margin:22px auto 0;max-width:720px;text-align:center;font-size:28px;line-height:1.5;color:#7a4e36">{esc(c.get("sub"))}</div>' if c.get("sub") else ""
    content = f'{eb}<div id="txt" style="margin-top:56px;text-align:center;font-family:\'TeX Gyre Pagella\',Lora,serif;font-size:120px;line-height:1.15;color:#3a1c0e">{c["text"]}</div>{au}{sub}'
    deco = f'<img class="abs" src="{MARK}" style="right:-260px;top:120px;width:760px;opacity:.06;clip-path:inset(0 0 40% 0)">{GRAIN}'
    css = "#box{left:110px;right:110px;top:240px;bottom:190px;justify-content:center} #txt em{color:%s;font-style:italic}" % OR
    return shell("linear-gradient(170deg,#FFF3EA 0%,#FBDCC8 100%)", deco, content, css, branch="#9a5a3a", rule="rgba(58,28,14,.2)", tag=c.get("tag", ""))

def s4(c):
    q = f'<div style="font-family:Lora;font-style:italic;font-size:240px;line-height:.75;color:{OR};height:130px">“</div>' if c["kind"] == "quote" else \
        f'<div style="font-size:24px;font-weight:600;letter-spacing:7px;color:{OR};text-transform:uppercase">{esc(c.get("eyebrow"))}</div>'
    content = f'{q}<div id="txt" style="margin-top:36px;font-family:Poppins,\'Inter Display\',sans-serif;font-weight:600;font-size:84px;line-height:1.22;color:#2b1a12;letter-spacing:-1.5px">{c["text"]}</div>'
    band_title = c.get("author") or ""
    band = f'<div class="abs" style="left:0;right:0;top:840px;height:510px;background:{OR}"></div><img class="abs" src="{MARK}" style="right:-160px;top:860px;width:520px;opacity:.12;filter:brightness(0) invert(1);clip-path:inset(0 0 40% 0)">'
    band += f'<div class="abs" style="left:90px;right:260px;top:910px;z-index:5"><div style="font-weight:700;font-size:40px;color:#fff">{esc(band_title)}</div><div style="margin-top:14px;font-size:28px;line-height:1.5;color:rgba(255,255,255,.9)">{esc(c.get("sub"))}</div></div>'
    deco = GRAIN + band
    css = "#box{left:90px;right:90px;top:220px;height:600px;justify-content:center} #txt em{color:%s} .rule{display:none}" % OR
    return shell("#FBEFE4", deco, content, css, handle="#fff", tagc="rgba(255,255,255,.85)", tag=c.get("tag", ""))

def s5(c):
    eb = f'<div style="font-size:24px;font-weight:600;letter-spacing:8px;color:{OR};text-transform:uppercase">{esc(c.get("eyebrow") or c.get("tag"))}</div>'
    au = f'<div style="margin-top:56px;font-size:24px;font-weight:600;letter-spacing:8px;color:#1f1a17;text-transform:uppercase">{esc(c.get("author"))}</div>' if c.get("author") else ""
    sub = f'<div style="margin-top:20px;font-size:28px;line-height:1.5;color:#6d625a;max-width:760px">{esc(c.get("sub"))}</div>' if c.get("sub") else ""
    content = f'{eb}<div id="txt" style="margin-top:44px;font-family:\'GFS Baskerville\',Lora,serif;font-size:120px;line-height:1.1;color:#1f1a17">{c["text"]}</div>{au}{sub}'
    deco = f'{GRAIN}<div class="abs" style="left:60px;right:60px;top:200px;bottom:200px;border:2px solid {OR}"></div>'
    css = "#box{left:110px;right:110px;top:250px;bottom:250px;justify-content:center} #txt em{color:%s;font-style:normal}" % OR
    return shell("#F4F1EC", deco, content, css, branch="#7d7068", rule="rgba(0,0,0,0)", tag=c.get("tag", ""))

STYLES = {1: s1, 2: s2, 3: s3, 4: s4, 5: s5}

FIT = """() => { const box=document.getElementById('box'), t=document.getElementById('txt');
  let fs=parseFloat(getComputedStyle(t).fontSize);
  while ((box.scrollHeight>box.clientHeight+1 || t.scrollWidth>t.clientWidth+1) && fs>30){fs-=2;t.style.fontSize=fs+'px';}
  return fs; }"""

async def main(spec, out):
    cards = json.loads(Path(spec).read_text(encoding="utf-8"))
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=2)
        for i, c in enumerate(cards):
            c.setdefault("kind", "card")
            await pg.set_content(STYLES[int(c.get("style", 1))](c))
            await pg.wait_for_timeout(400)
            await pg.evaluate(FIT)
            png = Path(out) / f"{c.get('name', f'card_{i+1}')}.png"
            await pg.screenshot(path=str(png))
            from PIL import Image
            jpg = png.with_suffix(".jpg")
            Image.open(png).convert("RGB").save(jpg, "JPEG", quality=90, optimize=True)
            png.unlink()
            print(jpg, os.path.getsize(jpg))
        await b.close()

if __name__ == "__main__":
    asyncio.run(main(sys.argv[1], sys.argv[2]))
