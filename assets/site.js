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
