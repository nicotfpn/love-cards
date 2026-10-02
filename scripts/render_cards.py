"""Compose original photos with PocketCards Full Art foil borders, no AI imagery."""
from pathlib import Path
from io import BytesIO
import json
from PIL import Image, ImageOps, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets'
OUT = ASSETS / 'cards'
OUT.mkdir(parents=True, exist_ok=True)
W, H = 747, 1038
def save_image(image, path, fmt, **options):
    buf=BytesIO()
    image.save(buf,format=fmt,**options)
    payload=buf.getvalue()
    temporary=path.with_suffix(path.suffix+'.tmp')
    assert temporary.write_bytes(payload)==len(payload)
    temporary.replace(path)
    with Image.open(path) as check: check.load()
def font(size, bold=False, condensed=False):
    name = 'GillSans-CondensedBold.ttf' if condensed else 'GillSans-Bold.ttf' if bold else 'GillSans.ttf'
    return ImageFont.truetype(str(ASSETS / 'fonts' / name), size)
def text(draw, xy, content, size=28, bold=False, fill='black', stroke=0, condensed=False, anchor=None):
    draw.text(xy, content, font=font(size,bold,condensed), fill=fill,
              stroke_width=stroke, stroke_fill='white', anchor=anchor)
def wrap(draw, xy, content, width, size=27, fill='black', stroke=2):
    line=''; y=xy[1]
    for word in content.split():
        trial=(line+' '+word).strip()
        if draw.textlength(trial, font=font(size)) > width and line:
            text(draw,(xy[0],y),line,size,fill=fill,stroke=stroke)
            y += size+3; line=word
        else: line=trial
    if line: text(draw,(xy[0],y),line,size,fill=fill,stroke=stroke)
    return y+size+3
def icon(card, kind, xy, size=35):
    im=Image.open(ASSETS/'icons'/f'{kind}.png').convert('RGBA').resize((size,size),Image.Resampling.LANCZOS)
    card.alpha_composite(im,xy)

cards=json.loads((ROOT/'src/data/cards.json').read_text())
for i,c in enumerate(cards):
    photo=ImageOps.exif_transpose(Image.open(ASSETS/'photos'/c['photo'])).convert('RGBA')
    if c.get('cropBox'):
        box=c['cropBox']; photo=photo.crop(tuple(int(v*(photo.width if j%2==0 else photo.height)) for j,v in enumerate(box)))
    # Crop only; all subjects, faces and backgrounds remain original photographs.
    card=ImageOps.fit(photo,(W,H),Image.Resampling.LANCZOS,centering=tuple(c['crop']))
    # The newer Pocket frame is a border only. Keep its original foil artwork,
    # but discard extracted interior remnants so nothing obscures the photo.
    frame_name='frame-full-art.webp' if c['trainer'] else 'frame-ex-full-art.webp'
    border=Image.open(ASSETS/'frames'/frame_name).convert('RGBA').resize((W,H),Image.Resampling.LANCZOS)
    alpha=border.getchannel('A')
    ImageDraw.Draw(alpha).rounded_rectangle((34,34,W-35,H-35),radius=9,fill=0)
    border.putalpha(alpha)
    card.alpha_composite(border)
    # Compact, translucent title and move areas retain a true full-photo field.
    panel=Image.new('RGBA',(W,H)); pd=ImageDraw.Draw(panel)
    pd.rectangle((35,34,711,127 if c['trainer'] else 106),fill=(255,255,255,110))
    card.alpha_composite(panel)
    d=ImageDraw.Draw(card)
    if c['trainer']:
        text(d,(49,37),'TREINADOR',24,True,stroke=1)
        text(d,(696,37),'Apoiador',26,True,fill='#a82852',stroke=1,anchor='ra')
        text(d,(49,69),'Nicole',55,True,stroke=2)
        icon(card,'fairy',(651,77),40)
        panel=Image.new('RGBA',(W,H)); pd=ImageDraw.Draw(panel)
        pd.rounded_rectangle((45,750,702,914),radius=10,fill=(255,245,252,190))
        pd.rounded_rectangle((45,934,702,981),radius=6,fill=(255,238,250,205))
        card.alpha_composite(panel); d=ImageDraw.Draw(card)
        text(d,(63,767),'Amor Infinito',42,True,condensed=True)
        wrap(d,(63,825),c['effect']['description'],610,28,stroke=0)
        wrap(d,(58,942),'Você pode jogar apenas 1 carta de Apoiador durante o seu turno.',620,21,stroke=0)
        text(d,(49,992),'Foto · Nicolas & Nicole',18,stroke=1)
        text(d,(698,992),'004/003 ★★',20,True,fill='#775300',stroke=1,anchor='ra')
    else:
        text(d,(48,37),'BÁSICO',20,True,stroke=1)
        text(d,(47,58),c['name'],44,True,stroke=2)
        ex_x=47+int(d.textlength(c['name'],font=font(44,True)))+10
        d.text((ex_x,65),'ex',font=ImageFont.truetype(str(ASSETS/'fonts/GillSans-Italic.ttf'),38),fill='#1b2530',stroke_width=2,stroke_fill='white')
        text(d,(538,62),'PV',19,True,stroke=1,anchor='ra')
        text(d,(638,46),str(c['hp']),49,True,stroke=2,anchor='ra')
        icon(card,{'Normal':'colorless','Dark':'dark','Psíquico':'psychic'}[c['type']],(654,48),43)
        panel=Image.new('RGBA',(W,H)); pd=ImageDraw.Draw(panel)
        pd.rounded_rectangle((40,687,706,899),radius=8,fill=(255,255,255,180))
        pd.rectangle((40,909,706,938),fill=(255,255,255,210))
        pd.rectangle((40,945,706,982),fill=(255,255,255,195))
        card.alpha_composite(panel); d=ImageDraw.Draw(card)
        for j,a in enumerate(c['attacks']):
            y=698+j*101
            for k,energy in enumerate(a['energy']):icon(card,energy,(49+k*36,y+4),32)
            text(d,(218,y),a['name'],38,True,condensed=True)
            text(d,(693,y),str(a['damage']),41,True,anchor='ra')
            wrap(d,(49,y+44),a['effect'],643,25,stroke=0)
        text(d,(49,911),'fraqueza',20)
        icon(card,c['weakness'],(128,912),22)
        text(d,(158,909),'×2',24,True)
        text(d,(271,911),'resistência',20)
        text(d,(519,911),'recuo',20)
        for k in range(c['retreat']):icon(card,'colorless',(576+k*28,912),22)
        text(d,(49,949),'Regra ex',22,True)
        wrap(d,(145,949),'Quando seu Pokémon ex é Nocauteado, seu oponente pega 2 cartas de Prêmio.',549,18,stroke=0)
        text(d,(49,992),'Foto · Nicolas & Nicole',18,stroke=1)
        text(d,(695,992),f'{i+1:03}/003 ★★',20,True,fill='#775300',stroke=1,anchor='ra')
    save_image(card,OUT/f"{c['id']}.png",'PNG')
    save_image(card.convert('RGB'),OUT/f"{c['id']}.webp",'WEBP',quality=92,method=6)

# Review sheet, using the exact exported images.
sheet=Image.new('RGB',(1300,520),'#17121e')
for i,c in enumerate(cards):
    im=Image.open(OUT/f"{c['id']}.png").convert('RGB'); im.thumbnail((305,445))
    sheet.paste(im,(15+i*325,28))
save_image(sheet,ROOT/'docs/cards-preview.jpg','JPEG',quality=95)
