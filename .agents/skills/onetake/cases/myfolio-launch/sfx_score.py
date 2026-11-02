#!/usr/bin/env python3
# onetake · MyFolio Launch Film Sound Score · lineage otk-7f3e1c
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "scripts"))
from sfx_palette import Score, air, glass, wood, sub, bubble, wobble, pan_of
import numpy as np

rng = np.random.default_rng(42)
s = Score(dur=15.0, T60=1.2)
place = s.place

# 1 · Opening Hook: Three glass touches in the dark void
for t, f in zip((0.15, 0.55, 0.95), (659, 784, 523)):
    place(glass(f, 0.8, 0.6), t, 0.16, 0.0, 0.45)

# Seed landing
place(sub(80, 0.4), 1.15, 0.22, 0.0, 0.35)

# 2 · Prompt Card: Entrance swoosh, keys, and click
place(air(0.4, 250, 2200, 1.3), 1.70, 0.25, 0.0, 0.4)
TXT = 'myfolio compile --profile github.com/abdulaziz'
for i, ch in enumerate(TXT):
    if ch in ' -/.' or rng.uniform() < 0.3:
        continue
    place(wood(180 + rng.uniform(-15, 15), 0.08), 1.85 + i / 36 + rng.uniform(0, 0.003), 0.09 * rng.uniform(0.7, 1.2), -0.05, 0.15)

# Click Compile CTA
place(wood(260, 0.08), 3.00, 0.35, pan_of(1280), 0.2)
place(wood(190, 0.07), 3.06, 0.24, pan_of(1280), 0.2)

# 3 · Synthesis Dashboard Panel: Whoosh in + 5 ticking glass chimes
place(air(0.35, 300, 2400, 1.3), 3.45, 0.20, 0.0, 0.4)
frequencies = (587, 659, 784, 880, 1174)
for i, f in enumerate(frequencies):
    place(glass(f, 0.6, 0.85), 3.65 + i * 0.28, 0.16 if i < 4 else 0.22, -0.08, 0.4)
# Pass chord
place(glass(1318, 1.4, 0.5), 4.77, 0.18, -0.05, 0.6)
place(glass(1976, 1.4, 0.4), 4.79, 0.14, 0.05, 0.6)

# 4 · Flying 3D Showcase Screens (RBP, Jack 3D, Kage Temple)
screens_t = (5.35, 6.45, 7.55)
for t in screens_t:
    place(air(0.52, 220, 3200, 1.3, 0.35), t - 0.04, 0.48, 0.5, 0.45, pan_to=-0.2)
    place(sub(68, 0.5), t + 0.14, 0.24, 0.0, 0.3)
    place(air(0.38, 2400, 260, 1.4, 0.3), t + 0.80, 0.28, -0.1, 0.45, pan_to=-0.6)

# 5 · Browser Window: Full viewport hold beat
place(air(0.65, 180, 1900, 1.1, 0.5), 8.65, 0.35, 0.0, 0.55)
place(sub(55, 0.9), 8.80, 0.28, 0.0, 0.4)

# 6 · Staccato Hits: 4 sub punches
stac_times = (11.50, 11.95, 12.40, 12.85)
for i, t in enumerate(stac_times):
    place(sub(76 - i * 4, 0.45), t, 0.42, 0.0, 0.22)

# 7 · Grand Lockup: Deep obsidian sub drop + ethereal resonance
place(sub(46, 1.4), 13.40, 0.62, 0.0, 0.45)
place(glass(440, 1.8, 0.4), 13.44, 0.15, 0.0, 0.7)
place(air(0.6, 120, 1400, 1.2), 13.42, 0.22, 0.0, 0.5)

out_wav = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sfx.wav")
s.write(out_wav)
print(f"Generated {out_wav} successfully.")
