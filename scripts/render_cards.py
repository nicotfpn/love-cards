"""Compose original photos with aschefield Full Art V / Supporter templates."""
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
    if c.get("photoCard"):
        continue # These cards compose the original photograph and frame in HTML/CSS.
    photo=ImageOps.exif_transpose(Image.open(ASSETS/'photos'/c['photo'])).convert('RGBA')
    if c.get('cropBox'):
        box=c['cropBox']; photo=photo.crop(tuple(int(v*(photo.width if j%2==0 else photo.height)) for j,v in enumerate(box)))
    # Crop only; all subjects, faces and backgrounds remain original photographs.
    card=ImageOps.fit(photo,(W,H),Image.Resampling.LANCZOS,centering=tuple(c['crop']))
    # Authentic template from the open-source PokeCardMaker asset collection.
    border=Image.open(ASSETS/'frames'/c['frame']).convert('RGBA').resize((W,H),Image.Resampling.LANCZOS)
    # A soft tonal veil under the moves, rather than opaque UI panels.
    veil=Image.new('RGBA',(W,H)); vd=ImageDraw.Draw(veil)
    if not c['trainer']:
        for y in range(630,1008):
            alpha=int(min(155,max(0,(y-630)*.6)))
            vd.line((30,y,717,y),fill=(10,15,23,alpha))
    card.alpha_composite(veil)
    card.alpha_composite(border)
    d=ImageDraw.Draw(card)
    if c['trainer']:
        text(d,(48,76),c['name'],53,True)
        icon(card,'fairy',(652,80),43)
        if c.get('effect',{}).get('description'):
            wrap(d,(55,790),c['effect']['description'],630,28,stroke=2)
        text(d,(50,975),f'{i+1:03}/{len(cards):03}',20,True,fill='white',stroke=1)
        d.text((166,975),'★',font=ImageFont.truetype('DejaVuSans.ttf',21),fill='#e7cc79')
    else:
        # The supplied blank includes the BASIC tab, type and V-rule graphics.
        text(d,(141,24),c['name'],48,True,fill='white',stroke=1)
        name_width=d.textlength(c['name'],font=font(48,True))
        v=Image.open(ASSETS/'symbols/v.png').convert('RGBA');v.thumbnail((63,48))
        card.alpha_composite(v,(int(152+name_width),33))
        text(d,(522,41),'HP',18,True,fill='white')
        text(d,(646,20),str(c['hp']),53,True,fill='white',anchor='ra')
        for j,a in enumerate(c['attacks']):
            y=672+j*105
            for k,energy in enumerate(a['energy']):icon(card,energy,(49+k*36,y+8),32)
            # White lettering with a fine dark keyline, like Full Art V print.
            d.text((205,y),a['name'],font=font(36,True,True),fill='white',stroke_width=2,stroke_fill='#172132')
            d.text((690,y),str(a['damage']),font=font(40,True),fill='white',stroke_width=2,stroke_fill='#172132',anchor='ra')
            words=a['effect'].split();line='';yy=y+46
            for word in words:
                trial=(line+' '+word).strip()
                if d.textlength(trial,font=font(24))>640 and line:
                    d.text((49,yy),line,font=font(24),fill='white',stroke_width=1,stroke_fill='#172132');yy+=26;line=word
                else:line=trial
            d.text((49,yy),line,font=font(24),fill='white',stroke_width=1,stroke_fill='#172132')
        icon(card,c['weakness'],(152,892),26)
        text(d,(182,891),'×2',23,True,fill='white')
        for k in range(c['retreat']):icon(card,'colorless',(556+k*30,892),26)
        text(d,(49,957),f'{i+1:03}/{len(cards):03}',21,True,fill='white')
        d.text((151,957),'★',font=ImageFont.truetype('DejaVuSans.ttf',21),fill='#e7cc79')
    # Mark the custom collection without touching original template credits.
    save_image(card,OUT/f"{c['id']}.png",'PNG')
    save_image(card.convert('RGB'),OUT/f"{c['id']}.webp",'WEBP',quality=92,method=6)

# Review sheet for raster-template cards; CSS photo cards are reviewed in-browser.
raster_cards=[c for c in cards if not c.get('photoCard')]
columns=min(4,len(raster_cards)); rows=(len(raster_cards)+columns-1)//columns
sheet=Image.new('RGB',(columns*325,rows*520),'#17121e')
for i,c in enumerate(raster_cards):
    im=Image.open(OUT/f"{c['id']}.png").convert('RGB'); im.thumbnail((305,445))
    sheet.paste(im,(15+(i%columns)*325,28+(i//columns)*520))
save_image(sheet,ROOT/'docs/cards-preview.jpg','JPEG',quality=95)
