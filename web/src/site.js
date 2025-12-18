// Minimal site JS: mobile nav toggle + smooth scroll
(function(){
  try{
    const btn = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav-links');
    if(btn && nav){
      btn.addEventListener('click', ()=>{
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        nav.style.display = expanded ? '' : 'flex';
        nav.style.flexDirection = 'column';
      });
    }

    // Smooth scrolling for anchor links to #how-it-works
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', e=>{
        const hash = a.getAttribute('href');
        if(hash && hash.startsWith('#')){
          const el = document.querySelector(hash);
          if(el){
            e.preventDefault();
            el.scrollIntoView({behavior:'smooth',block:'start'});
            history.replaceState(null,'',hash);
          }
        }
      });
    });
  }catch(err){
    // swallow to avoid console errors in pages without expected DOM
    console.warn('site.js load:', err && err.message);
  }
})();
