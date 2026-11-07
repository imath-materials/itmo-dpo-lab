// Общие функции учебных практикумов. Без сетевых запросов и аналитики.
window.DPO={
 $(s){return document.querySelector(s)},
 $$(s){return [...document.querySelectorAll(s)]},
 save(name,text,type='text/plain;charset=utf-8'){
  const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
 },
 csv(rows){return rows.map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(';')).join('\r\n')},
 esc(t){return String(t??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))},
 toast(message){let node=document.getElementById('site-toast');if(!node){node=document.createElement('div');node.id='site-toast';node.setAttribute('role','status');document.body.append(node)}node.textContent=message;clearTimeout(window.__dpoToastTimer);window.__dpoToastTimer=setTimeout(()=>node.remove(),2600)},
 copy(text){if(navigator.clipboard?.writeText&&window.isSecureContext){return navigator.clipboard.writeText(text).then(()=>DPO.toast('Скопировано в буфер обмена')).catch(()=>{DPO.save('material.txt',text);DPO.toast('Материал скачан в TXT')})}DPO.save('material.txt',text);DPO.toast('Материал скачан в TXT')},
 checkProgress(){const id=document.body.dataset.lesson; if(!id)return; const checks=[...document.querySelectorAll('.check input[type=checkbox]')]; let saved={};try{saved=JSON.parse(localStorage.getItem('dpo-checks:'+id)||'{}')}catch(e){}checks.forEach(x=>{if(x.id && saved[x.id])x.checked=true;x.addEventListener('change',()=>{const map={};checks.forEach(y=>{if(y.id)map[y.id]=y.checked});try{localStorage.setItem('dpo-checks:'+id,JSON.stringify(map))}catch(e){}const b=document.querySelector('#progress');if(b)b.textContent=`${checks.filter(z=>z.checked).length} из ${checks.length} выполнено`;})});const b=document.querySelector('#progress');if(b)b.textContent=`${checks.filter(z=>z.checked).length} из ${checks.length} выполнено`}
};
document.addEventListener('DOMContentLoaded',()=>{
 DPO.checkProgress();
 const side=document.querySelector('.side'),brand=side?.querySelector('.brand'),nav=side?.querySelector('nav');
 if(side&&brand&&nav){let btn=document.createElement('button');btn.className='mobile-menu';btn.type='button';btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls','site-navigation');btn.textContent='Меню';nav.id='site-navigation';brand.append(btn);btn.addEventListener('click',()=>{const open=side.classList.toggle('nav-open');btn.setAttribute('aria-expanded',String(open));btn.textContent=open?'Закрыть':'Меню'})}
});
