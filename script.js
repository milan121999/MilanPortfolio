// Theme, header, nav, integrated components (from V11)
const root = document.documentElement;
const header = document.querySelector('.site-header');
const themeToggle = document.getElementById('themeToggle');
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const yearEl = document.getElementById('year');
const yearEl2 = document.getElementById('year-2');

const STORAGE_KEY = 'milan-portfolio-theme';
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
if (yearEl2) yearEl2.textContent = String(new Date().getFullYear());

// Restore theme
const storedTheme = localStorage.getItem(STORAGE_KEY);
if (storedTheme === 'light') root.classList.add('light');

// Toggle theme
themeToggle?.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem(STORAGE_KEY, root.classList.contains('light') ? 'light' : 'dark');
});

// Sticky header state
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) header?.classList.add('scrolled');
  else header?.classList.remove('scrolled');
  highlightActiveNav();
});

// Smooth scroll for nav links
document.querySelectorAll('.nav-link, .mnav-link, .btn.outline').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Active link highlight
const sections = Array.from(document.querySelectorAll('section[id]'));
const links = Array.from(document.querySelectorAll('.nav-link'));
function highlightActiveNav(){
  let activeId = '';
  const buffer = window.innerHeight * 0.3;
  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= buffer && rect.bottom >= buffer) activeId = sec.id;
  });
  links.forEach(link => {
    const href = link.getAttribute('href');
    const id = href?.replace('#','');
    if (id === activeId) link.classList.add('active');
    else link.classList.remove('active');
  });
}
highlightActiveNav();

// Mobile nav as a bottom sheet
(function(){
  const overlay = document.getElementById('mnav-overlay');
  const drawer = document.getElementById('mnav-drawer');
  function open(){ if(overlay&&drawer){ overlay.hidden=false; drawer.hidden=false; drawer.classList.add('open'); } }
  function close(){ if(overlay&&drawer){ overlay.hidden=true; drawer.hidden=true; drawer.classList.remove('open'); } }
  burger?.addEventListener('click', open);
  overlay?.addEventListener('click', close);
  drawer?.addEventListener('click', (e)=>{ if(e.target.classList && e.target.classList.contains('mnav-link')) close(); });
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
})();

// Projects tabs filter
(function(){
  const grid = document.getElementById('project-grid');
  if(!grid) return;
  const tabs = Array.from(document.querySelectorAll('.tabs .tab'));
  tabs.forEach(t=>t.addEventListener('click', ()=>{
    tabs.forEach(x=>x.classList.remove('is-active'));
    t.classList.add('is-active');
    const cat = t.getAttribute('data-tab');
    Array.from(grid.children).forEach(card=>{
      const c = card.getAttribute('data-cat');
      const show = (cat==='all' || cat===null) || (c===cat);
      card.style.display = show ? '' : 'none';
    });
  }));
})();

// Carousel for #proj-carousel
(function(){
  const carousel = document.querySelector('#proj-carousel.carousel');
  if(!carousel) return;
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const prev = carousel.querySelector('.carousel-prev');
  const next = carousel.querySelector('.carousel-next');
  const dots = carousel.querySelector('.carousel-dots');
  let index = 0;
  function update(){
    track.style.transform = `translateX(${-index*100}%)`;
    dots.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('active', i===index));
    prev.disabled = index===0;
    next.disabled = index===slides.length-1;
  }
  slides.forEach((_,i)=>{
    const b = document.createElement('button');
    b.addEventListener('click', ()=>{ index=i; update(); });
    dots.appendChild(b);
  });
  prev.addEventListener('click', ()=>{ index=Math.max(0,index-1); update(); });
  next.addEventListener('click', ()=>{ index=Math.min(slides.length-1,index+1); update(); });
  carousel.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowLeft'){ prev.click(); }
    if(e.key==='ArrowRight'){ next.click(); }
  });
  update();
})();

// Animate progress bars when in view
(function(){
  const bars = Array.from(document.querySelectorAll('.progress .progress-bar'));
  if(bars.length===0) return;
  function inView(el){
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight - 80;
  }
  function tick(){
    bars.forEach(bar=>{
      if(bar.dataset.done) return;
      if(inView(bar)){
        const parent = bar.parentElement;
        const v = Number(parent.getAttribute('data-progress')) || 0;
        bar.style.width = Math.min(100, Math.max(0, v)) + '%';
        bar.dataset.done = '1';
      }
    });
  }
  window.addEventListener('scroll', tick, { passive:true });
  setTimeout(tick, 0);
})();

// Accordion JS left intact (no longer used) — harmless.

// Simple toaster
function showToast(title, desc='', variant='default'){
  const host = document.getElementById('toaster'); if(!host) return;
  const box = document.createElement('div'); box.className = 'toast ' + (variant==='destructive'?'destructive':'');
  const t = document.createElement('div'); t.className = 'title'; t.textContent = title; box.appendChild(t);
  if(desc){ const d = document.createElement('div'); d.textContent = desc; box.appendChild(d); }
  host.appendChild(box);
  setTimeout(()=>{ box.remove(); }, 3500);
}

// Contact form validation + toast + mailto
(function(){
  const form = document.getElementById('contact-form');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = form.querySelector('#c-name');
    const email = form.querySelector('#c-email');
    const consent = form.querySelector('#c-consent');
    const msgName = form.querySelector('[data-for="name"]');
    const msgEmail = form.querySelector('[data-for="email"]');
    const msgConsent = form.querySelector('[data-for="consent"]');
    msgName.textContent = ''; msgEmail.textContent = ''; msgConsent.textContent='';
    let ok = true;
    if(!name.value.trim()){ msgName.textContent='Name is required.'; ok=false; }
    if(!email.validity.valid){ msgEmail.textContent='Valid email required.'; ok=false; }
    if(!consent.checked){ msgConsent.textContent='Please accept to be contacted.'; ok=false; }
    if(!ok){ showToast('Check the form', 'Please fix highlighted fields', 'destructive'); return; }
    showToast('Thanks!', 'I will get back to you shortly.');
    const subject = encodeURIComponent(form.querySelector('#c-subject').value + ' — Portfolio');
    const body = encodeURIComponent(form.querySelector('#c-message').value + `\n\nFrom: ${name.value} <${email.value}>`);
    window.location = `mailto:milanparemajalu@gmail.com?subject=${subject}&body=${body}`;
    form.reset();
  });
  const btn = document.getElementById('privacy-pop');
  const pop = document.getElementById('privacy-note');
  btn?.addEventListener('click', ()=>{ if(pop) pop.hidden = !pop.hidden; });
  document.addEventListener('click', (e)=>{
    if(pop && !pop.contains(e.target) && e.target!==btn) pop.hidden = true;
  });
})();


// Projects: hide initials overlay when image loads
(function(){
  const medias = Array.from(document.querySelectorAll('#projects .proj-media img'));
  medias.forEach(img => {
    function done(){ img.parentElement?.classList.add('has-img'); }
    if (img.complete && img.naturalWidth > 0) done();
    img.addEventListener('load', done);
  });
})();
