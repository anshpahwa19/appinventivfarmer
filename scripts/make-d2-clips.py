"""
Renders Direction 02's sample video clips into public/media/fj/.

Real footage was not available in the build environment, so each clip is an
honest placeholder: a slowly moving tonal field in the colours of the video's
photo slot, with a slate that says it is a sample. Set in Plus Jakarta Sans
(the app's typeface), instanced from the bundled variable font.

Needs: ffmpeg (libx264, drawtext, gradients) and `pip install fonttools brotli`.
Run:   python3 scripts/make-d2-clips.py
"""
import os, subprocess, tempfile
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT = os.path.join(ROOT, 'src/assets/fonts/plus-jakarta-sans-latin-wght-normal.woff2')
OUT = os.path.join(ROOT, 'public/media/fj')
os.makedirs(OUT, exist_ok=True)
tmp = tempfile.mkdtemp()

def instance(w):
    f = TTFont(FONT)
    f.flavor = None
    inst = instantiateVariableFont(f, {'wght': w})
    p = os.path.join(tmp, f'pjs-{w}.ttf')
    inst.save(p)
    return p

LIGHT, BOLD = instance(300), instance(760)

# slot id: (colour a, colour b, colour c, title)
CLIPS = {
    'harvest-baler': ('f3c27a', 'b8873f', '5a3d1c', 'Baling paddy straw'),
    'soil-sample': ('2e1f14', '8a5d36', 'c9925a', 'Taking a soil sample'),
    'cotton-drip': ('a8c3dc', '6c9a55', '2a3f22', 'Drip lines in cotton'),
    'paddy-closeup': ('2c3d1d', 'c9b75a', 'f1e7a1', 'Spraying decomposer'),
    'paddy-field': ('8fa9b8', '4f9452', '1c4127', 'Scouting for stem borer'),
    'wheat-grain': ('3b2716', 'd6a75a', 'f1cf8c', 'Storing wheat safely'),
}

def esc(t):
    return t.replace(':', r'\:').replace("'", r"\'")

for slot, (a, b, c, title) in CLIPS.items():
    dur = 14
    vf = ','.join([
        'noise=alls=14:allf=t',
        f"drawbox=x=0:y=ih-110:w=iw:h=110:color=0x0a1128@0.72:t=fill",
        f"drawtext=fontfile={BOLD}:text='SAMPLE CLIP':fontcolor=0xc8f135:fontsize=18:x=32:y=30",
        f"drawtext=fontfile={LIGHT}:text='Footage to be supplied':fontcolor=white@0.85:fontsize=18:x=32:y=56",
        f"drawtext=fontfile={BOLD}:text='{esc(title)}':fontcolor=white:fontsize=34:x=32:y=h-88",
        f"drawtext=fontfile={LIGHT}:text='Kisani Urjaa · Field Journal':fontcolor=white@0.7:fontsize=16:x=32:y=h-40",
        f"drawtext=fontfile={LIGHT}:text='%{{eif\\:t\\:d}}s':fontcolor=white@0.7:fontsize=16:x=w-70:y=h-40",
    ])
    src = f'gradients=s=960x540:c0=0x{a}:c1=0x{b}:c2=0x{c}:n=3:speed=0.004:d={dur}:r=24:type=radial'
    out = os.path.join(OUT, f'{slot}.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', src, '-vf', vf, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '30', '-preset', 'veryslow', '-movflags', '+faststart', '-t', str(dur), out], check=True)
    print(out, os.path.getsize(out) // 1024, 'KB')
