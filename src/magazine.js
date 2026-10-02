import content from './data/magazine.json';
import cutouts from './data/cutouts.json';

const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const photo = (item, className = '') => `<figure class="pasted-photo ${className}"><img src="${escape(item.src)}" alt="${escape(item.alt)}" ${item.cutout ? `style="clip-path:url(#scissors-${escape(item.cutout)})"` : ''} loading="lazy" decoding="async" width="${item.width}" height="${item.height}"></figure>`;

export function renderMagazine(root) {
  root.innerHTML = `<svg class="scissors-defs" aria-hidden="true" width="0" height="0"><defs>${Object.entries(cutouts).map(([id, path]) => `<clipPath id="scissors-${id}" clipPathUnits="objectBoundingBox"><path d="${path}"/></clipPath>`).join('')}</defs></svg>
  <article class="magazine" aria-label="Presente de aniversário da Nicole">
    <header class="cover paper-page">
      <h1>Feliz aniversário,<br><em>amor da minha vida!</em></h1>
      <div class="cover-composition"><div class="cover-photo cover-cutout"><img src="${escape(content.cover.src)}" alt="${escape(content.cover.alt)}" style="clip-path:url(#scissors-${escape(content.cover.cutout)})" fetchpriority="high" width="${content.cover.width}" height="${content.cover.height}"></div></div>
    </header>
    <section class="moments" aria-label="Nossas fotografias">${content.moments.map((item, i) => `<div class="moment paper-page moment-${i % 2} layout-${escape(item.layout)}">${photo(item, item.cutout ? 'subject-cutout' : 'whole-photo')}${item.note ? `<p class="moment-note">${escape(item.note)}</p>` : ''}</div>`).join('')}</section>
    <footer class="finale paper-page"><p class="closing-note">${escape(content.closing)}</p><p class="signature">${escape(content.signature)}</p><button class="open-special" type="button"><span>Booster edição especial</span><span aria-hidden="true">↗</span></button></footer>
  </article>`;
}
