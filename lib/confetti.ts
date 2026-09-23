import confetti from "canvas-confetti";

const BRAND_COLORS = ["#4b875c", "#8b3a3a", "#6e93b0", "#f3c243"];

export function celebrate() {
  const duration = 1400;
  const end = Date.now() + duration;

  confetti({
    particleCount: 90,
    spread: 80,
    startVelocity: 42,
    origin: { y: 0.6 },
    colors: BRAND_COLORS,
    shapes: ["square", "circle"],
    scalar: 1,
  });

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors: BRAND_COLORS,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors: BRAND_COLORS,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
