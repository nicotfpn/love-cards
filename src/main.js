import "./styles.css";
import cards from "./data/cards.json";

const app = document.querySelector("#app");
// This is a full-screen touch scene: gestures manipulate the pack/cards only.
const preventViewportGesture = (event) => {
  if (event.cancelable) event.preventDefault();
};
for (const name of [
  "gesturestart",
  "gesturechange",
  "gestureend",
  "touchmove",
  "dblclick",
]) {
  document.addEventListener(name, preventViewportGesture, { passive: false });
}
document.addEventListener(
  "touchstart",
  (event) => {
    if (event.touches.length > 1) preventViewportGesture(event);
  },
  { passive: false },
);
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let state = "sealed",
  index = 0,
  sensorCleanup,
  rotationCleanup;
const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, reduced.matches ? 30 : ms));
const cardURL = (card) => `/assets/cards/${card.id}.webp`;
cards.forEach((card) => {
  const img = new Image();
  img.src = cardURL(card);
});

app.innerHTML = `<div class="ambience" aria-hidden="true"></div>
  <div class="scene">
    <button class="booster" aria-label="Abrir pacote de quatro cartas. Toque ou arraste o lacre.">
      <span class="seal" aria-hidden="true"></span>
      <span class="pack-body" aria-hidden="true"><span class="edition"></span><span class="pack-ball"></span><span class="pack-foot"></span></span>
    </button>
    <section class="reveal" hidden aria-label="Cartas da coleção">
      <div class="card-space"></div><div class="inspect-controls"><button class="flip">Virar ↔</button><span>ARRASTE PARA GIRAR</span><button class="reset">Centralizar</button></div>
      <div class="caption" aria-live="polite"></div>
      <div class="controls"><button class="next">Próxima carta</button><button class="motion" hidden>Inclinar com o celular</button></div>
      <div class="collection" hidden aria-label="Rever cartas"></div>
      <button class="replay" hidden>Abrir novamente</button>
    </section>
  </div>`;
const booster = app.querySelector(".booster");
const reveal = app.querySelector(".reveal");
const space = app.querySelector(".card-space");
const caption = app.querySelector(".caption");
const next = app.querySelector(".next");
const motion = app.querySelector(".motion");
const collection = app.querySelector(".collection");
const replay = app.querySelector(".replay");

let start;
booster.addEventListener("pointerdown", (event) => {
  if (state !== "sealed") return;
  start = { x: event.clientX, y: event.clientY };
  booster.setPointerCapture(event.pointerId);
  booster.classList.add("grabbing");
});
booster.addEventListener("pointermove", (event) => {
  if (!start || state !== "sealed") return;
  const dx = Math.min(160, Math.max(-160, event.clientX - start.x));
  booster.style.setProperty("--tear", `${dx}px`);
});
booster.addEventListener("pointerup", (event) => {
  if (!start) return;
  const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
  start = undefined;
  if (distance < 12 || distance > 55) openPack();
  else resetPackGesture();
});
booster.addEventListener("pointercancel", resetPackGesture);
booster.addEventListener("click", () => {
  if (state === "sealed") openPack();
});
function resetPackGesture() {
  start = undefined;
  booster.classList.remove("grabbing");
  booster.style.setProperty("--tear", "0px");
}
async function openPack() {
  if (state !== "sealed") return;
  state = "opening";
  booster.disabled = true;
  resetPackGesture();
  booster.classList.add("opening");
  await delay(1100);
  booster.hidden = true;
  reveal.hidden = false;
  index = 0;
  await showCard();
}
function cardMarkup(card) {
  return `<div class="card-enter"><div class="card ${card.id}" tabindex="0" role="group" aria-label="Carta de ${card.name}. Arraste para girar; use as setas do teclado ou os botões Virar e Centralizar."><div class="card-face front"><img src="${cardURL(card)}" alt="Carta Full Art de ${card.name}, fotografia original" draggable="false"><div class="foil" aria-hidden="true"></div><div class="glare" aria-hidden="true"></div></div><div class="card-face back"><img src="/assets/cards/back.jpg" alt="Verso Pokémon" draggable="false"><div class="glare" aria-hidden="true"></div></div></div></div>`;
}
async function showCard() {
  state = "revealing";
  next.disabled = true;
  sensorCleanup?.();
  sensorCleanup = undefined;
  rotationCleanup?.();
  motion.textContent = "Inclinar com o celular";
  motion.disabled = false;
  if (index === 3) app.classList.add("fairy");
  else app.classList.remove("fairy");
  space.innerHTML = cardMarkup(cards[index]);
  caption.innerHTML = `<span class="counter">${String(index + 1).padStart(3, "0")} / 004</span><strong>${cards[index].name}</strong><span class="counter">${cards[index].type} · FULL ART</span>`;
  bindTilt(space.querySelector(".card"));
  motion.hidden = !("DeviceOrientationEvent" in window) || reduced.matches;
  await delay(index === 3 ? 900 : 600);
  state = "card";
  next.disabled = false;
  next.textContent = index === 3 ? "Ver coleção" : "Próxima carta";
}
next.addEventListener("click", async () => {
  if (state !== "card") return;
  if (index === 3) return finish();
  state = "transition";
  next.disabled = true;
  space.classList.add("leaving");
  await delay(280);
  index++;
  space.classList.remove("leaving");
  await showCard();
});
function finish() {
  state = "collection";
  reveal.classList.add("is-collection");
  next.hidden = true;
  collection.hidden = false;
  replay.hidden = false;
  collection.innerHTML = cards
    .map(
      (c, i) =>
        `<button data-index="${i}" aria-label="Rever ${c.name}" aria-pressed="${i === index}"><img src="${cardURL(c)}" alt="${c.name}" draggable="false"></button>`,
    )
    .join("");
}
collection.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button || state === "revealing") return;
  index = Number(button.dataset.index);
  collection
    .querySelectorAll("button")
    .forEach((b) => b.setAttribute("aria-pressed", b === button));
  await showCard();
  state = "collection";
});
replay.addEventListener("click", () => {
  if (state === "revealing") return;
  sensorCleanup?.();
  sensorCleanup = undefined;
  rotationCleanup?.();
  state = "sealed";
  reveal.classList.remove("is-collection");
  reveal.hidden = true;
  booster.hidden = false;
  booster.disabled = false;
  booster.classList.remove("opening");
  app.classList.remove("fairy");
  collection.hidden = true;
  replay.hidden = true;
  next.hidden = false;
  booster.focus({ preventScroll: true });
});
function bindTilt(card) {
  let rx = 0,
    ry = 0,
    sx = 0,
    sy = 0,
    down = false,
    previous,
    vx = 0,
    vy = 0,
    frame,
    disposed = false,
    lastMove = 0;
  const draw = () => {
    card.style.setProperty("--rx", `${rx + sx}deg`);
    card.style.setProperty("--ry", `${ry + sy}deg`);
    card.style.setProperty(
      "--gx",
      `${50 + Math.sin(((ry + sy) * Math.PI) / 180) * 45}%`,
    );
    card.style.setProperty(
      "--gy",
      `${50 - Math.sin(((rx + sx) * Math.PI) / 180) * 45}%`,
    );
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    vx = vy = 0;
  };
  const settle = () => {
    vx *= 0.91;
    vy *= 0.91;
    ry += vx;
    rx += vy;
    draw();
    if (Math.abs(vx) + Math.abs(vy) > 0.08 && !disposed)
      frame = requestAnimationFrame(settle);
    else card.classList.remove("active");
  };
  card.addEventListener("pointerdown", (e) => {
    if (down) return;
    stop();
    down = true;
    previous = { x: e.clientX, y: e.clientY, id: e.pointerId };
    card.setPointerCapture(e.pointerId);
    card.classList.add("active");
  });
  card.addEventListener("pointermove", (e) => {
    if (!down || e.pointerId !== previous.id) return;
    const scale = 360 / space.clientWidth;
    vx = (e.clientX - previous.x) * scale;
    vy = -(e.clientY - previous.y) * scale;
    lastMove = performance.now();
    ry += vx;
    rx += vy;
    previous = { x: e.clientX, y: e.clientY, id: e.pointerId };
    draw();
  });
  const release = (e) => {
    if (!down || e.pointerId !== previous.id) return;
    down = false;
    if (performance.now() - lastMove > 100) vx = vy = 0;
    vx = Math.max(-8, Math.min(8, vx));
    vy = Math.max(-8, Math.min(8, vy));
    if (reduced.matches || e.type === "pointercancel") {
      stop();
      card.classList.remove("active");
    } else frame = requestAnimationFrame(settle);
  };
  card.addEventListener("pointerup", release);
  card.addEventListener("pointercancel", release);
  card.addEventListener("keydown", (e) => {
    const change = {
      ArrowLeft: [0, -15],
      ArrowRight: [0, 15],
      ArrowUp: [15, 0],
      ArrowDown: [-15, 0],
    }[e.key];
    if (!change) return;
    e.preventDefault();
    stop();
    rx += change[0];
    ry += change[1];
    draw();
  });
  app.querySelector(".flip").onclick = () => {
    stop();
    rx = 0;
    ry = Math.round(ry / 180) * 180 + 180;
    draw();
  };
  app.querySelector(".reset").onclick = () => {
    stop();
    rx = ry = sx = sy = 0;
    draw();
  };
  rotationCleanup = () => {
    disposed = true;
    stop();
  };
  motion.onclick = async () => {
    try {
      if (
        typeof DeviceOrientationEvent.requestPermission === "function" &&
        (await DeviceOrientationEvent.requestPermission()) !== "granted"
      ) {
        motion.textContent = "Use o dedo para girar";
        return;
      }
      if (disposed) return;
      let baseline;
      const handler = (e) => {
        if (typeof e.beta !== "number" || typeof e.gamma !== "number" || down)
          return;
        baseline ??= { beta: e.beta, gamma: e.gamma };
        sx = Math.max(-18, Math.min(18, e.beta - baseline.beta));
        sy = Math.max(-18, Math.min(18, e.gamma - baseline.gamma));
        draw();
      };
      window.addEventListener("deviceorientation", handler);
      sensorCleanup = () =>
        window.removeEventListener("deviceorientation", handler);
      motion.textContent = "Movimento ativado";
      motion.disabled = true;
    } catch {
      motion.textContent = "Use o dedo para girar";
    }
  };
}
