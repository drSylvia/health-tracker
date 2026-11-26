"""Update local static asset URL versions. Run from Health Tracker project root."""
import re
import sys
from pathlib import Path

import json

root = Path(__file__).resolve().parent
index = root / 'index.html'
ui = root / 'js/ui.js'
state = root / 'version.json'
if not index.is_file() or not ui.is_file() or not (root / 'css/style.css').is_file():
    sys.exit('Place release.py in the Health Tracker project root.')
if len(sys.argv) > 2:
    sys.exit('Usage: python release.py [patch|minor|major|status|X.Y.Z]')
command = sys.argv[1] if len(sys.argv) == 2 else 'patch'
def parse(value):
    if not isinstance(value, str) or not re.fullmatch(r'(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)', value):
        raise ValueError('Invalid version: ' + str(value))
    return tuple(map(int, value.split('.')))
versions = set(re.findall(r'\?v=(\d+\.\d+\.\d+)(?=[\'"])', index.read_text(encoding='utf-8')))
try:
    if state.exists():
        current = json.loads(state.read_text(encoding='utf-8'))['version']
        parse(current)
        if versions and versions != {current}:
            sys.exit('Version mismatch between version.json and index.html; inspect before releasing.')
    elif len(versions) == 1:
        current = versions.pop()
    elif versions:
        sys.exit('Conflicting versions in index.html; inspect before releasing.')
    else:
        current = None
    if command == 'status':
        print('Current version:', current or 'not initialized')
        sys.exit(0)
    if command in ('patch', 'minor', 'major'):
        if current is None:
            sys.exit('No existing version found. Initialize once with python release.py 1.0.3 (or your actual version).')
        a,b,c = parse(current)
        version = '.'.join(map(str, {'patch': (a,b,c+1), 'minor': (a,b+1,0), 'major': (a+1,0,0)}[command]))
    else:
        parse(command)
        version = command
        if current and parse(version) < parse(current):
            sys.exit('Refusing to downgrade version.')
except (ValueError, KeyError, TypeError) as exc:
    sys.exit(str(exc))
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
state_content = json.dumps({"version": version}, indent=2) + "\n"
if not state.exists() or state.read_text(encoding="utf-8") != state_content:
    changes[state] = state_content
for path, content in changes.items():
    path.write_text(content, encoding='utf-8')
    print('Updated:', path.relative_to(root))
print(f'V{version}: {len(changes)} files updated. Review git diff before committing.')
