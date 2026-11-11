"""Generate a static guide with every text source and a reproducible project ZIP."""
from pathlib import Path
from html import escape
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'node_modules', '.git', '.openai', 'dist', 'test-results', 'playwright-report', '__pycache__', '.wrangler', '.vinext', '.sites-runtime', '.next', 'outputs'}
GENERATED = {'public/guia.html', 'public/walk-talk-source.zip'}
TEXT = {'.tsx', '.ts', '.mjs', '.css', '.json', '.html', '.md', '.py', '.svg', '.toml', '.sql', '.js'}

def source_files():
    return sorted(p for p in ROOT.rglob('*') if p.is_file()
                  and not any(part in EXCLUDE for part in p.relative_to(ROOT).parts)
                  and p.relative_to(ROOT).as_posix() not in GENERATED
                  and not p.name.endswith(('.log', '.tsbuildinfo'))
                  and (not p.name.startswith('.env') or p.name == '.env.example')
                  and not p.name.startswith('.dev.vars'))

def markdown(text):
    output, code, block = [], False, []
    for line in text.splitlines():
        if line.startswith('```'):
            if code:
                output.append('<pre><code>' + escape('\n'.join(block)) + '</code></pre>')
                block = []
            code = not code
        elif code:
            block.append(line)
        elif line.startswith('#'):
            match = re.match(r'^(#{1,6})\s+(.*)', line)
            if match:
                level = len(match[1]); output.append(f'<h{level}>' + escape(match[2]) + f'</h{level}>')
        elif line.strip():
            content = escape(line)
            content = re.sub(r'`([^`]+)`', r'<code>\1</code>', content)
            output.append('<p>' + content + '</p>')
    return '\n'.join(output)

files = source_files()
entries = []
portable_manifest = '{\n  "d1": "DB",\n  "r2": null\n}\n'
entries.append('<details><summary>.openai/hosting.json (modelo portável, sem identidade do Site)</summary><pre><code>' + escape(portable_manifest) + '</code></pre></details>')
for index, p in enumerate(files):
    if p.suffix not in TEXT or p.name == 'package-lock.json':
        continue
    name = p.relative_to(ROOT).as_posix()
    entries.append(f'<details id="source-{index}"><summary>{escape(name)}</summary><pre><code>{escape(p.read_text())}</code></pre></details>')
validation = ROOT / 'docs' / 'VALIDACAO.md'
html = '''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#050b1f"><title>WALK TALK — Código completo e guia</title><style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#050b1f;color:#dbe8f5;font:16px/1.8 system-ui,sans-serif}main{max-width:980px;margin:auto;padding:55px 24px}a{color:#22d3ee}nav{display:flex;gap:22px;flex-wrap:wrap;border-bottom:1px solid #22384e;padding-bottom:25px}h1,h2,h3{line-height:1.25;color:#fff;letter-spacing:-.5px}h1{font-size:40px;margin-top:50px}h2{margin-top:50px;border-bottom:1px solid #22384e;padding-bottom:15px}h3{color:#8edee9;margin-top:30px}p{color:#afc2d5}pre{background:#0b1b2d;border:1px solid #274157;border-radius:8px;padding:20px;overflow:auto;font:13px/1.65 ui-monospace,monospace}p code{color:#80e6f3;background:#102535;padding:2px 4px}details{margin:15px 0;border:1px solid #294353;border-radius:7px}summary{padding:16px;cursor:pointer;color:#75e3f0;font-family:monospace;overflow-wrap:anywhere}summary:focus-visible,a:focus-visible{outline:2px solid #22d3ee;outline-offset:3px}details pre{border:0;border-top:1px solid #294353;margin:0;border-radius:0;max-height:700px}button{background:#22d3ee;color:#05121f;border:0;padding:12px 18px;border-radius:5px;cursor:pointer}footer{margin-top:50px;color:#91a8be;font-size:13px}@media(max-width:600px){body{font-size:14px}h1{font-size:30px}pre{font-size:11px;padding:14px}}
</style></head><body><main><nav><a href="/">← Voltar à experiência</a><a href="#fontes">Código arquivo por arquivo</a><a href="/walk-talk-source.zip" download>Baixar projeto completo (.zip)</a></nav>'''
html += markdown((ROOT / 'docs/GUIA.md').read_text())
if validation.exists():
    html += markdown(validation.read_text())
html += '<h2 id="fontes">Código completo, arquivo por arquivo</h2><p>Abra cada arquivo para consultar o código. O ZIP contém também os assets binários e o package-lock.json completo.</p>'
html += '\n'.join(entries)
html += '<footer>WALK TALK — projeto educativo em React, TypeScript e Vite. Nenhum áudio é capturado ou transmitido.</footer></main></body></html>'
(ROOT / 'public/guia.html').write_text(html)
with zipfile.ZipFile(ROOT / 'public/walk-talk-source.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    archive.writestr('walk-talk/.openai/hosting.json', portable_manifest)
    for p in files:
        archive.write(p, 'walk-talk/' + p.relative_to(ROOT).as_posix())
    archive.write(ROOT / 'public/guia.html', 'walk-talk/public/guia.html')
print(f'Guide: {len(entries)} source files. ZIP: {(ROOT / "public/walk-talk-source.zip").stat().st_size:,} bytes.')
