// utils/sound-manager.ts

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    // Load sound enabled preference from localStorage
    const savedPreference = localStorage.getItem("soundEnabled");
    this.enabled = savedPreference !== "false";
  }

  /**
   * Preload a sound file
   */
  preload(key: string, path: string) {
    if (typeof window === "undefined") return;

    const audio = new Audio(path);
    audio.preload = "auto";
    this.sounds.set(key, audio);
  }

  /**
   * Play a sound
   */
  play(key: string, volume: number = 0.5) {
    if (!this.enabled || typeof window === "undefined") return;

    const sound = this.sounds.get(key);
    if (sound) {
      // Clone the audio to allow overlapping plays
      const audioClone = sound.cloneNode() as HTMLAudioElement;
      audioClone.volume = Math.max(0, Math.min(1, volume));

      audioClone.play().catch((error) => {
        console.warn(`Failed to play sound "${key}":`, error);
      });
    } else {
      console.warn(`Sound "${key}" not found. Did you preload it?`);
    }
  }

  /**
   * Enable or disable sounds
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem("soundEnabled", enabled.toString());
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Initialize all notification sounds
   */
  initializeNotificationSounds() {
    this.preload("general", "/sounds/general.mp3");
    this.preload("levelup", "/sounds/levelup.mp3");
    this.preload("referral", "/sounds/referral.mp3");
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
