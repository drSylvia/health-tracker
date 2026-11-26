"""Update local static asset URL versions. Run from Health Tracker project root."""
import re
import sys
from pathlib import Path

if len(sys.argv) != 2 or not re.fullmatch(r'\d+\.\d+\.\d+', sys.argv[1]):
    sys.exit('Usage: python release.py 1.0.3')
version = sys.argv[1]
root = Path(__file__).resolve().parent
index = root / 'index.html'
ui = root / 'js/ui.js'
if not index.is_file() or not ui.is_file() or not (root / 'css/style.css').is_file():
    sys.exit('Place release.py in the Health Tracker project root.')
# Match quoted local CSS, JS and SVG URLs, including existing version suffixes.
pattern = re.compile(r'''(?P<q>['"])(?P<path>\.{1,2}/[\w./-]+\.(?:css|js|svg))(?:\?v=[\w.-]+)?(?P=q)''')
files = [index, *sorted((root/'css').rglob('*.css')), *sorted((root/'js').rglob('*.js'))]
changes = {}
for path in files:
    original = path.read_text(encoding='utf-8')
    def replace(match):
        target = (path.parent / match['path']).resolve()
        if not target.is_file():
            raise ValueError(f'Missing asset: {path.relative_to(root)} -> {match["path"]}')
        return f'{match["q"]}{match["path"]}?v={version}{match["q"]}'
    updated = pattern.sub(replace, original)
    if path == ui:
        marker = "main.append(card,healthSettings(),backup,el('small',t('goalNote'),'text-muted'));"
        version_line = f"main.append(el('small', (getPreferences().language === 'zh-CN' ? '当前版本' : 'Version') + ' · V{version}', 'text-muted')); /* release-version */"
        if '/* release-version */' in updated:
            updated, count = re.subn(r"main\.append\(el\('small',[^\n]*?\); /\* release-version \*/", lambda _: version_line, updated)
            if count != 1:
                sys.exit('Cannot identify existing version label. No files written.')
        elif marker in updated:
            updated = updated.replace(marker, marker + '\n' + version_line, 1)
        else:
            sys.exit('Settings layout differs from expected. No files written. Please inspect js/ui.js.')
    if updated != original:
        changes[path] = updated
for path, content in changes.items():
    path.write_text(content, encoding='utf-8')
    print('Updated:', path.relative_to(root))
print(f'V{version}: {len(changes)} files updated. Review git diff before committing.')
