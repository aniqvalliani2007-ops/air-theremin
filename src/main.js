import { CameraManager } from './camera/CameraManager.js';
import { HandTracker } from './tracking/HandTracker.js';
import { AudioEngine } from './audio/AudioEngine.js';
import { NotePlayer } from './audio/NotePlayer.js';
import { AppState } from './state/AppState.js';
import { Renderer } from './ui/Renderer.js';

// DOM Elements
const videoElement = document.getElementById('videoElement');
const cameraWrapper = document.getElementById('cameraWrapper');
const canvasElement = document.getElementById('canvasElement');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const backButton = document.getElementById('backButton');
const controlBar = document.getElementById('controlBar');
const noteValueEl = document.getElementById('noteValue');
const freqValueEl = document.getElementById('freqValue');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const waveformSelect = document.getElementById('waveformSelect');
const sensitivitySlider = document.getElementById('sensitivitySlider');
const sensitivityValue = document.getElementById('sensitivityValue');
const toast = document.getElementById('toast');

// Initialize modules
const camera = new CameraManager(videoElement);
const audioEngine = new AudioEngine();
const notePlayer = new NotePlayer(audioEngine);
const appState = new AppState();
const renderer = new Renderer(canvasElement, appState, {
  onNoteChange: (note) => {
    if (note) {
      // Play the note and update UI
      notePlayer.play(note);
      updateUI(note);
      updateStatus(true, true);
    } else {
      // Stop playing when note is null
      notePlayer.stop();
      updateUI(null);
      updateStatus(false, false);
    }
  }
});

let handTracker = null;
let isAppRunning = false;

// Update UI
function updateUI(note) {
  if (note) {
    noteValueEl.textContent = note.name;
    freqValueEl.textContent = `${note.frequency.toFixed(1)} Hz`;
  } else {
    noteValueEl.textContent = '—';
    freqValueEl.textContent = '0 Hz';
  }
}

function updateStatus(handDetected, isPlaying) {
  if (handDetected && isPlaying) {
    statusDot.classList.add('active');
    statusText.textContent = 'Playing';
  } else if (handDetected) {
    statusDot.classList.add('active');
    statusText.textContent = 'Hand Detected';
  } else {
    statusDot.classList.remove('active');
    statusText.textContent = 'Ready';
  }
}

function showToast(message, duration = 2000) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Settings handlers
function setupSettings() {
  volumeSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    volumeValue.textContent = `${val}%`;
    audioEngine.setVolume(parseInt(val));
  });
  
  waveformSelect.addEventListener('change', (e) => {
    audioEngine.setWaveform(e.target.value);
    showToast(`Waveform: ${e.target.value}`);
  });
  
  sensitivitySlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    sensitivityValue.textContent = val.toFixed(2);
    appState.setSensitivity(val);
    renderer.updateSensitivity(val);
  });
  
  settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('active');
  });
  
  const closeModal = () => settingsModal.classList.remove('active');
  closeModalBtn.addEventListener('click', closeModal);
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeModal();
  });
}

// Initialize app
async function initApp() {
  setupSettings();
  renderer.init();
  
  startButton.addEventListener('click', startTheremin);
  if (backButton) backButton.addEventListener('click', stopTheremin);
}

// Start theremin
async function startTheremin() {
  if (isAppRunning) return;
  
  try {
    showToast('Starting camera...');
    await camera.init();
    
    showToast('Initializing audio...');
    await audioEngine.init();
    
    showToast('Starting hand tracking...');
    handTracker = new HandTracker(
      videoElement,
      (fingertip) => {
        renderer.updateFingertip(fingertip);
        updateStatus(!!fingertip, false);
      },
      (detected) => appState.setHandDetected(detected)
    );
    handTracker.init();
    
    isAppRunning = true;
    startScreen.classList.add('hide');
    controlBar.classList.add('visible');
    if (cameraWrapper) cameraWrapper.classList.add('active');
    if (backButton) backButton.classList.add('visible');
    
    // Resume audio on user interaction
    const resumeAudio = async () => {
      await audioEngine.resume();
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
      showToast('Ready to play! Move your finger over the ring', 2000);
    };
    
    document.addEventListener('click', resumeAudio);
    document.addEventListener('touchstart', resumeAudio);
    
    showToast('Air Theremin ready!', 2000);
  } catch (error) {
    console.error('Failed to start:', error);
    showToast(error.message || 'Failed to start. Please check camera permissions.');
  }
}

// Stop theremin
function stopTheremin() {
  if (!isAppRunning) return;
  isAppRunning = false;
  
  if (handTracker) {
    handTracker.stop();
    handTracker = null;
  }
  camera.stop();
  notePlayer.stop();
  
  startScreen.classList.remove('hide');
  controlBar.classList.remove('visible');
  if (cameraWrapper) cameraWrapper.classList.remove('active');
  if (backButton) backButton.classList.remove('visible');
  
  renderer.updateFingertip(null);
  updateUI(null);
  updateStatus(false, false);
}

// Cleanup
window.addEventListener('beforeunload', () => {
  if (handTracker) handTracker.stop();
  camera.stop();
  notePlayer.stop();
});

// Start
initApp();