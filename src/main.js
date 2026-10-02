import './styles.css';
import cards from './data/cards.json';

const app = document.querySelector('#app');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let state = 'sealed', index = 0, sensorCleanup;
const delay = ms => new Promise(resolve => setTimeout(resolve, reduced.matches ? 30 : ms));
const cardURL = card => `/assets/cards/${card.id}.webp`;
cards.forEach(card => { const img = new Image(); img.src = cardURL(card); });

app.innerHTML = `<div class="ambience" aria-hidden="true"></div>
  <div class="scene">
    <button class="booster" aria-label="Abrir pacote de quatro cartas. Toque ou arraste o lacre.">
      <span class="seal" aria-hidden="true"></span>
      <span class="pack-body"><span class="edition">EDIÇÃO ESPECIAL</span><span class="pack-star" aria-hidden="true">✧</span><span class="pack-title">Uma coleção<br>só nossa.</span><span class="pack-foot">4 CARTAS · UM UNIVERSO</span></span>
    </button>
    <section class="reveal" hidden aria-label="Cartas da coleção">
      <div class="card-space"></div>
      <div class="caption" aria-live="polite"></div>
      <div class="controls"><button class="next">Próxima carta</button><button class="motion" hidden>Inclinar com o celular</button></div>
      <div class="collection" hidden aria-label="Rever cartas"></div>
      <button class="replay" hidden>Abrir novamente</button>
    </section>
  </div>`;
const booster = app.querySelector('.booster');
const reveal = app.querySelector('.reveal');
const space = app.querySelector('.card-space');
const caption = app.querySelector('.caption');
const next = app.querySelector('.next');
const motion = app.querySelector('.motion');
const collection = app.querySelector('.collection');
const replay = app.querySelector('.replay');

let start;
booster.addEventListener('pointerdown', event => {
  if (state !== 'sealed') return;
  start = { x: event.clientX, y: event.clientY };
  booster.setPointerCapture(event.pointerId);
  booster.classList.add('grabbing');
});
booster.addEventListener('pointermove', event => {
  if (!start || state !== 'sealed') return;
  const dx = Math.min(160, Math.max(-160, event.clientX - start.x));
  booster.style.setProperty('--tear', `${dx}px`);
});
booster.addEventListener('pointerup', event => {
  if (!start) return;
  const distance = Math.hypot(event.clientX-start.x, event.clientY-start.y);
  start = undefined;
  if (distance < 12 || distance > 55) openPack();
  else resetPackGesture();
});
booster.addEventListener('pointercancel', resetPackGesture);
booster.addEventListener('click', () => { if (state === 'sealed') openPack(); });
function resetPackGesture() {
  start = undefined;
  booster.classList.remove('grabbing');
  booster.style.setProperty('--tear', '0px');
}
async function openPack() {
  if (state !== 'sealed') return;
  state = 'opening'; booster.disabled = true;
  resetPackGesture(); booster.classList.add('opening');
  await delay(1100);
  booster.hidden = true; reveal.hidden = false;
  index = 0; await showCard();
}
function cardMarkup(card) {
  return `<div class="card-enter"><div class="card ${card.id}" tabindex="0" role="img" aria-label="${card.name}, ${card.type}, ${card.trainer ? 'Treinadora Full Art. Amor Infinito.' : card.attacks.map(a=>`${a.name}, ${a.damage} de dano. ${a.effect}`).join(' ')}"><img src="${cardURL(card)}" alt="Carta Full Art de ${card.name}, usando sua fotografia original" draggable="false"><div class="foil" aria-hidden="true"></div><div class="glare" aria-hidden="true"></div></div></div>`;
}
async function showCard() {
  state = 'revealing'; next.disabled = true;
  sensorCleanup?.(); sensorCleanup = undefined;
  motion.textContent = 'Inclinar com o celular'; motion.disabled = false;
  if (index === 3) app.classList.add('fairy'); else app.classList.remove('fairy');
  space.innerHTML = cardMarkup(cards[index]);
  caption.innerHTML = `<span class="counter">${index+1} / 4 · ${cards[index].type}</span><p>${index===3 ? 'Minha favorita, em qualquer coleção.' : ''}</p>`;
  bindTilt(space.querySelector('.card'));
  motion.hidden = !('DeviceOrientationEvent' in window) || reduced.matches;
  await delay(index===3 ? 900 : 600);
  state = 'card'; next.disabled = false;
  next.textContent = index===3 ? 'Ver nossa coleção' : 'Próxima carta';
}
next.addEventListener('click', async () => {
  if (state !== 'card') return;
  if (index === 3) return finish();
  state='transition'; next.disabled = true;
  space.classList.add('leaving');
  await delay(280); index++; space.classList.remove('leaving');
  await showCard();
});
function finish() {
  state='collection'; next.hidden=true; collection.hidden=false; replay.hidden=false;
  collection.innerHTML = cards.map((c,i)=>`<button data-index="${i}" aria-label="Rever ${c.name}" aria-pressed="${i===index}"><img src="${cardURL(c)}" alt="${c.name}" draggable="false"></button>`).join('');
}
collection.addEventListener('click', async event => {
  const button=event.target.closest('button');
  if (!button || state==='revealing') return;
  index=Number(button.dataset.index);
  collection.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b===button));
  await showCard(); state='collection';
});
replay.addEventListener('click', () => {
  if (state==='revealing') return;
  sensorCleanup?.(); sensorCleanup=undefined;
  state='sealed'; reveal.hidden=true; booster.hidden=false; booster.disabled=false;
  booster.classList.remove('opening'); app.classList.remove('fairy');
  collection.hidden=true; replay.hidden=true; next.hidden=false;
  booster.focus({preventScroll:true});
});
function bindTilt(card) {
  let frame, target = {x:0,y:0}, current = {x:0,y:0}, down=false;
  function animate() {
    current.x += (target.x-current.x)*.16; current.y += (target.y-current.y)*.16;
    card.style.setProperty('--rx', `${-current.y*9}deg`);
    card.style.setProperty('--ry', `${current.x*9}deg`);
    card.style.setProperty('--gx', `${50+current.x*40}%`);
    card.style.setProperty('--gy', `${50+current.y*40}%`);
    if (card.isConnected && (Math.abs(target.x-current.x)+Math.abs(target.y-current.y)>.002)) frame=requestAnimationFrame(animate);
    else frame=undefined;
  }
  function set(x,y) { target={x:Math.max(-1,Math.min(1,x)),y:Math.max(-1,Math.min(1,y))}; if (!frame) frame=requestAnimationFrame(animate); }
  function move(event) {
    if (reduced.matches || (event.pointerType==='touch' && !down)) return;
    const rect=card.getBoundingClientRect();
    set((event.clientX-rect.left)/rect.width*2-1,(event.clientY-rect.top)/rect.height*2-1);
    card.classList.add('active');
  }
  card.addEventListener('pointerdown',e=>{down=true; card.setPointerCapture(e.pointerId); move(e);});
  card.addEventListener('pointermove',move);
  const reset=()=>{down=false;set(0,0);card.classList.remove('active');};
  card.addEventListener('pointerup',reset);card.addEventListener('pointercancel',reset);card.addEventListener('pointerleave',()=>{if(!down)reset();});
  motion.onclick=async()=>{
    try {
      if (typeof DeviceOrientationEvent.requestPermission==='function' && await DeviceOrientationEvent.requestPermission()!=='granted') {
        motion.textContent='Use o dedo para inclinar'; return;
      }
      let baseline;
      const handler=e=>{
        if (typeof e.beta!=='number'||typeof e.gamma!=='number') return;
        baseline ??= {beta:e.beta,gamma:e.gamma};
        if (!down) { card.classList.add('active'); set((e.gamma-baseline.gamma)/22,(e.beta-baseline.beta)/22); }
      };
      window.addEventListener('deviceorientation',handler);
      sensorCleanup=()=>window.removeEventListener('deviceorientation',handler);
      motion.textContent='Movimento ativado';motion.disabled=true;
    } catch {motion.textContent='Use o dedo para inclinar';}
  };
}
