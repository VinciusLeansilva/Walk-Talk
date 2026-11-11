import { useEffect, useState } from "react";
export const tilt = { x: 0, y: 0, enabled: false };
type MotionAPI = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<string>;
};
export function useParallax() {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [supported, setSupported] = useState(false);
  useEffect(
    () => setSupported(typeof DeviceOrientationEvent !== "undefined"),
    [],
  );
  useEffect(() => {
    if (!enabled) {
      tilt.enabled = false;
      return;
    }
    const update = (event: DeviceOrientationEvent) => {
      tilt.x = Math.max(-1, Math.min(1, (event.gamma ?? 0) / 35));
      tilt.y = Math.max(-1, Math.min(1, ((event.beta ?? 30) - 30) / 35));
      tilt.enabled = true;
      document.documentElement.style.setProperty(
        "--tilt-x",
        `${tilt.x * 6}deg`,
      );
      document.documentElement.style.setProperty(
        "--tilt-y",
        `${tilt.y * 6}deg`,
      );
    };
    window.addEventListener("deviceorientation", update);
    return () => {
      window.removeEventListener("deviceorientation", update);
      tilt.enabled = false;
      document.documentElement.style.removeProperty("--tilt-x");
      document.documentElement.style.removeProperty("--tilt-y");
    };
  }, [enabled]);
  const toggle = async () => {
    if (enabled) {
      setEnabled(false);
      setMessage("");
      return;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMessage(
        "Movimento reduzido está ativo nas preferências do dispositivo.",
      );
      return;
    }
    try {
      const api = DeviceOrientationEvent as MotionAPI;
      if (
        api.requestPermission &&
        (await api.requestPermission()) !== "granted"
      ) {
        setMessage("Acesso ao movimento não autorizado.");
        return;
      }
      setEnabled(true);
      setMessage("Incline o celular para explorar a Terra 3D.");
    } catch {
      setMessage("O sensor não está disponível neste navegador.");
    }
  };
  return { supported, enabled, message, toggle };
}
