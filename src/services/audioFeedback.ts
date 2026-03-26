let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextConstructor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextConstructor();
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

function playTone({
  frequency,
  startAt,
  duration,
  gain,
  type = "sine",
}: {
  frequency: number;
  startAt: number;
  duration: number;
  gain: number;
  type?: OscillatorType;
}) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(gain, startAt + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

export function playAnswerTone(isCorrect: boolean) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  const startAt = context.currentTime + 0.01;

  if (isCorrect) {
    playTone({ frequency: 784, startAt, duration: 0.12, gain: 0.035, type: "sine" });
    playTone({ frequency: 1046, startAt: startAt + 0.09, duration: 0.16, gain: 0.03, type: "triangle" });
    return;
  }

  playTone({ frequency: 392, startAt, duration: 0.14, gain: 0.03, type: "sine" });
  playTone({ frequency: 311, startAt: startAt + 0.07, duration: 0.18, gain: 0.026, type: "triangle" });
}

export function stopSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
}

export function speakJapanese(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  const prompt = String(text ?? "").trim();

  if (!prompt) {
    return false;
  }

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(prompt);
  utterance.lang = "ja-JP";
  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  utterance.volume = 0.85;

  const voices = window.speechSynthesis.getVoices();
  const japaneseVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith("ja"));
  if (japaneseVoice) {
    utterance.voice = japaneseVoice;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}
