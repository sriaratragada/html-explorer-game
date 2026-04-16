// Audio plumbing — silent no-op when assets are not present.
// Assets expected in public/audio/ (not checked in; see scope caveat).

let musicVolume = 0.5;
let sfxVolume = 0.7;
let currentMusic: HTMLAudioElement | null = null;
let currentTrack = '';

export function setMusicVolume(v: number) {
  musicVolume = Math.max(0, Math.min(1, v));
  if (currentMusic) currentMusic.volume = musicVolume;
}

export function setSfxVolume(v: number) {
  sfxVolume = Math.max(0, Math.min(1, v));
}

export function playMusic(track: string) {
  if (track === currentTrack && currentMusic && !currentMusic.paused) return;
  stopMusic();
  currentTrack = track;
  try {
    const audio = new Audio(`/audio/${track}.mp3`);
    audio.loop = true;
    audio.volume = musicVolume;
    audio.play().catch(() => { /* no asset — silent */ });
    currentMusic = audio;
  } catch {
    // silent fallback
  }
}

export function stopMusic() {
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.src = '';
    currentMusic = null;
  }
  currentTrack = '';
}

export function playSfx(name: string) {
  try {
    const audio = new Audio(`/audio/sfx/${name}.mp3`);
    audio.volume = sfxVolume;
    audio.play().catch(() => { /* silent */ });
  } catch {
    // silent fallback
  }
}

// Contextual music selection
export function getMusicTrack(continent: string | null, dayPhase: string): string {
  if (!continent) return 'ocean';
  const base = continent === 'auredia' ? 'auredia' : continent === 'trivalen' ? 'trivalen' : 'uloren';
  return dayPhase === 'night' ? `${base}_night` : base;
}
