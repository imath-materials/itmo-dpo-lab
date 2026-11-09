(() => {
  const $ = (s,r=document) => r.querySelector(s);
  const toggle=$('[data-menu-toggle]');
  if(toggle){toggle.addEventListener('click',()=>{$('.top-nav').classList.toggle('open'); toggle.setAttribute('aria-expanded',String($('.top-nav').classList.contains('open')));});}
  const fallbackCopy=text=>{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.append(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok;};
  document.querySelectorAll('[data-copy]').forEach(btn=>btn.addEventListener('click',async()=>{
    const sel=btn.getAttribute('data-copy');const el=$(sel);if(!el)return;
    const value=el.value===undefined?el.textContent:el.value;
    let ok=false;try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(value);ok=true;}else{ok=fallbackCopy(value)}}catch(e){ok=fallbackCopy(value)}
    const old=btn.textContent;btn.textContent=ok?'Скопировано':'Выделите текст';setTimeout(()=>btn.textContent=old,1700);
  }));
  document.querySelectorAll('[data-answer]').forEach(box=>{
    const btn=$('[data-quiz-check]',box);if(!btn)return;
    btn.addEventListener('click',()=>{
      const selected=$('input[type=radio]:checked',box);const result=$('[data-quiz-result]',box);
      if(!selected){result.textContent='Выберите ответ.';return}
      const correct=selected.value===box.dataset.answer;
      result.textContent=correct?'Верно. '+(box.dataset.explain||''):'Пока нет. '+(box.dataset.hint||'Сравните входные данные и ожидаемый результат.');
      result.style.color=correct?'#186255':'#a05025';
    });
  });
  document.querySelectorAll('[data-export-name]').forEach(form=>{
    const btn=$('[data-export-button]',form);if(!btn)return;
    btn.addEventListener('click',()=>{
      const lines=[`# ${form.dataset.exportTitle||'Рабочая карточка'}`,''];
      form.querySelectorAll('[data-export-label]').forEach(field=>{
        lines.push(`## ${field.dataset.exportLabel}`,'',field.value.trim()||'[Не заполнено]','');
      });
      const blob=new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=form.dataset.exportName;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
    });
  });
  // Keep every learning journal, project field and editable prompt fully visible.
  const grow = el => {
    if (!el || !el.isConnected || el.offsetParent === null) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 116)}px`;
  };
  document.querySelectorAll('textarea').forEach(el => {
    el.setAttribute('data-autogrow','');
    el.addEventListener('input', () => grow(el));
    el.addEventListener('change', () => grow(el));
    grow(el);
  });
  window.addEventListener('pageshow', () => document.querySelectorAll('textarea[data-autogrow]').forEach(grow));
  document.querySelectorAll('details').forEach(el => el.addEventListener('toggle',()=>{if(el.open)el.querySelectorAll('textarea').forEach(grow)}));
  window.addEventListener('resize', () => document.querySelectorAll('textarea[data-autogrow]').forEach(grow));
  const year=$('[data-year]');if(year)year.textContent=String(new Date().getFullYear());
})();

// Local handbook search: all content is static and no query leaves the browser.
(() => {
  const input = document.querySelector('[data-help-search]');
  if (!input) return;
  const cards = Array.from(document.querySelectorAll('[data-help-item]'));
  const count = document.querySelector('[data-help-count]');
  const empty = document.querySelector('[data-help-empty]');
  const normalize = value => String(value || '').toLocaleLowerCase('ru').replace(/ё/g, 'е').trim();
  const update = () => {
    const tokens = normalize(input.value).split(/\s+/).filter(Boolean);
    let total = 0;
    cards.forEach(card => {
      const haystack = normalize(card.getAttribute('data-search'));
      const found = tokens.every(token => haystack.includes(token));
      card.hidden = !found;
      if (found) total++;
    });
    if (count) count.textContent = `Найдено тем: ${total} из ${cards.length}`;
    if (empty) empty.hidden = total > 0;
  };
  input.addEventListener('input', update);
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();input.focus();input.select();
    }
  });
  update();
})();
// One click copies instructional JSON and expressions from dark code blocks.
(() => {
  document.querySelectorAll('[data-copy-parent]').forEach(button => button.addEventListener('click', async () => {
    const wrap = button.closest(button.dataset.copyParent);
    const text = wrap?.querySelector('pre')?.textContent;
    if (!text) return;
    let ok = false;
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); ok = true; } }
    catch (_) {}
    if (!ok) {
      const input = document.createElement('textarea');
      input.value = text;input.style.position='fixed';input.style.opacity='0';
      document.body.appendChild(input);input.select();
      try { ok = document.execCommand('copy'); } catch (_) {};
      input.remove();
    }
    const previous = button.textContent;
    button.textContent = ok ? 'Скопировано' : 'Выделите текст';
    setTimeout(() => button.textContent = previous, 1600);
  }));
})();


// Replace illustrated placeholders with checked screenshots listed in screens.js.
(() => {
  const manifest = window.ITMO_SCREENSHOTS || {};
  const script = Array.from(document.scripts).find(el => /\/assets\/site\.js(?:[?#]|$)/.test(el.src));
  if (!script) return;
  const root = new URL('../', script.src);
  document.querySelectorAll('[data-screen-id]').forEach(figure => {
    const file = manifest[figure.dataset.screenId];
    if (!file || !/^assets\/screens\/[\w-]+\.(?:png|webp|jpg|jpeg)$/.test(file)) return;
    const img = document.createElement('img');
    img.className = 'screen-slot-image'; img.loading = 'lazy';
    img.alt = figure.querySelector('.screen-slot-description')?.textContent || 'Снимок интерфейса';
    img.onload = () => { const canvas = figure.querySelector('.screen-slot-canvas'); canvas?.replaceWith(img); };
    img.src = new URL(file, root).href;
  });
})();
