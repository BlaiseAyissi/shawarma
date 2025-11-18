// Notification sound utility
export class NotificationSound {
  private static audioContext: AudioContext | null = null;
  private static isEnabled = true;

  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  static isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  static playNotificationSound(type: 'success' | 'info' | 'warning' | 'error' = 'info') {
    if (!this.isEnabled) return;

    try {
      const audioContext = this.getAudioContext();
      
      // Create different tones for different notification types
      const frequencies = {
        success: [523.25, 659.25, 783.99], // C5, E5, G5 (major chord)
        info: [440, 554.37], // A4, C#5
        warning: [349.23, 440], // F4, A4
        error: [220, 277.18] // A3, C#4
      };

      const freq = frequencies[type];
      const duration = type === 'success' ? 0.3 : 0.2;

      freq.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';

        // Envelope for smooth sound
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

        const startTime = audioContext.currentTime + (index * 0.1);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  // Play a simple beep for basic notifications
  static playBeep() {
    if (!this.isEnabled) return;

    try {
      const audioContext = this.getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.warn('Could not play beep sound:', error);
    }
  }

  // Play a more complex notification sound for important alerts
  static playAlert() {
    if (!this.isEnabled) return;

    try {
      const audioContext = this.getAudioContext();
      
      // Play two quick beeps
      [0, 0.2].forEach(delay => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + delay);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + 0.1);

        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + 0.1);
      });
    } catch (error) {
      console.warn('Could not play alert sound:', error);
    }
  }
}