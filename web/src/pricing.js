// Pricing toggle (monthly/yearly) — defensive and minimal
(function(){
  try{
    const toggle = document.getElementById('billing-toggle');
    if(!toggle) return;
    const setMode = (mode)=>{
      document.querySelectorAll('[data-price-month]').forEach(el=>{
        const m = el.getAttribute('data-price-month');
        const y = el.getAttribute('data-price-year');
        el.textContent = mode === 'year' ? y : m;
      });
      toggle.setAttribute('aria-pressed', mode==='year');
    };
    toggle.addEventListener('click', ()=>{
      const mode = toggle.getAttribute('data-mode') === 'year' ? 'month' : 'year';
      toggle.setAttribute('data-mode', mode);
      setMode(mode);
    });
    // init
    setMode(toggle.getAttribute('data-mode') || 'month');
  }catch(e){
    console.warn('pricing.js init error', e && e.message);
  }
})();
