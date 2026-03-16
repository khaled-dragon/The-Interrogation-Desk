# The Interrogation Desk — Project Codex

A noir interrogation game where you play as a detective trying to break a suspect's composure and extract a confession — through questions, silence, threats, and evidence. 10 different cases, each with a unique suspect and story, picked randomly every run.

## Play

**[Live Demo →](melodic-tapioca-25a9ce.netlify.app)**

## How to Run Locally

Just open `index.html` in any browser. No build step, no dependencies, no server needed.

```
interrogation-desk/
├── index.html          # Main entry point
├── css/
│   └── styles.css      # All visual styles
├── js/
│   ├── audio.js        # Web Audio engine (music + SFX)
│   ├── suspects.js     # GameState + 10 suspect database
│   ├── engine.js       # Choice system, meters, dialogue, FX
│   └── game.js         # Game flow (start, reset, load, end)
└── README.md
```

## How to Deploy on GitHub Pages

1. Push this folder to a GitHub repo
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Your game will be live at `https://your-username.github.io/repo-name`

## The 10 Cases

| # | Suspect | Crime |
|---|---------|-------|
| 1 | Marcus Webb | Briefcase theft |
| 2 | Sofia Reyes | Document fraud |
| 3 | Derek Banks | Arson |
| 4 | Linda Chen | Botanical sabotage |
| 5 | Emeka Okafor | Insider trading |
| 6 | Alexei Volkov | Corporate espionage |
| 7 | Tommy Harris | Match fixing |
| 8 | Grace Malone | Destruction of a will |
| 9 | Darius Nazari | Cyber defamation |
| 10 | Carla Santos | Pharmaceutical theft |

## Built With

- Vanilla HTML / CSS / JavaScript — zero frameworks
- Web Audio API — all music and SFX generated in-browser
- Google Fonts — Special Elite, Cutive Mono, Playfair Display, IM Fell English
