"""Create the placeholder voice and amplitude cues with the local Flite voice.

Requires ffmpeg with the flite filter. The generated files are committed, so
normal development and deployment do not require speech generation tools.
"""
import array
import json
import math
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
script = (root / 'src/intro.txt').read_text().strip()
with tempfile.TemporaryDirectory() as directory:
    text_file = Path(directory) / 'intro.txt'
    text_file.write_text(script)
    output = root / 'public/intro.mp3'
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
                    '-f', 'lavfi', '-i', f'flite=textfile={text_file}:voice=rms',
                    '-af', 'loudnorm=I=-18:TP=-2:LRA=7', '-ar', '24000',
                    '-codec:a', 'libmp3lame', '-b:a', '64k', str(output)], check=True)
    pcm = subprocess.check_output(['ffmpeg', '-hide_banner', '-loglevel', 'error',
                                   '-i', str(output), '-f', 'f32le', '-ac', '1',
                                   '-ar', '24000', '-'])
    samples = array.array('f', pcm)
    step = 0.04
    chunk = int(24000 * step)
    levels = [math.sqrt(sum(x*x for x in samples[i:i+chunk]) / len(samples[i:i+chunk]))
              for i in range(0, len(samples), chunk)]
    reference = sorted(levels)[int(len(levels)*0.9)] or 1
    cues = [round(min(1, max(0, (level/reference - 0.035))), 3) for level in levels]
    (root / 'public/intro-cues.json').write_text(json.dumps({
        'text': script, 'step': step, 'duration': len(samples)/24000, 'levels': cues
    }, separators=(',', ':')) + '\n')
    print(f'Generated {len(samples)/24000:.1f}s introduction and {len(cues)} mouth cues.')
