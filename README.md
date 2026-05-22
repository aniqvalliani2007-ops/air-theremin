

## ✨ Features

| Feature | Description |
|---|---|
| **🖐️ Real-time Hand Tracking** | MediaPipe AI detects your index finger position through your webcam at high speed |
| **🎵 12-Note Chromatic Scale** | A visual note ring displays 12 interactive zones mapped to musical frequencies |
| **〰️ Smooth Portamento** | Notes glide seamlessly into each other using `exponentialRampToValueAtTime` — no audio breaks |
| **🎛️ Waveform Selection** | Switch between Sine, Triangle, Sawtooth, and Square oscillators on the fly |
| **🎯 60fps Smoothed Tracking** | Dynamic EMA (Exponential Moving Average) smoothing delivers liquid-smooth cursor movement |
| **🔊 Adjustable Controls** | Fine-tune volume, sensitivity, and waveform from a glassmorphic settings panel |
| **🏠 Minimalist Landing Page** | Clean, white, glassy B&W landing page with header, footer, and navigation |
| **📱 Responsive Design** | Works on desktop and tablet screens with adaptive layouts |

## 🧠 How It Works

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Webcam     │───▶│  MediaPipe   │───▶│  Hit         │───▶│  Web Audio   │
│   Feed       │    │  Hand Track  │    │  Detection   │    │  Oscillator  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                           │                    │                    │
                     Index finger          Note zone           Frequency
                     coordinates            match             glide/play
```

1. **Camera Capture** — Your webcam feed is captured and mirrored in a floating preview panel
2. **AI Hand Detection** — MediaPipe Hands identifies 21 hand landmarks, isolating the index fingertip
3. **EMA Smoothing** — Raw coordinates are smoothed with a dynamic alpha filter at 60fps for buttery movement
4. **Hit Detection** — The smoothed fingertip position is tested against circular note zones arranged in a ring
5. **Audio Synthesis** — The Web Audio API creates a persistent oscillator that glides between frequencies using exponential ramping — no stops, no clicks, just continuous sound

## 🛠️ Tech Stack

- **Frontend** — Vanilla JavaScript (ES6+ modules), HTML5, CSS3
- **Build Tool** — [Vite](https://vitejs.dev/) for instant HMR and optimized builds
- **Hand Tracking** — [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html) via `@mediapipe/hands`
- **Audio** — [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) with OscillatorNode
- **Design** — Glassmorphism, Outfit + Inter typography, CSS animations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A device with a webcam
- A modern browser (Chrome, Edge, or Firefox recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/air-theremin.git
cd air-theremin

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Architecture

```
air-theremin/
├── index.html              # Main app (landing + theremin)
├── about.html              # About page
├── features.html           # Features page
├── package.json
├── vite.config.js
└── src/
    ├── main.js             # App entry point & orchestration
    ├── style.css           # Global styles, glassmorphism, animations
    ├── audio/
    │   ├── AudioEngine.js  # Web Audio API wrapper (oscillator, gain, glide)
    │   └── NotePlayer.js   # High-level play/stop with deduplication
    ├── camera/
    │   └── CameraManager.js# Webcam stream initialization
    ├── tracking/
    │   └── HandTracker.js  # MediaPipe Hands integration
    ├── noteRing/
    │   ├── NoteRing.js     # Canvas-rendered circular note layout
    │   ├── HitDetector.js  # Proximity-based zone collision detection
    │   └── notes.config.js # Note names, frequencies, colors
    ├── state/
    │   └── AppState.js     # Reactive state with pub/sub
    └── ui/
        └── Renderer.js     # 60fps render loop, EMA smoothing, hit → audio bridge
```

### Key Design Decisions

- **Dynamic EMA Smoothing** — The smoothing factor adapts to movement speed: fast gestures get near-instant response (α → 0.6), while slow precision movements stay silky smooth (α → 0.15)
- **Persistent Oscillator** — Instead of stop/start on every note change, a single oscillator lives for the entire session and smoothly glides frequency using `exponentialRampToValueAtTime`
- **Zone-aware Sustain** — Sound only stops when the hand completely leaves the camera. Moving between note zones keeps the last note sustained, eliminating audio gaps

## 🎮 Usage

1. Click **"Enter Application"** on the landing page
2. Grant camera permission when prompted
3. Hold your hand in front of the webcam
4. Move your **index finger** over the glowing note ring
5. Hover over different zones to play different notes
6. Open **Settings** (⚙️) to adjust volume, waveform, and sensitivity
7. Click **Home** to return to the landing page

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

