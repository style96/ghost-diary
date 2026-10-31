"""Make temporary desktop TTS slower and spectral, using only Python stdlib."""
from array import array
from pathlib import Path
import json
import random
import sys
import wave

ROOT = Path(__file__).resolve().parent.parent
RATE = 22050
def process_voice(path, target, rng=None):
    rng = rng if rng is not None else random.Random(31)
    with wave.open(str(path), 'rb') as source:
        if source.getnchannels() != 1 or source.getsampwidth() != 2 or source.getframerate() != RATE:
            raise ValueError('Expected 22,050 Hz, mono, 16-bit source')
        samples = array('h', source.readframes(source.getnframes()))
        if sys.byteorder != 'little':
            samples.byteswap()
    # Lower pitch by slowing playback through resampling. Quiet delayed layers
    # add a little distance without obscuring the short spoken sentence.
    slowed = []
    for index in range(int(len(samples) / 0.82)):
        position = index * 0.82
        left = int(position)
        fraction = position - left
        slowed.append((samples[left] * (1 - fraction) + samples[min(left + 1, len(samples)-1)] * fraction) / 32768)
    lead = int(RATE * 0.12)
    result = [0.0] * (lead + len(slowed) + int(RATE * 0.65))
    filtered = 0.0
    for index, sample in enumerate(slowed):
        filtered = filtered * 0.32 + sample * 0.68
        breath = rng.uniform(-1, 1) * min(abs(filtered), 0.1) * 0.08
        value = filtered + breath
        at = lead + index
        result[at] += value
        result[at + int(RATE * 0.14)] += value * 0.16
        result[at + int(RATE * 0.29)] += value * 0.08
        result[at + int(RATE * 0.43)] += value * 0.04
    peak = max(max(abs(value) for value in result), 0.001)
    pcm = array('h', (int(max(-1, min(1, value / peak * 0.72)) * 32767) for value in result))
    if sys.byteorder != 'little':
        pcm.byteswap()
    with wave.open(str(target), 'wb') as destination:
        destination.setnchannels(1)
        destination.setsampwidth(2)
        destination.setframerate(RATE)
        destination.writeframes(pcm.tobytes())
    print(f'{target.name}: {len(result) / RATE:.2f}s, {target.stat().st_size:,} bytes')

def main():
    if len(sys.argv) == 4 and sys.argv[1] == '--single':
        process_voice(Path(sys.argv[2]), Path(sys.argv[3]))
        return
    if len(sys.argv) != 1:
        raise ValueError('Usage: process-ghost-voices.py [--single source.wav target.wav]')
    output = ROOT / 'public' / 'audio'
    output.mkdir(parents=True, exist_ok=True)
    manifest = []
    entries = json.loads((ROOT / 'src' / 'demo' / 'recorded.json').read_text(encoding='utf-8'))
    rng = random.Random(31)
    for path in sorted((ROOT / 'artifacts' / 'ghost-voice-source').glob('recorded-*.wav')):
        process_voice(path, output / path.name, rng)
        entry = next(entry for entry in entries if entry['id'] == path.stem)
        manifest.append({'id':entry['id'], 'src':f'/audio/{path.name}',
                         'text':' '.join(edit['text'] for edit in entry['haunting']['edits'])})
    if len(manifest) != len(entries):
        raise ValueError('Generate all demo voices before writing the manifest')
    (ROOT / 'src' / 'demo' / 'voices.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')

if __name__ == '__main__':
    main()
