import base64
import concurrent.futures
import hashlib
import json
from pathlib import Path, PurePosixPath
import urllib.request

root = Path.cwd().resolve()
manifest = json.loads((root / '.github/portfolio-import.json').read_text(encoding='utf-8'))
source = 'https://seokyeon-won-portfolio.nugury6248.chatgpt.site/'
if manifest['source_site'] != source:
    raise ValueError('Unexpected source site')

def load(entry):
    relative = PurePosixPath(entry['path'])
    if relative.is_absolute() or '..' in relative.parts or relative.parts[0] in {'.git', '.github', '.openai'}:
        raise ValueError('Invalid destination')
    if 'inline_utf8' in entry:
        content = entry['inline_utf8'].encode('utf-8')
    elif 'inline_base64' in entry:
        content = base64.b64decode(entry['inline_base64'], validate=True)
    else:
        if not entry['url'].startswith(source):
            raise ValueError('Unexpected file origin')
        request = urllib.request.Request(entry['url'], headers={'User-Agent': 'Mozilla/5.0 Portfolio-Import'})
        with urllib.request.urlopen(request, timeout=60) as response:
            if not 0 <= entry['size'] <= 25_000_000:
                raise ValueError('File exceeds the approved asset limit')
            content = response.read(entry['size'] + 1)
    if len(content) != entry['size'] or hashlib.sha256(content).hexdigest() != entry['sha256']:
        raise ValueError('Snapshot verification failed: ' + entry['path'])
    return relative, content, entry

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    verified = list(executor.map(load, manifest['files']))
# Protect user edits and allow an identical rerun before writing any files.
for relative, content, entry in verified:
    destination = root.joinpath(*relative.parts)
    if destination.exists():
        current = destination.read_bytes()
        git_blob = hashlib.sha1(b'blob ' + str(len(current)).encode() + b'\0' + current).hexdigest()
        if current != content and git_blob != entry.get('previous_git_blob_sha'):
            raise ValueError('Preserving changed file: ' + str(relative))

for relative, content, entry in verified:
    destination = root.joinpath(*relative.parts)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(content)
print('Imported and SHA-256 verified', len(verified), 'portfolio files.')
