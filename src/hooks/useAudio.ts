import { useEffect } from "react";
import { useExperience } from "../store/useExperience";
let context: AudioContext | undefined;
let noise: AudioBufferSourceNode | undefined;
let master: GainNode | undefined;
export function unlockAudio() {
  try {
    context ??= new AudioContext();
    void context.resume().catch(() => {});
  } catch {
    /* Audio is optional. */
  }
}
function tone(frequency: number, duration: number) {
  if (!context || !master) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.09, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
  oscillator.connect(gain).connect(master);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
}
export function useAudio() {
  const ptt = useExperience((s) => s.ptt);
  const sound = useExperience((s) => s.sound);
  const pulse = useExperience((s) => s.pulse);
  useEffect(() => {
    noise?.stop();
    noise = undefined;
    master?.disconnect();
    master = undefined;
    if (!sound || !context) return;
    master = context.createGain();
    master.gain.value = 0.45;
    master.connect(context.destination);
    if (ptt) {
      tone(520, 0.06);
      const buffer = context.createBuffer(
        1,
        context.sampleRate,
        context.sampleRate,
      );
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < channel.length; i++)
        channel[i] = (Math.random() * 2 - 1) * 0.035;
      noise = context.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1800;
      noise.connect(filter).connect(master);
      noise.start();
    } else if (pulse > 0) tone(1100, 0.16);
    return () => {
      noise?.stop();
      noise = undefined;
      if (master) {
        master.gain.value = 0;
        master.disconnect();
        master = undefined;
      }
    };
  }, [ptt, sound, pulse]);
}
