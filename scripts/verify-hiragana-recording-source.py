"""Verify all chart WAV samples against the uploaded source and recorded fixed gains.

Usage: python3 scripts/verify-hiragana-recording-source.py --source /path/to/input.m4a
Requires ffmpeg; the original recording is intentionally not committed.
"""
import argparse
import array
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import wave

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
folder = root / 'japanese/audio/hiragana'
manifest = json.loads((folder / 'manifest.json').read_text())
assert hashlib.sha256(args.source.read_bytes()).hexdigest() == manifest['source']['sha256'], 'Wrong source recording'
raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(args.source), '-ar', '48000', '-ac', '1', '-f', 'f32le', '-'])
samples = array.array('f', raw)
if sys.byteorder != 'little':
    samples.byteswap()
for segment in manifest['segments']:
    start = round(segment['startSeconds'] * 48000)
    end = round(segment['endSeconds'] * 48000)
    gain = 10 ** (segment['gainDb'] / 20)
    expected = array.array('h', (min(32767, max(-32768, round(value * gain * 32768))) for value in samples[start:end]))
    if sys.byteorder != 'little':
        expected.byteswap()
    file = folder / segment['file']
    assert hashlib.sha256(file.read_bytes()).hexdigest() == segment['sha256'], segment['file'] + ': hash mismatch'
    with wave.open(str(file)) as wav:
        assert (wav.getnchannels(), wav.getsampwidth(), wav.getframerate(), wav.getnframes()) == (1, 2, 48000, end - start)
        assert wav.readframes(wav.getnframes()) == expected.tobytes(), segment['file'] + ': source PCM/gain mismatch'
print(f"Source SHA-256 and {len(manifest['segments'])} exact PCM ranges/gains verified; five original WAVs retained.")
