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
      <div class="card-space"></div>
      <div class="caption" aria-live="polite"></div>
      <div class="collection" hidden aria-label="Rever cartas"></div>
      <button class="replay" hidden>Abrir novamente</button>
    </section>
  </div>`;
const booster = app.querySelector(".booster");
const reveal = app.querySelector(".reveal");
const space = app.querySelector(".card-space");
const caption = app.querySelector(".caption");
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
  return `<div class="card-enter"><div class="card ${card.id}" tabindex="0" role="button" aria-label="${card.name}. Um toque avança; dois toques ativam ou desativam a rotação. No teclado: Enter avança, espaço alterna rotação e setas giram." aria-pressed="false" aria-disabled="true"><div class="card-face front"><img src="${cardURL(card)}" alt="Carta Full Art de ${card.name}, fotografia original" draggable="false"><div class="foil" aria-hidden="true"></div><div class="glare" aria-hidden="true"></div></div><div class="card-face back"><img src="/assets/cards/back.jpg" alt="Verso Pokémon" draggable="false"><div class="glare" aria-hidden="true"></div></div></div></div>`;
}
async function showCard() {
  state = "revealing";
  rotationCleanup?.();
  if (index === 3) app.classList.add("fairy");
  else app.classList.remove("fairy");
  space.innerHTML = cardMarkup(cards[index]);
  caption.innerHTML = `<span class="counter">${String(index + 1).padStart(3, "0")} / 004</span><strong>${cards[index].name}</strong><span class="counter">${cards[index].type} · FULL ART</span>`;
  bindTilt(space.querySelector(".card"));
  await delay(index === 3 ? 900 : 600);
  state = "card";
  space.querySelector(".card").setAttribute("aria-disabled", "false");
}
async function advanceCard() {
  if (state === "collection") {
    index = (index + 1) % cards.length;
    await showCard();
    state = "collection";
    updateSelection();
    return;
  }
  if (state !== "card") return;
  if (index === 3) return finish();
  state = "transition";
  space.classList.add("leaving");
  await delay(280);
  index++;
  space.classList.remove("leaving");
  await showCard();
}
function updateSelection() {
  collection.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", Number(b.dataset.index) === index));
}
function finish() {
  state = "collection";
  reveal.classList.add("is-collection");
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
  booster.focus({ preventScroll: true });
});
function bindTilt(card) {
  let rx = 0, ry = 0, vx = 0, vy = 0, frame, tapTimer;
  let inspecting = false, down, disposed = false, lastMove = 0;
  const ready = () => !disposed && (state === "card" || state === "collection");
  const draw = () => {
    card.style.setProperty("--rx", `${rx}deg`);
    card.style.setProperty("--ry", `${ry}deg`);
    card.style.setProperty("--gx", `${50 + Math.sin(ry * Math.PI / 180) * 45}%`);
    card.style.setProperty("--gy", `${50 - Math.sin(rx * Math.PI / 180) * 45}%`);
  };
  const stop = () => { cancelAnimationFrame(frame); vx = vy = 0; };
  const toggleInspection = () => {
    stop(); inspecting = !inspecting;
    card.classList.toggle("inspecting", inspecting);
    card.setAttribute("aria-pressed", String(inspecting));
    if (!inspecting) { rx = ry = 0; draw(); }
  };
  const settle = () => {
    vx *= .91; vy *= .91; ry += vx; rx += vy; draw();
    if (!disposed && Math.abs(vx) + Math.abs(vy) > .08) frame = requestAnimationFrame(settle);
    else card.classList.remove("active");
  };
  // Listen on the stationary surface, so even an edge-on card remains draggable.
  const press = (e) => {
    if (!ready() || down || !e.isPrimary || e.button !== 0) return;
    stop();
    const second = Boolean(tapTimer);
    if (second) { clearTimeout(tapTimer); tapTimer = undefined; toggleInspection(); }
    down = { id: e.pointerId, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, moved: false, second };
    space.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!down || e.pointerId !== down.id) return;
    if (Math.hypot(e.clientX-down.startX,e.clientY-down.startY)>8) down.moved = true;
    if (inspecting && down.moved) {
      const scale = 360 / space.clientWidth;
      vx = (e.clientX-down.x)*scale; vy = -(e.clientY-down.y)*scale;
      ry += vx; rx += vy; lastMove = performance.now(); draw();
      card.classList.add("active");
    }
    down.x = e.clientX; down.y = e.clientY;
  };
  const release = (e) => {
    if (!down || e.pointerId !== down.id) return;
    const gesture = down; down = undefined;
    if (e.type === "pointercancel") { stop(); card.classList.remove("active"); return; }
    if (gesture.moved) {
      if (inspecting && !reduced.matches) {
        if (performance.now()-lastMove>100) vx = vy = 0;
        vx = Math.max(-8,Math.min(8,vx)); vy = Math.max(-8,Math.min(8,vy));
        frame = requestAnimationFrame(settle);
      } else card.classList.remove("active");
      return;
    }
    if (gesture.second) return;
    // Wait briefly to distinguish a single tap from a double tap.
    tapTimer = setTimeout(() => { tapTimer = undefined; if (ready()) advanceCard(); }, 280);
  };
  space.addEventListener("pointerdown", press);
  space.addEventListener("pointermove", move);
  space.addEventListener("pointerup", release);
  space.addEventListener("pointercancel", release);
  card.addEventListener("click", e => {
    // Assistive-technology activation has no pointer sequence.
    if (e.detail === 0 && ready()) advanceCard();
  });
  card.addEventListener("keydown", e => {
    if (!ready()) return;
    if (["Enter", " ", "Escape", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
    if (e.repeat) return;
    clearTimeout(tapTimer); tapTimer = undefined;
    if (e.key === "Enter") return void advanceCard();
    if (e.key === " ") return toggleInspection();
    if (e.key === "Escape" && inspecting) return toggleInspection();
    const delta = {ArrowLeft:[0,-15],ArrowRight:[0,15],ArrowUp:[15,0],ArrowDown:[-15,0]}[e.key];
    if (delta && inspecting) { stop(); rx += delta[0]; ry += delta[1]; draw(); }
  });
  rotationCleanup = () => {
    disposed = true; stop(); clearTimeout(tapTimer);
    space.removeEventListener("pointerdown", press);
    space.removeEventListener("pointermove", move);
    space.removeEventListener("pointerup", release);
    space.removeEventListener("pointercancel", release);
  };
}
