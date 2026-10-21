import asyncio, base64, math
from playwright.async_api import async_playwright
LOGO="data:image/png;base64,"+base64.b64encode(open("/mnt/user-data/uploads/1792518020593_Registan_Lc_8.png","rb").read()).decode()
MARKP="M165.856 2.06302C158.945 5.75288 150.073 7.41728 132.831 8.26025C124.017 8.69084 114.315 9.56197 111.269 10.1954C90.9612 14.4244 81.7388 27.7843 78.9167 57.0672C78.153 64.9876 77.7159 64.5967 76.4339 54.8463C74.6327 41.1476 68.2406 27.7413 60.5789 21.5937C44.5132 8.70161 15.6941 11.3092 2.97628 26.8064L0 30.4341V44.6669C0 55.7447 0.22971 58.7995 1.0366 58.4451C14.4494 52.5468 23.433 50.8948 38.5615 51.5431C50.0868 52.0383 56.6821 53.4444 63.3951 56.8386C69.458 59.9041 72.9625 62.7916 75.5374 66.8416L77.8038 70.4064L80.8465 65.8289C88.4393 54.4058 100.942 49.3728 125.179 47.9825C132.728 47.5494 140.861 46.6559 143.253 45.9968C160.586 41.2222 167.959 30.5012 169.669 7.59035C169.983 3.37799 170.094 -0.0377754 169.914 0.000315512C169.734 0.0384064 167.908 0.966667 165.856 2.06302ZM0 101.783V120H77.9523H155.905V101.783V83.5652H77.9523H0V101.783Z"
V={1:dict(a="#1CC8B5",b="#0A7C87",ink="#06464D",word="ONE",star="#FFE27A"),
   5:dict(a="#FF8A3D",b="#E84E0F",ink="#6B1E00",word="FIVE",star="#FFE27A"),
   10:dict(a="#FFD45C",b="#E0A00E",ink="#5A3A00",word="TEN",star="#FFFFFF")}
def waves(color, op):
    # guilloche-like wave lines
    p=[]
    for i in range(16):
        y=2+i*3.1; d=f"M-2 {y:.2f} "+" ".join(f"Q {x+2.5:.2f} {y+(1.6 if (x//5)%2==0 else -1.6):.2f} {x+5:.2f} {y:.2f}" for x in range(-2,92,5))
        p.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="0.18" opacity="{op}"/>')
    return f'<svg class="a" style="left:0;top:0" width="90mm" height="50mm" viewBox="0 0 90 50">{"".join(p)}</svg>'
def rosette(cx,cy,r,color):
    p=[]
    for k in range(24):
        a=k*math.pi/12
        p.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r*0.38:.2f}" transform="rotate({k*7.5} {cx} {cy})" fill="none" stroke="{color}" stroke-width="0.15"/>')
    return "".join(p)
def star(x,y,s,c,rot=0): return f'<svg class="a" style="left:{x}mm;top:{y}mm;transform:rotate({rot}deg)" width="{s}mm" height="{s}mm" viewBox="0 0 24 24"><path fill="{c}" d="M12 1.5l3 6.8 7.4.7-5.6 5 1.7 7.3L12 17.4l-6.5 3.9 1.7-7.3-5.6-5 7.4-.7z"/></svg>'
def front(v, serial):
    c=V[v]; big=f"{v}"
    ring="REG COIN ★ REG COIN ★ REG COIN ★ REG COIN ★"
    return f"""<div class="card" style="background:linear-gradient(135deg,{c['a']},{c['b']})">
{waves('#ffffff',.22)}
<svg class="a" style="left:3mm;top:3mm" width="44mm" height="44mm" viewBox="0 0 44 44">
 <circle cx="22" cy="22" r="21" fill="#ffffff" opacity=".18"/>{rosette(22,22,20,'#ffffff')}
 <circle cx="22" cy="22" r="15.5" fill="#ffffff"/>
 <circle cx="22" cy="22" r="14.2" fill="none" stroke="{c['b']}" stroke-width=".5" stroke-dasharray=".6 .6"/>
 <defs><path id="rp{v}" d="M22 22 m-18.2 0 a18.2 18.2 0 1 1 36.4 0 a18.2 18.2 0 1 1 -36.4 0"/></defs>
 <text font-family="Poppins" font-weight="700" font-size="2.9" letter-spacing=".55" fill="#ffffff"><textPath href="#rp{v}" textLength="113.5" lengthAdjust="spacing">{ring}</textPath></text>
 <text x="22" y="{28.6 if v<10 else 27.8}" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="{20 if v<10 else 16.5}" fill="{c['b']}" letter-spacing="-1">{big}</text>
</svg>
{star(1.5,1.5,6,c['star'],-12)}{star(39,39,5,c['star'],18)}
<div class="a" style="left:49mm;top:4.5mm;right:3.5mm;height:9mm;background:#fff;border-radius:2.2mm;display:flex;align-items:center;justify-content:center"><img src="{LOGO}" style="height:5.6mm"></div>
<div class="a" style="left:49mm;top:16.5mm;color:#fff;font-family:'Inter Display';font-weight:900;font-size:9.4mm;line-height:.9;letter-spacing:-.3mm;text-shadow:0 .5mm 0 {c['ink']}55">REG<br>COIN</div>
<div class="a" style="left:49mm;top:35.6mm;color:{c['ink']};background:#ffffffd9;border-radius:5mm;padding:.5mm 2.4mm;font-family:Poppins;font-weight:700;font-size:2.9mm;letter-spacing:.25mm">{c['word']} COIN</div>
<div class="a" style="left:49mm;bottom:3mm;color:#fff;font-family:Poppins;font-weight:600;font-size:2.1mm;letter-spacing:.35mm;opacity:.95">ACADEMY FILIALI</div>
<div class="a" style="right:3.5mm;bottom:3mm;color:#fff;font-family:'DejaVu Sans Mono';font-size:2mm;opacity:.9">№ {serial:06d}</div>
</div>"""
def back(v):
    c=V[v]
    return f"""<div class="card" style="background:#FFF8F0">
{waves(c['b'],.18)}
<svg class="a" style="left:-6mm;top:-6mm;opacity:.12" width="40mm" height="40mm" viewBox="0 0 44 44">{rosette(22,22,20,c['b'])}</svg>
<svg class="a" style="right:-8mm;bottom:-8mm;opacity:.12" width="44mm" height="44mm" viewBox="0 0 44 44">{rosette(22,22,20,c['b'])}</svg>
<svg class="a" style="left:32.5mm;top:5mm" width="25mm" height="17.6mm" viewBox="0 0 170 120"><path fill-rule="evenodd" d="{MARKP}" fill="#E84E0F"/></svg>
<div class="a" style="left:0;right:0;top:24.5mm;text-align:center;font-family:Lora;font-style:italic;font-weight:600;font-size:4.6mm;color:#2a1810">Bilim — eng katta boylik!</div>
<div class="a" style="left:0;right:0;top:31.5mm;text-align:center;font-family:Poppins;font-size:2.3mm;color:#6b4a38">Faqat Registan LC Academy filialida amal qiladi</div>
<div class="a" style="left:0;right:0;bottom:3.2mm;display:flex;justify-content:center"><span style="background:linear-gradient(135deg,{c['a']},{c['b']});color:#fff;border-radius:5mm;padding:.6mm 3mm;font-family:'Inter Display';font-weight:800;font-size:3.2mm;letter-spacing:.3mm">{v} REG COIN</span></div>
</div>"""
CSS="""@page{size:A4;margin:0}*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Poppins}.a{position:absolute}
.sheet{width:210mm;height:297mm;position:relative;page-break-after:always;overflow:hidden;background:#fff}
.grid{position:absolute;left:15mm;top:23.5mm;width:180mm;height:250mm;display:grid;grid-template-columns:90mm 90mm;grid-template-rows:repeat(5,50mm)}
.card{width:90mm;height:50mm;position:relative;overflow:hidden}
.cm{position:absolute;background:#000}
.lbl{position:absolute;left:15mm;top:8mm;font:3mm Poppins;color:#888}"""
def marks():
    m=[]
    xs=[15,105,195]; ys=[23.5+50*i for i in range(6)]
    for x in xs:
        m.append(f'<div class="cm" style="left:{x-0.1}mm;top:{ys[0]-8}mm;width:.2mm;height:5mm"></div><div class="cm" style="left:{x-0.1}mm;top:{ys[-1]+3}mm;width:.2mm;height:5mm"></div>')
    for y in ys:
        m.append(f'<div class="cm" style="top:{y-0.1}mm;left:{xs[0]-10}mm;height:.2mm;width:7mm"></div><div class="cm" style="top:{y-0.1}mm;left:{xs[-1]+3}mm;height:.2mm;width:7mm"></div>')
    return "".join(m)
def doc(v, start):
    f="".join(front(v,start+i) for i in range(10)); b="".join(back(v) for _ in range(10))
    return f"""<html><head><meta charset='utf-8'><style>{CSS}</style></head><body>
<div class="sheet"><div class="lbl">REG COIN {v} — OLD TOMON (1-bet) · № {start:06d}–{start+9:06d}</div>{marks()}<div class="grid">{f}</div></div>
<div class="sheet"><div class="lbl">REG COIN {v} — ORQA TOMON (2-bet)</div>{marks()}<div class="grid">{b}</div></div></body></html>"""
async def main():
    async with async_playwright() as p:
        br=await p.chromium.launch(); pg=await br.new_page()
        for v,start in [(1,10001),(5,50001),(10,100001)]:
            await pg.set_content(doc(v,start)); await pg.wait_for_timeout(800)
            await pg.pdf(path=f"REG_COIN_{v}.pdf", format="A4", print_background=True, prefer_css_page_size=True)
            # previews: one front + back card
            await pg.set_viewport_size({"width":760,"height":230})
            await pg.set_content(f"<html><head><style>{CSS} body{{background:#ddd;padding:6mm;display:flex;gap:6mm}}</style></head><body>{front(v,start)}{back(v)}</body></html>")
            await pg.wait_for_timeout(500)
            await pg.screenshot(path=f"preview_{v}.png", full_page=False)
        await br.close()
asyncio.run(main())
