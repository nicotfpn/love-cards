import content from './data/magazine.json';

const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const photo = (item, className = '') => `<figure class="pasted-photo ${className}" style="--photo-position:${escape(item.position || '50% 50%')}"><img src="${escape(item.src)}" alt="${escape(item.alt)}" loading="lazy" decoding="async" width="640" height="800">${item.caption ? `<figcaption>${escape(item.caption)}</figcaption>` : ''}</figure>`;

export function renderMagazine(root) {
  root.innerHTML = `<article class="magazine" aria-label="Revista de aniversário da Nicole">
    <header class="cover paper-page">
      <div class="issue-line"><span>Uma edição só tua</span><span>Feita por mim</span></div>
      <div class="masthead">paixão<span class="masthead-dot">.</span></div>
      <div class="cover-composition">
        <div class="cover-photo"><img src="${escape(content.cover.src)}" alt="${escape(content.cover.alt)}" style="object-position:${escape(content.cover.position)}" fetchpriority="high" width="1599" height="899"></div>
        <span class="tape cover-tape" aria-hidden="true"></span>
        <span class="cover-side-note handwritten" aria-hidden="true">minha garota<br>da capa ♡</span>
        <h1>Feliz aniversário,<br><em>amor da<br>minha vida!</em></h1>
      </div>
      <div class="cover-footer"><span>${escape(content.name)} / edição especial</span><a href="#bilhete" aria-label="Ler a revista">↓</a></div>
    </header>
    <section class="letter paper-page" id="bilhete" aria-labelledby="letter-heading">
      <div class="page-label"><span>01 / um bilhete</span><span>pra guardar</span></div>
      <div class="letter-sheet reveal-on-scroll"><span class="tape" aria-hidden="true"></span><span class="handwritten salutation">Oi, ${escape(content.nickname)}.</span><h2 id="letter-heading">Essa aqui<br>é toda tua.</h2><p>${escape(content.note)}</p><span class="handwritten signature">do teu namorado ♡</span></div>
    </section>
    ${content.moments.length ? `<section class="moments paper-page" aria-label="Nossas fotografias"><div class="page-label"><span>recortes de nós</span><span>meus favoritos</span></div>${content.moments.map((item, i) => `<div class="moment reveal-on-scroll moment-${i % 2}">${photo(item, item.cutout ? 'subject-cutout' : '')}<p class="moment-note handwritten">${escape(item.note)}</p></div>`).join('')}</section>` : ''}
    <section class="interview paper-page" aria-labelledby="interview-heading"><div class="page-label"><span>02 / entrevista</span><span>por quem te ama</span></div><div class="interview-heading reveal-on-scroll"><span class="small-kicker">Perguntas inventadas. Respostas minhas.</span><h2 id="interview-heading">Sobre a minha<br><em>favorita.</em></h2><span class="handwritten margin-note">sim, é tu.</span></div><dl>${content.interview.map((item, i) => `<div class="qa reveal-on-scroll"><span class="question-number" aria-hidden="true">0${i + 1}</span><div><dt>${escape(item.question)}</dt><dd>${escape(item.answer)}</dd></div></div>`).join('')}</dl><div class="music-note reveal-on-scroll"><span class="record" aria-hidden="true"><i></i></span><div><span class="small-kicker">No lado A desse dia</span><p>Jorge Ben Jor<br>& Djavan</p></div><span class="handwritten">a tua trilha.</span></div></section>
    <section class="pets paper-page" aria-labelledby="pets-heading"><div class="page-label"><span>03 / participação especial</span><span>nossa coleção</span></div><h2 id="pets-heading" class="reveal-on-scroll">Eles também<br><em>tinham que vir.</em></h2><div class="pet-collage">${content.pets.map((pet, i) => `<div class="pet-piece pet-${i} reveal-on-scroll">${photo({ ...pet, caption: pet.name })}<span class="pet-note handwritten">${escape(pet.note)}</span></div>`).join('')}</div><p class="pets-footnote">Salem, Furrencio & Theo.<br>As participações mais importantes dessa edição.</p></section>
    <section class="finale paper-page" aria-labelledby="finale-heading"><div class="page-label"><span>04 / só mais uma coisa</span><span>edição especial</span></div><div class="finale-content reveal-on-scroll"><span class="handwritten">guardei o pacotinho pro final.</span><h2 id="finale-heading">Minha coleção<br><em>favorita.</em></h2><p>Um pacote. Nossos raros.</p><button class="open-special" type="button"><span>Booster edição especial</span><span aria-hidden="true">↗</span></button><p class="closing handwritten">${escape(content.closing)}</p></div><footer class="colophon"><span>Feito pra ${escape(content.name)}.</span><span>Com amor, de mim.</span></footer></section>
  </article>`;
  // Observe only once; no scroll listener or continuous animation loop.
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible'); observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    root.querySelectorAll('.reveal-on-scroll').forEach((element) => { element.classList.add('awaiting-reveal'); observer.observe(element); });
  }
}
