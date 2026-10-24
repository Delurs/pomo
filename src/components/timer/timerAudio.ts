// Audio controller for alarm sounds and Web Audio API fallback chime loop

class TimerAudioController {
  private alarmAudio: HTMLAudioElement | null = null;
  private alarmInterval: ReturnType<typeof setInterval> | null = null;

  public playAlarmSound(): void {
    this.stopAlarmSound();
    try {
      const audio = new Audio("/alarm.mp3");
      audio.loop = true;
      this.alarmAudio = audio;
      audio.play().catch((err) => {
        console.warn("Could not play /alarm.mp3, falling back to Web Audio chime loop:", err);
        this.playFallbackBeepLoop();
      });
    } catch {
      this.playFallbackBeepLoop();
    }
  }

  public stopAlarmSound(): void {
    if (this.alarmAudio) {
      try {
        this.alarmAudio.pause();
        this.alarmAudio.currentTime = 0;
      } catch (e) {
        console.warn("Could not pause alarm audio:", e);
      }
      this.alarmAudio = null;
    }
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }

  private playFallbackBeepLoop(): void {
    this.playFallbackBeep();
    this.alarmInterval = setInterval(() => {
      this.playFallbackBeep();
    }, 1500);
  }

  private playFallbackBeep(): void {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.25);
      gain2.gain.setValueAtTime(0.3, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 0.8);
    } catch (e) {
      console.warn("Web audio fallback failed:", e);
    }
  }
}

export const timerAudio = new TimerAudioController();
