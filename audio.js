/* ==========================================================================
   NetFix — Modul Audio Feedback Interaktif (Web Audio API Synthesizer)
   Menerapkan Prinsip Audio Clarity & Signaling (Richard E. Mayer)
   File: audio.js
   ========================================================================== */

window.NetFixAudio = (function () {
  let ctx = null;
  let muted = false;

  function ensureContext() {
    if (muted) return null;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!ctx) ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch (e) {
      return null;
    }
  }

  function playTone(freq, durationMs, type, gainVal, slideToFreq) {
    const ac = ensureContext();
    if (!ac) return;
    try {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type || "sine";
      const now = ac.currentTime;
      osc.frequency.setValueAtTime(freq, now);
      if (slideToFreq) {
        osc.frequency.exponentialRampToValueAtTime(slideToFreq, now + durationMs / 1000);
      }
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gainVal || 0.06, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(now);
      osc.stop(now + durationMs / 1000);
    } catch (e) {}
  }

  return {
    isMuted: function () { return muted; },
    toggleMute: function () {
      muted = !muted;
      if (!muted) this.click();
      return muted;
    },
    click: function () {
      // Playful soft pop
      playTone(480, 85, "sine", 0.055, 660);
    },
    hover: function () {
      playTone(620, 45, "sine", 0.02, 700);
    },
    scan: function () {
      playTone(587.33, 95, "triangle", 0.055, 740);
      setTimeout(function () { playTone(880, 120, "sine", 0.06, 1046.5); }, 85);
    },
    success: function () {
      // Playful cheerful arpeggio
      playTone(523.25, 110, "sine", 0.07);
      setTimeout(function () { playTone(659.25, 110, "sine", 0.07); }, 90);
      setTimeout(function () { playTone(783.99, 120, "sine", 0.075); }, 180);
      setTimeout(function () { playTone(1046.50, 240, "sine", 0.085); }, 270);
    },
    error: function () {
      // Soft playful bonk instead of harsh buzz
      playTone(300, 140, "triangle", 0.065, 210);
      setTimeout(function () { playTone(220, 190, "triangle", 0.06, 165); }, 125);
    }
  };
})();
