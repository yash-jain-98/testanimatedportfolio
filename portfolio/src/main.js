import './style.css';
import { skills, projects } from './content.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
$('#year').textContent = new Date().getFullYear();

// SVG arrows render consistently even on machines without symbol fonts.
function replaceArrows() {
const arrowNodes = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
  acceptNode: node => node.parentElement.closest('script, style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
});
while (walker.nextNode()) if (walker.currentNode.textContent.includes('↗')) arrowNodes.push(walker.currentNode);
arrowNodes.forEach(node => {
  const parts = node.textContent.split('↗');
  const fragment = document.createDocumentFragment();
  parts.forEach((part, index) => {
    if (index) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 16 16'); svg.setAttribute('class', 'arrow-icon'); svg.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M3 13 13 3M3 3h10v10'); path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '1.3');
      svg.append(path); fragment.append(svg);
    }
    fragment.append(document.createTextNode(part));
  });
  node.replaceWith(fragment);
});
}

const grid = $('#skills-grid');
skills.forEach(([symbol, name, category, description], index) => {
  const button = document.createElement('button');
  button.className = `skill-element ${category}`;
  button.dataset.category = category;
  button.setAttribute('aria-label', `${name}: ${category}`);
  button.innerHTML = `<small>${String(index + 1).padStart(2, '0')}</small><strong>${symbol}</strong><span>${name}</span>`;
  const select = () => {
    $$('.skill-element').forEach(el => el.classList.remove('selected'));
    button.classList.add('selected');
    $('.detail-symbol').textContent = symbol;
    $('.skill-detail h3').textContent = name;
    $('.skill-detail p').textContent = description;
    $('.skill-category').textContent = category.toUpperCase();
  };
  button.addEventListener('mouseenter', select);
  button.addEventListener('focus', select);
  button.addEventListener('click', select);
  grid.append(button);
});
grid.children[4].classList.add('selected');
$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  $$('[data-filter]').forEach(el => {
    el.classList.toggle('active', el === button);
    el.setAttribute('aria-pressed', String(el === button));
  });
  $$('.skill-element').forEach(el => {
    el.hidden = button.dataset.filter !== 'all' && el.dataset.category !== button.dataset.filter;
  });
  [...grid.children].find(el => !el.hidden)?.click();
}));

// The ID has two real faces, with a persistent click-to-flip state.
const idCard = $('.id-card');
let idTouched = false;
let idDemoTimers = [];
function flipId(flipped) {
  idCard.classList.toggle('is-flipped', flipped);
  idCard.setAttribute('aria-pressed', String(flipped));
  idCard.setAttribute('aria-label', flipped ? 'Flip developer ID back to the portrait' : 'Flip developer ID to see personal details');
  $('.id-front').setAttribute('aria-hidden', String(flipped));
  $('.id-back').setAttribute('aria-hidden', String(!flipped));
  $('.id-toggle span').textContent = flipped ? 'Back to the familiar face.' : "Turn it over. There's more.";
}
function toggleId() {
  idTouched = true;
  idDemoTimers.forEach(clearTimeout);
  flipId(!idCard.classList.contains('is-flipped'));
}
idCard.addEventListener('click', toggleId);
$('.id-toggle').addEventListener('click', toggleId);
idCard.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleId(); }
});
idCard.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch' || reducedMotion.matches) return;
  const rect = idCard.getBoundingClientRect();
  idCard.style.setProperty('--id-tilt-x', `${((event.clientY - rect.top) / rect.height - .5) * -9}deg`);
  idCard.style.setProperty('--id-tilt-y', `${((event.clientX - rect.left) / rect.width - .5) * 12}deg`);
});
idCard.addEventListener('pointerleave', () => { idCard.style.setProperty('--id-tilt-x', '0deg'); idCard.style.setProperty('--id-tilt-y', '0deg'); });
const idDemoObserver = new IntersectionObserver(entries => {
  if (!entries.some(entry => entry.isIntersecting)) return;
  idDemoObserver.disconnect();
  if (idTouched || reducedMotion.matches) return;
  idDemoTimers = [setTimeout(() => { if (!idTouched) flipId(true); }, 1300), setTimeout(() => { if (!idTouched) flipId(false); }, 3900)];
}, {threshold: .7});
idDemoObserver.observe(idCard);

// Each project keeps its own full panel; closed panels become vertical spines.
let activeProject = 0;
const deck = $('.project-deck');
const dialog = $('.project-dialog');
function openProjectDetails(index) {
  const project = projects[index];
  $('dialog h2').textContent = project.title;
  $('dialog > p').textContent = project.description;
  $('dialog ul').replaceChildren(...project.features.map(feature => {
    const li = document.createElement('li'); li.textContent = feature; return li;
  }));
  dialog.showModal();
}
projects.forEach((project, index) => {
  const leaf = document.createElement('article');
  leaf.className = 'project-leaf';
  const spine = document.createElement('button');
  spine.className = 'project-spine';
  spine.id = `project-spine-${index}`;
  spine.setAttribute('aria-controls', `project-body-${index}`);
  spine.setAttribute('aria-label', `Open ${project.title}`);
  spine.innerHTML = `<span class="spine-number">0${index + 1}</span><span class="spine-title"></span><span class="spine-arrow" aria-hidden="true">↗</span>`;
  spine.querySelector('.spine-title').textContent = project.title;
  const expanded = document.createElement('div');
  expanded.className = 'project-expanded';
  expanded.id = `project-body-${index}`;
  expanded.setAttribute('role', 'region');
  expanded.setAttribute('aria-labelledby', spine.id);
  expanded.append($('#project-template').content.cloneNode(true));
  expanded.querySelector('.project-title').textContent = project.title;
  expanded.querySelector('.project-type').textContent = `CONCEPT PROJECT · ${project.type}`;
  expanded.querySelector('.project-description').textContent = project.description;
  expanded.querySelector('.project-art').style.backgroundColor = project.color;
  expanded.querySelector('.mock-url').textContent = project.url;
  expanded.querySelector('.mock-content h4').textContent = project.heading;
  expanded.querySelector('.mock-content > p').textContent = project.subheading;
  expanded.querySelectorAll('.mock-note-grid h5').forEach((el, i) => el.textContent = project.cards[i]);
  expanded.querySelector('.project-tags').replaceChildren(...project.tags.map(tag => { const span = document.createElement('span'); span.textContent = tag; return span; }));
  expanded.querySelector('.project-open').addEventListener('click', () => openProjectDetails(index));
  spine.addEventListener('click', () => selectProject(index));
  spine.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % projects.length;
    if (event.key === 'ArrowLeft') next = (index + projects.length - 1) % projects.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = projects.length - 1;
    if (next !== undefined) { event.preventDefault(); selectProject(next); $$('.project-spine')[next].focus(); }
  });
  leaf.append(spine, expanded); deck.append(leaf);
});
function selectProject(index) {
  activeProject = (index + projects.length) % projects.length;
  $$('.project-leaf').forEach((leaf, i) => {
    const active = i === activeProject;
    leaf.classList.toggle('is-active', active);
    leaf.querySelector('.project-spine').setAttribute('aria-expanded', String(active));
    leaf.querySelector('.project-expanded').inert = !active;
    leaf.querySelector('.project-expanded').setAttribute('aria-hidden', String(!active));
  });
  $('.deck-count').textContent = `0${activeProject + 1} / 0${projects.length}`;
}
selectProject(0);
const deckResize = new ResizeObserver(() => {
  const compact = window.matchMedia('(max-width: 760px)').matches;
  const spine = compact ? 38 : 66;
  const gap = compact ? 7 : 10;
  deck.style.setProperty('--expanded-width', `${Math.max(150, deck.clientWidth - (projects.length - 1) * (spine + gap))}px`);
});
deckResize.observe(deck);
$('.project-prev').addEventListener('click', () => selectProject(activeProject - 1));
$('.project-next').addEventListener('click', () => selectProject(activeProject + 1));
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
});

// Keep one course unfolded, just like the reference's learning list.
$$('.course-list details').forEach(item => item.addEventListener('toggle', () => {
  if (item.open) $$('.course-list details').forEach(other => { if (other !== item) other.open = false; });
}));

const yearEntries = $$('.year-entry');
let timelineFrame;
function updateTimeline() {
  const target = innerHeight * .52;
  let nearest = yearEntries[0];
  let distance = Infinity;
  yearEntries.forEach(entry => {
    const rect = entry.getBoundingClientRect();
    const delta = Math.abs(rect.top + rect.height / 2 - target);
    if (delta < distance) { distance = delta; nearest = entry; }
  });
  yearEntries.forEach(entry => entry.classList.toggle('is-current', entry === nearest));
  $$('[data-year]').forEach(button => {
    if (`year-${button.dataset.year}` === nearest.id) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  const rect = $('.year-timeline').getBoundingClientRect();
  const progress = Math.min(1, Math.max(0, (target - rect.top) / rect.height));
  $('.timeline-line > div').style.transform = `scaleY(${progress})`;
  timelineFrame = null;
}
window.addEventListener('scroll', () => { if (!timelineFrame) timelineFrame = requestAnimationFrame(updateTimeline); }, {passive:true});
window.addEventListener('resize', updateTimeline);
$$('[data-year]').forEach(button => button.addEventListener('click', () => {
  $(`#year-${button.dataset.year}`).scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center'});
}));
updateTimeline();

// An infinite card carousel. Clones are hidden from assistive technology.
const achievements = [
  { icon: '⌘', name: 'LeetCode', note: 'One problem at a time.', count: '450', suffix: '+', detail: 'PROBLEMS EXPLORED', color: '#b2994d' },
  { icon: '✳', name: 'Personal projects', note: 'Ideas made tangible.', count: '12', suffix: '', detail: 'THINGS BROUGHT TO LIFE', color: '#83925d' },
  { icon: '∞', name: 'GitHub', note: 'A little progress, every day.', count: '120', suffix: '+', detail: 'CONTRIBUTIONS & COUNTING', color: '#747b9d' },
  { icon: '◇', name: 'Hackathons', note: 'Good ideas. Great teammates.', count: '3', suffix: '', detail: 'WEEKENDS OF BUILDING', color: '#a07867' },
  { icon: '◎', name: 'Certifications', note: 'Always room for one more skill.', count: '8', suffix: '', detail: 'NEW CHAPTERS OF LEARNING', color: '#85936d' },
  { icon: '↗', name: 'GeeksforGeeks', note: 'Putting the fundamentals to work.', count: '280', suffix: '+', detail: 'CODING CHALLENGES', color: '#698975' }
];
const carousel = $('.principles');
const track = $('.achievement-track');
const viewport = $('.carousel-viewport');
achievements.forEach((item, index) => {
  const article = document.createElement('article'); article.className = 'achievement-card';
  article.setAttribute('role', 'group'); article.setAttribute('aria-label', `${index + 1} of ${achievements.length}: ${item.name}, sample achievement`);
  article.innerHTML = `<div class="achievement-top"><span class="achievement-icon" style="--achievement-color:${item.color}">${item.icon}</span><span class="achievement-index">0${index + 1}</span></div><h3>${item.name}</h3><p>${item.note}</p><div class="achievement-bottom"><span>${item.detail}</span><strong>${item.count}<small>${item.suffix}</small></strong></div>`;
  track.append(article);
  const dot = document.createElement('button'); dot.setAttribute('aria-label', `Show ${item.name}`);
  dot.addEventListener('click', () => carouselGo(index)); $('.carousel-dots').append(dot);
});
[...track.children].forEach(card => { const clone = card.cloneNode(true); clone.setAttribute('aria-hidden','true'); clone.inert = true; track.append(clone); });
let carouselIndex = 0;
let carouselBusy = false;
let carouselTimer;
let carouselFinishTimer;
let carouselPaused = reducedMotion.matches;
let carouselInView = false;
function cardStep() { return track.firstElementChild.getBoundingClientRect().width + 18; }
function paintCarousel(animate) {
  track.style.transition = animate && !reducedMotion.matches ? '' : 'none';
  track.style.transform = `translateX(${-carouselIndex * cardStep()}px)`;
  const actual = carouselIndex % achievements.length;
  $$('.carousel-dots button').forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === actual)));
  $('.carousel-count').textContent = `0${actual + 1} / 0${achievements.length}`;
}
function finishCarousel() {
  clearTimeout(carouselFinishTimer);
  if (carouselIndex >= achievements.length) { carouselIndex = 0; paintCarousel(false); }
  carouselBusy = false;
}
function carouselGo(index) {
  if (carouselBusy) return;
  carouselIndex = index;
  carouselBusy = true;
  paintCarousel(true);
  if (reducedMotion.matches) finishCarousel();
  else carouselFinishTimer = setTimeout(finishCarousel, 720);
}
function carouselMove(direction) {
  if (carouselBusy) return;
  if (direction < 0 && carouselIndex === 0) {
    carouselIndex = achievements.length; paintCarousel(false);
    void track.offsetWidth;
  }
  carouselGo(carouselIndex + direction);
}
track.addEventListener('transitionend', event => { if (event.propertyName === 'transform') finishCarousel(); });
function scheduleCarousel() {
  clearInterval(carouselTimer);
  if (!carouselPaused && carouselInView && !document.hidden) {
    carouselTimer = setInterval(() => {
      // Read current DOM state: pointerleave can be omitted across iframe edges.
      if (!carousel.matches(':hover') && !carousel.contains(document.activeElement)) carouselMove(1);
    }, 3600);
  }
  $('.carousel-toggle').setAttribute('aria-pressed', String(carouselPaused));
  $('.carousel-toggle').setAttribute('aria-label', carouselPaused ? 'Play carousel' : 'Pause carousel');
  const toggle = $('.carousel-toggle');
  // Keep the pointer target intact when focus/hover only changes autoplay.
  if (toggle.dataset.paused !== String(carouselPaused)) {
    toggle.dataset.paused = String(carouselPaused);
    toggle.innerHTML = playbackIcon(!carouselPaused);
  }
}
$('.carousel-next').addEventListener('click', () => carouselMove(1));
$('.carousel-prev').addEventListener('click', () => carouselMove(-1));
$('.carousel-toggle').addEventListener('click', () => { carouselPaused = !carouselPaused; scheduleCarousel(); });
document.addEventListener('visibilitychange', scheduleCarousel);
new IntersectionObserver(entries => { carouselInView = entries[0].isIntersecting; scheduleCarousel(); }, {threshold:.25}).observe(carousel);
new ResizeObserver(() => paintCarousel(false)).observe(viewport);
reducedMotion.addEventListener('change', () => { carouselPaused = reducedMotion.matches; scheduleCarousel(); paintCarousel(false); });
let swipeStart;
viewport.addEventListener('pointerdown', event => { swipeStart = {x:event.clientX, y:event.clientY}; });
viewport.addEventListener('pointerup', event => {
  if (!swipeStart) return;
  const delta = event.clientX - swipeStart.x;
  if (Math.abs(delta) > 40 && Math.abs(delta) > Math.abs(event.clientY - swipeStart.y)) carouselMove(delta < 0 ? 1 : -1);
  swipeStart = null;
});
viewport.addEventListener('pointercancel', () => swipeStart = null);
paintCarousel(false); scheduleCarousel();

replaceArrows();

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), {threshold: 0.12});
document.documentElement.classList.add('motion-ready');
$$('.reveal').forEach(el => observer.observe(el));
const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) $$('nav a').forEach(a => a.classList.toggle('active', a.hash === `#${entry.target.id}`));
}), {rootMargin: '-15% 0px -65% 0px'});
$$('main section[id]').forEach(el => navObserver.observe(el));

$('.hero').addEventListener('pointermove', event => {
  if (reducedMotion.matches || event.pointerType === 'touch') return;
  const rect = $('.hero').getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - .5;
  const y = (event.clientY - rect.top) / rect.height - .5;
  $('.character-wrap').style.transform = `translate(${x * 18}px, ${y * 10}px) rotate(${x * 3}deg)`;
});
$('.hero').addEventListener('pointerleave', () => $('.character-wrap').style.transform = '');
let toastTimer;
function toast(message) { $('.toast').textContent = message; $('.toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('.toast').classList.remove('show'), 5000); }
function playbackIcon(playing) {
  return playing
    ? '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M5 3v10M11 3v10" stroke="currentColor" stroke-width="2"/></svg>'
    : '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4 2 13 8 4 14Z" fill="currentColor"/></svg>';
}
const soundButton = $('.sound-button');
const voiceButton = $('.hello-bubble');
const introAudio = $('#intro-audio');
$('.voice-play').innerHTML = playbackIcon(false);
const mouthVoice = $('.character .mouth-voice');
const mouthRest = $('.character .mouth-rest');
let voiceFrame;
let voiceStarting = false;
const transcript = introduction.text.match(/[^.!?]+[.!?]+/g) || [introduction.text];
function closeMouth() { mouthVoice.setAttribute('opacity', '0'); mouthRest.setAttribute('opacity', '1'); }
function voiceTick() {
  if (introAudio.paused || introAudio.ended) return;
  const index = Math.min(introduction.levels.length - 1, Math.floor(introAudio.currentTime / introduction.step));
  const opening = introduction.levels[index] || 0;
  const open = opening > .08 && !reducedMotion.matches;
  mouthVoice.setAttribute('opacity', open ? '1' : '0');
  mouthRest.setAttribute('opacity', open ? '0' : '1');
  mouthVoice.setAttribute('transform', `translate(201 164) scale(${.75 + opening * .35} ${.3 + opening * .8}) translate(-201 -164)`);
  const fraction = introAudio.currentTime / introduction.duration;
  let total = 0;
  const sentence = transcript.find(part => { total += part.length; return fraction <= total / introduction.text.length; }) || transcript.at(-1);
  $('.voice-caption p').textContent = sentence.trim();
  voiceFrame = requestAnimationFrame(voiceTick);
}
function voiceState(playing) {
  soundButton.setAttribute('aria-pressed', String(playing));
  soundButton.setAttribute('aria-label', playing ? 'Stop introduction' : 'Hear my introduction');
  voiceButton.setAttribute('aria-pressed', String(playing));
  $('.voice-button-text').textContent = playing ? "Hi, I'm Yash…" : 'Hear me say hello';
  $('.voice-play').innerHTML = playbackIcon(playing);
  $('.character-stage').classList.toggle('speaking', playing);
  cancelAnimationFrame(voiceFrame);
  if (playing) voiceTick(); else closeMouth();
}
async function introduce() {
  if (!introAudio.paused || voiceStarting) {
    voiceStarting = false;
    introAudio.pause(); introAudio.currentTime = 0; voiceState(false); return;
  }
  voiceStarting = true;
  introAudio.currentTime = 0;
  try { await introAudio.play(); }
  catch { voiceState(false); toast('Audio could not start in this preview. Open the downloaded HTML in your browser and tap the introduction again.'); }
  finally { voiceStarting = false; }
}
introAudio.addEventListener('playing', () => voiceState(true));
introAudio.addEventListener('pause', () => voiceState(false));
introAudio.addEventListener('ended', () => voiceState(false));
introAudio.addEventListener('error', () => { voiceState(false); toast('The introduction could not load. Please reopen the latest portfolio file.'); });
soundButton.addEventListener('click', introduce);
voiceButton.addEventListener('click', introduce);
document.addEventListener('visibilitychange', () => { if (document.hidden) introAudio.pause(); });
window.addEventListener('pagehide', () => { introAudio.pause(); clearInterval(carouselTimer); });
