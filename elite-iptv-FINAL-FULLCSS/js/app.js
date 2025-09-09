(function(){const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));const nav=$('#nav'),burger=$('#hamburger');if(burger)burger.addEventListener('click',()=>{const open=nav.classList.toggle('open');burger.setAttribute('aria-expanded',open?'true':'false')});const toggle=$('#billingToggle'),amounts=$$('.amount');if(toggle)toggle.addEventListener('change',e=>{const y=e.target.checked;amounts.forEach(el=>el.textContent=y?el.dataset.yearly:el.dataset.monthly)}) ;const year=$('#year');if(year)year.textContent=new Date().getFullYear();const form=$('#contactForm');if(form)form.addEventListener('submit',e=>{e.preventDefault();alert('Thanks! Connect this to Formspree or your backend.');form.reset()})})();

/* Slider logic */
(function(){
  const container = document.getElementById('slides');
  if(!container) return;
  const slides = Array.from(container.children);
  let cur = 0, timer;
  slides.forEach((s,i)=> s.classList.toggle('active', i===0));
  const dotsWrap = document.getElementById('slideDots');
  const dots = slides.map((_,i)=>{
    const b = document.createElement('button');
    if(i===0) b.classList.add('active');
    b.addEventListener('click', ()=> goto(i));
    dotsWrap.appendChild(b);
    return b;
  });
  const prev = document.getElementById('prevSlide');
  const next = document.getElementById('nextSlide');
  prev && prev.addEventListener('click', ()=> goto((cur-1+slides.length)%slides.length));
  next && next.addEventListener('click', ()=> goto((cur+1)%slides.length));
  function goto(i){
    slides[cur].classList.remove('active');
    dots[cur].classList.remove('active');
    cur = i;
    slides[cur].classList.add('active');
    dots[cur].classList.add('active');
    restart();
  }
  function restart(){
    clearInterval(timer);
    timer = setInterval(()=> goto((cur+1)%slides.length), 4000);
  }
  restart();
})();

/* Latest strip scroll */
(function(){
  const strip = document.getElementById('latestStrip');
  if(!strip) return;
  const prev = document.getElementById('latestPrev');
  const next = document.getElementById('latestNext');
  const step = () => strip.clientWidth * 0.8;
  prev.addEventListener('click', ()=> strip.scrollBy({left:-step(), behavior:'smooth'}));
  next.addEventListener('click', ()=> strip.scrollBy({left: step(), behavior:'smooth'}));
  strip.addEventListener('wheel', (e)=>{ if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){ e.preventDefault(); strip.scrollLeft += e.deltaY; } }, {passive:false});
})();


/* Reusable horizontal strip controller */
(function(){
  function wire(idBase){
    const strip = document.getElementById(idBase+'Strip');
    if(!strip) return;
    const prev = document.getElementById(idBase+'Prev');
    const next = document.getElementById(idBase+'Next');
    const step = () => strip.clientWidth * 0.8;
    prev && prev.addEventListener('click', ()=> strip.scrollBy({left:-step(), behavior:'smooth'}));
    next && next.addEventListener('click', ()=> strip.scrollBy({left: step(), behavior:'smooth'}));
    strip.addEventListener('wheel', (e)=>{ if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){ e.preventDefault(); strip.scrollLeft += e.deltaY; } }, {passive:false});
  }
  ['latest','sports','movies'].forEach(wire);
})();


/* Horizontal strips for Movies & Sports */
(function(){
  function wire(base){
    const strip = document.getElementById(base+'Strip');
    if(!strip) return;
    const prev = document.getElementById(base+'Prev');
    const next = document.getElementById(base+'Next');
    const step = () => strip.clientWidth * 0.8;
    prev && prev.addEventListener('click', ()=> strip.scrollBy({left:-step(), behavior:'smooth'}));
    next && next.addEventListener('click', ()=> strip.scrollBy({left: step(), behavior:'smooth'}));
    strip.addEventListener('wheel', (e)=>{ if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){ e.preventDefault(); strip.scrollLeft += e.deltaY; } }, {passive:false});
  }
  ['movies','sports'].forEach(wire);
})();
