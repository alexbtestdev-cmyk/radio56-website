(function(){
'use strict';
var doc=document, root=doc.documentElement;
function $(s,r){return (r||doc).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||doc).querySelectorAll(s));}
function guard(fn){try{fn();}catch(err){if(window.console&&console.warn){console.warn(err);}}}
var RM=false; try{RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
var NAME={maxima:'Максима ФМ',humor:'Юмор ФМ',energy:'Energy ФМ',iskatel:'Искатель'};
var CVAR={maxima:'--st-max',humor:'--st-hum',energy:'--st-enr',iskatel:'--st-isk'};
var CV={};
function readColors(){var cs=getComputedStyle(root);for(var k in CVAR){CV[k]=(cs.getPropertyValue(CVAR[k])||'#0F4C81').trim();}}
var ORDER=['maxima','humor','energy','iskatel'];
var sel='maxima', dark=false;
function toast(msg){
var box=$('#toasts'); if(!box){return;}
var el=doc.createElement('div'); el.className='toast';
var dot=doc.createElement('i'); var span=doc.createElement('span');
span.textContent=msg; el.appendChild(dot); el.appendChild(span); box.appendChild(el);
setTimeout(function(){el.style.transition='opacity .3s,transform .3s';el.style.opacity='0';el.style.transform='translateX(24px)';setTimeout(function(){if(el.parentNode){el.parentNode.removeChild(el);}},320);},2600);
while(box.children.length>4){box.removeChild(box.firstChild);}
}
/* reveal with failsafe */
guard(function(){
var items=$$('[data-rv]');
if(RM||!('IntersectionObserver' in window)){return;}
items.forEach(function(el){el.classList.add('rvh');});
var io=new IntersectionObserver(function(entries){
entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.remove('rvh'); io.unobserve(en.target);} });
},{threshold:.08,rootMargin:'0px 0px -40px 0px'});
items.forEach(function(el){io.observe(el);});
setTimeout(function(){items.forEach(function(el){el.classList.remove('rvh');});},2500);
});
/* counters */
guard(function(){
var nodes=$$('[data-count]');
if(RM||!('IntersectionObserver' in window)){return;}
var io=new IntersectionObserver(function(entries){
entries.forEach(function(en){
if(!en.isIntersecting){return;}
io.unobserve(en.target);
var el=en.target, to=parseInt(el.getAttribute('data-count'),10), suf=el.getAttribute('data-suf')||'', t0=0;
function step(now){ if(!t0){t0=now;} var p=Math.min((now-t0)/1200,1), e=1-Math.pow(1-p,3), v=Math.round(e*to);
el.textContent=(to>=1000?v.toLocaleString('ru-RU'):String(v))+suf; if(p<1){requestAnimationFrame(step);} }
requestAnimationFrame(step);
});
},{threshold:.4});
nodes.forEach(function(el){io.observe(el);});
});
/* theme + sky */
function setSky(){
var h=new Date().getHours();
var key=(h>=5&&h<11)?'m':((h>=11&&h<17)?'d':((h>=17&&h<23)?'e':'n'));
var L={m:['#FFF6E8','#FFE9C7'],d:['#EAF4FF','#DCEBFA'],e:['#FDEEE4','#EBDCE8'],n:['#E3EAF6','#CFDCEC']};
var D={m:['#241A0E','#1A1408'],d:['#0E2036','#0B2540'],e:['#221426','#150F1E'],n:['#081020','#060B18']};
var t=dark?D[key]:L[key];
root.style.setProperty('--skyA',t[0]); root.style.setProperty('--skyB',t[1]);
}
guard(function(){
readColors(); setSky();
var btn=$('#themeBtn');
if(!btn){return;}
btn.addEventListener('click',function(){
dark=!dark;
if(dark){root.setAttribute('data-theme','dark');}else{root.removeAttribute('data-theme');}
btn.setAttribute('aria-pressed',dark?'true':'false');
setSky(); readColors();
toast(dark?'Тёмная тема включена':'Светлая тема включена');
});
});
/* equalizers */
var eqCanvases=[];
function sizeEq(){
var dpr=Math.min(window.devicePixelRatio||1,2);
eqCanvases.forEach(function(o){
var w=o.el.clientWidth||300;
o.el.width=Math.round(w*dpr); o.el.height=Math.round(56*dpr);
o.ctx.setTransform(dpr,0,0,dpr,0,0); o.w=w; o.h=56;
});
}
guard(function(){
$$('.eqc').forEach(function(c){
eqCanvases.push({el:c,ctx:c.getContext('2d'),id:c.getAttribute('data-eq'),vals:[]});
});
sizeEq();
window.addEventListener('resize',function(){clearTimeout(window.__eqt);window.__eqt=setTimeout(sizeEq,150);});
function hash(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function sig(id,i,n,t){
var u=i/n,v;
if(id==='energy'){v=.35+.5*Math.abs(Math.sin(t*3.4+u*11))+.15*Math.sin(t*7+u*23);}
else if(id==='humor'){var g=(Math.sin(t*1.7+u*2.5)>0?1:.35);v=(.3+.5*Math.abs(Math.sin(t*2.6+u*9)))*g;}
else if(id==='iskatel'){v=.22+.32*Math.abs(Math.sin(t*1.2+u*5));if(hash(i+Math.floor(t*2))>.86){v+=.4;}}
else{v=.34+.42*Math.exp(-Math.pow((u-.45)*2.2,2))+.18*Math.abs(Math.sin(t*1.6+u*7));}
return Math.min(Math.max(v*(.82+.3*hash(i)),.05),1);
}
function drawEq(o,t){
if(!o.w){return;}
var ctx=o.ctx, n=30, gap=2, bw=(o.w-12)/n-gap, col=CV[o.id]||'#0F4C81';
ctx.clearRect(0,0,o.w,o.h);
for(var i=0;i<n;i++){
var target=sig(o.id,i,n,t);
o.vals[i]=o.vals[i]===undefined?target:o.vals[i]+(target-o.vals[i])*.25;
var h=Math.max(3,o.vals[i]*(o.h-12)), x=6+i*(bw+gap), y=o.h-6-h;
ctx.fillStyle=col; ctx.globalAlpha=.85;
ctx.fillRect(x,y,bw,h);
ctx.globalAlpha=.25; ctx.fillRect(x,o.h-4,bw,2);
ctx.globalAlpha=1;
}
}
var lastEq=0;
function eqLoop(now){
var t=now/1000;
if(!RM||now-lastEq>120){
lastEq=now;
eqCanvases.forEach(function(o){ if(o.el.closest('.doss.on')){drawEq(o,t);} });
}
requestAnimationFrame(eqLoop);
}
requestAnimationFrame(eqLoop);
});
/* station selection */
function selectSt(id){
if(NAME[id]===undefined){return;}
sel=id;
root.style.setProperty('--sel','var('+CVAR[id]+')');
var idx=ORDER.indexOf(id);
var needle=$('#needle'); if(needle){needle.style.left=(12.5+idx*25)+'%';}
$$('.stop').forEach(function(b){var on=b.getAttribute('data-st')===id;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');});
$$('.key').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-st')===id);});
$$('.stb').forEach(function(b){var on=b.getAttribute('data-st')===id;b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;});
$$('.doss').forEach(function(d){d.classList.toggle('on',d.getAttribute('data-d')===id);});
$$('.panel').forEach(function(p){p.classList.toggle('on',p.getAttribute('data-p')===id);});
guard(sizeEq);
}
guard(function(){
$$('.stb').forEach(function(b){
b.addEventListener('keydown',function(e){
var bs=$$('.stb'), i=bs.indexOf(b), t=-1;
if(e.key==='ArrowDown'||e.key==='ArrowRight'){t=(i+1)%bs.length;}
else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){t=(i-1+bs.length)%bs.length;}
else if(e.key==='Home'){t=0;}
else if(e.key==='End'){t=bs.length-1;}
if(t>=0){e.preventDefault();selectSt(bs[t].getAttribute('data-st'));bs[t].focus();}
});
});
$$('.stop,.key,.stb').forEach(function(b){
b.addEventListener('click',function(ev){
ev.stopPropagation();
selectSt(b.getAttribute('data-st'));
if(b.classList.contains('stb')&&window.innerWidth>1120){
var st=$('#stations'); if(st){st.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});}
}
});
});
var scale=$('#scale');
if(scale){
var dragging=false;
function idxFromX(x){
var r=scale.getBoundingClientRect();
var t=Math.min(Math.max((x-r.left)/r.width,0),1);
return Math.min(Math.max(Math.round((t*100-12.5)/25),0),3);
}
scale.addEventListener('pointerdown',function(e){
if(e.target.closest('.stop')){return;}
dragging=true; try{scale.setPointerCapture(e.pointerId);}catch(err){}
selectSt(ORDER[idxFromX(e.clientX)]);
});
scale.addEventListener('pointermove',function(e){ if(dragging){selectSt(ORDER[idxFromX(e.clientX)]);} });
scale.addEventListener('pointerup',function(){dragging=false;});
scale.addEventListener('pointercancel',function(){dragging=false;});
scale.addEventListener('keydown',function(e){
var i=ORDER.indexOf(sel);
if(e.key==='ArrowRight'||e.key==='ArrowDown'){selectSt(ORDER[Math.min(i+1,3)]);e.preventDefault();}
if(e.key==='ArrowLeft'||e.key==='ArrowUp'){selectSt(ORDER[Math.max(i-1,0)]);e.preventDefault();}
});
}
selectSt('maxima');
});
/* package dots */
guard(function(){
$$('.dots').forEach(function(box){
var n=parseInt(box.getAttribute('data-dots'),10)||0, b=parseInt(box.getAttribute('data-bonus'),10)||0;
var frag=doc.createDocumentFragment();
for(var i=0;i<n+b;i++){var s=doc.createElement('i'); if(i>=n){s.className='bn';} frag.appendChild(s);}
box.appendChild(frag);
});
});
/* live clock hands */
guard(function(){
function tick(){
var d=new Date(), m=d.getMinutes()+d.getSeconds()/60;
$$('.ck-hand').forEach(function(h){h.setAttribute('transform','rotate('+(m*6)+' 59 59)');});
}
tick(); setInterval(tick,30000);
});
/* map city highlight */
guard(function(){
function flash(city){
var target=null;
$$('.ccard').forEach(function(c){var on=c.getAttribute('data-city')===city;c.style.borderColor=on?'var(--prim)':'';if(on){target=c;}});
if(target&&window.innerWidth<=1120){target.scrollIntoView({behavior:RM?'auto':'smooth',block:'nearest'});}
toast('Город показан в карточках');
}
$$('.cnode').forEach(function(n){
n.addEventListener('click',function(){flash(n.getAttribute('data-city'));});
n.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();flash(n.getAttribute('data-city'));} });
});
$$('.ccard').forEach(function(n){ n.addEventListener('click',function(){flash(n.getAttribute('data-city'));}); });
});
/* media kit */
guard(function(){
var modal=$('#kit'), lastFocus=null;
if(!modal){return;}
function setTab(i){
$$('.tabs button',modal).forEach(function(b){var on=parseInt(b.getAttribute('data-tab'),10)===i;b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;});
$$('.tp',modal).forEach(function(p){p.classList.toggle('on',parseInt(p.getAttribute('data-tp'),10)===i);});
}
$$('.tabs button',modal).forEach(function(b){
b.addEventListener('click',function(){setTab(parseInt(b.getAttribute('data-tab'),10));});
b.addEventListener('keydown',function(e){
var bs=$$('.tabs button',modal), i=bs.indexOf(b), t=-1;
if(e.key==='ArrowRight'){t=(i+1)%bs.length;}
else if(e.key==='ArrowLeft'){t=(i-1+bs.length)%bs.length;}
else if(e.key==='Home'){t=0;}
else if(e.key==='End'){t=bs.length-1;}
if(t>=0){e.preventDefault();bs[t].focus();setTab(parseInt(bs[t].getAttribute('data-tab'),10));}
});
});
function open(i){ lastFocus=doc.activeElement; modal.classList.add('on'); doc.body.classList.add('lock'); setTab(i||0); var x=$('.x',modal); if(x){x.focus();} }
function close(){ modal.classList.remove('on'); doc.body.classList.remove('lock'); if(lastFocus&&lastFocus.focus){lastFocus.focus();} }
doc.addEventListener('keydown',function(e){
if(e.key==='Escape'){ if(modal.classList.contains('on')){close();} if(doc.body.classList.contains('menu')){menu(false);} }
if(e.key==='Tab'&&modal.classList.contains('on')){
var f=$$('button, a[href]',modal).filter(function(x){return x.offsetParent!==null;});
if(!f.length){return;}
var first=f[0], last=f[f.length-1];
if(e.shiftKey&&doc.activeElement===first){e.preventDefault();last.focus();}
else if(!e.shiftKey&&doc.activeElement===last){e.preventDefault();first.focus();}
}
});
function download(){
var rows='', y=250;
var data=[['Бузулук','Максима ФМ','100.2',':10 :30 :50'],['Бузулук','Energy ФМ','103.3',':15 :40'],['Бузулук','Юмор ФМ','103.8',':10 :40'],['Бузулук','Искатель','106.8',':19 :45'],['Бугуруслан','Energy ФМ','104.6',':15 :40'],['Бугуруслан','Юмор ФМ','105.4',':10 :40'],['Сорочинск','Юмор ФМ','102.9',':10 :40'],['Сорочинск','Energy ФМ','106.1',':15 :40'],['Сорочинск','Максима ФМ','106.6',':10 :30 :50']];
data.forEach(function(r){
rows+='<text x="40" y="'+y+'" font-size="12" fill="#111">'+r[0]+'</text><text x="190" y="'+y+'" font-size="12" fill="#111">'+r[1]+'</text><text x="360" y="'+y+'" font-size="12" fill="#111">'+r[2]+' FM</text><text x="470" y="'+y+'" font-size="12" fill="#111">'+r[3]+'</text><line x1="40" y1="'+(y+8)+'" x2="754" y2="'+(y+8)+'" stroke="#ddd"/>';
y+=24;
});
var ay=y+46, aud='', list=[['МАКСИМА ФМ','30–60+ (ядро 30–45)'],['ЮМОР ФМ','25–55 (ядро 30–50), 55% м / 45% ж'],['ENERGY ФМ','25–45 (ядро 25)'],['ИСКАТЕЛЬ','мужчины 25–45, руководители 38%']];
list.forEach(function(r){aud+='<text x="40" y="'+ay+'" font-size="12" font-weight="bold" fill="#111">'+r[0]+'</text><text x="230" y="'+ay+'" font-size="11" fill="#333">'+r[1]+'</text>';ay+=22;});
var svg='<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 794 1123"><rect width="794" height="1123" fill="#ffffff"/><rect width="794" height="8" fill="#0F4C81"/><g font-family="Helvetica,Arial,sans-serif">'+
'<text x="40" y="60" font-size="11" letter-spacing="4" fill="#888">МЕДИАХОЛДИНГ · ОРЕНБУРГСКАЯ ОБЛАСТЬ</text>'+
'<text x="40" y="100" font-size="32" font-weight="bold" fill="#111">РАДИО 56 — медиакит</text>'+
'<text x="40" y="128" font-size="13" fill="#555">4 станции · 3 города · 9 FM-частот · охват более 200 000 слушателей · с 2007 года</text>'+
'<text x="40" y="176" font-size="15" font-weight="bold" fill="#111">Частоты и рекламные блоки</text>'+
'<text x="40" y="220" font-size="10" fill="#888">ГОРОД</text><text x="190" y="220" font-size="10" fill="#888">СТАНЦИЯ</text><text x="360" y="220" font-size="10" fill="#888">ЧАСТОТА</text><text x="470" y="220" font-size="10" fill="#888">БЛОКИ</text>'+
'<line x1="40" y1="228" x2="754" y2="228" stroke="#999"/>'+rows+
'<text x="40" y="'+(y+24)+'" font-size="15" font-weight="bold" fill="#111">Аудитории</text>'+aud+
'<text x="40" y="'+(ay+30)+'" font-size="15" font-weight="bold" fill="#111">Тарифы и коэффициенты</text>'+
'<text x="40" y="'+(ay+56)+'" font-size="11" fill="#333">Прайм-тайм 07:00–09:00 · 12:00–14:00 · 16:30–19:00 — 7,50 ₽/сек</text>'+
'<text x="40" y="'+(ay+76)+'" font-size="11" fill="#333">День / вечер 09:00–12:00 · 14:00–16:30 · 19:00–24:00 — 6,00 ₽/сек</text>'+
'<text x="40" y="'+(ay+96)+'" font-size="11" fill="#333">Ночь 24:00–07:00 — 2,00 ₽/сек</text>'+
'<text x="40" y="'+(ay+120)+'" font-size="11" fill="#333">Коэффициенты: ноябрь–декабрь +10% · июль–август −5% · 1-й в блоке +30% · ролик от 2 000 руб.</text>'+
'<text x="40" y="'+(ay+144)+'" font-size="11" fill="#333">Пакеты: Старт 2 400 · Неделя 3 640 · Полумесяц 6 720 · Месяц 12 000 руб.</text>'+
'<text x="40" y="'+(ay+168)+'" font-size="11" fill="#333">Спецпредложения для местных: 8 400 руб/мес (Максима, Искатель, Бугуруслан).</text>'+
'<text x="40" y="'+(ay+192)+'" font-size="11" fill="#333">Сетевые тарифы: Energy 17,00 · Юмор 13,50 · Максима 9,00 руб/сек.</text>'+
'<text x="40" y="'+(ay+216)+'" font-size="11" fill="#333">Зоны покрытия около 40 км; в низинах (Тоцкое) приём зависит от погоды.</text>'+
'<text x="40" y="'+(ay+240)+'" font-size="11" fill="#333">Процесс: заявка → подбор → договор → запись → эфир и справка.</text>'+
'<line x1="40" y1="1010" x2="754" y2="1010" stroke="#999"/>'+
'<text x="40" y="1034" font-size="11" fill="#111">Отдел рекламы: 8 922 825-05-50 · radio56@bk.ru · Пн–Пт 9:00–18:00</text>'+
'<text x="40" y="1054" font-size="10" fill="#555">ООО «Радио 56» · ИНН 7726581710 · ОГРН 1077762658577 · Лицензия Роскомнадзора № Л033-00114-77/00062730</text>'+
'<text x="40" y="1072" font-size="10" fill="#555">Вещание только в эфирном FM-диапазоне. Юридический адрес — в договорах и закрывающих документах.</text>'+
'<text x="40" y="1092" font-size="9" fill="#888">© 2007–2026 ООО «Радио 56». Цены указаны в рублях без НДС. Не являются публичной офертой.</text></g></svg>';
var blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
var url=URL.createObjectURL(blob), a=doc.createElement('a');
a.href=url; a.download='radio56-mediakit.svg'; doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
setTimeout(function(){URL.revokeObjectURL(url);},1200);
toast('Медиакит сохранён (SVG)');
}
function printKit(){
var kp=$('#kp');
if(!kp){return;}
kp.innerHTML='<h1>Радио 56 — медиакит</h1><p>4 станции · 3 города · 9 FM-частот · охват более 200 000 слушателей · с 2007 года</p>'+
'<h2>Частоты и рекламные блоки</h2><table><tr><th>Город</th><th>Станция</th><th>Частота</th><th>Блоки</th></tr>'+
'<tr><td>Бузулук</td><td>Максима ФМ</td><td>100.2</td><td>:10 :30 :50</td></tr>'+
'<tr><td>Бузулук</td><td>Energy ФМ</td><td>103.3</td><td>:15 :40</td></tr>'+
'<tr><td>Бузулук</td><td>Юмор ФМ</td><td>103.8</td><td>:10 :40</td></tr>'+
'<tr><td>Бузулук</td><td>Искатель</td><td>106.8</td><td>:19 :45</td></tr>'+
'<tr><td>Бугуруслан</td><td>Energy ФМ</td><td>104.6</td><td>:15 :40</td></tr>'+
'<tr><td>Бугуруслан</td><td>Юмор ФМ</td><td>105.4</td><td>:10 :40</td></tr>'+
'<tr><td>Сорочинск</td><td>Юмор ФМ</td><td>102.9</td><td>:10 :40</td></tr>'+
'<tr><td>Сорочинск</td><td>Energy ФМ</td><td>106.1</td><td>:15 :40</td></tr>'+
'<tr><td>Сорочинск</td><td>Максима ФМ</td><td>106.6</td><td>:10 :30 :50</td></tr></table>'+
'<h2>Аудитории</h2><table><tr><th>Станция</th><th>Аудитория</th></tr>'+
'<tr><td>Максима ФМ</td><td>30–60+ (ядро 30–45): автомобилисты, офис, семьи</td></tr>'+
'<tr><td>Юмор ФМ</td><td>25–55 (ядро 30–50), семьи; 55% мужчины / 45% женщины</td></tr>'+
'<tr><td>Energy ФМ</td><td>25–45 (ядро 25): активные, мобильные</td></tr>'+
'<tr><td>Искатель</td><td>Мужчины 25–45: руководители 38%, специалисты 33%, доход выше среднего 55%, высшее образование 60%</td></tr></table>'+
'<h2>Тарифы</h2><p>Прайм-тайм 07:00–09:00 · 12:00–14:00 · 16:30–19:00 — 7,50 ₽/сек</p><p>День / вечер 09:00–12:00 · 14:00–16:30 · 19:00–24:00 — 6,00 ₽/сек</p><p>Ночь 24:00–07:00 — 2,00 ₽/сек</p>'+
'<p>Пакеты: Старт 2 400 · Неделя 3 640 · Полумесяц 6 720 · Месяц 12 000 руб.</p>'+
'<p>Спецпредложения для местных: 8 400 руб/мес (Максима, Искатель, Бугуруслан).</p>'+
'<p>Сетевые тарифы: Energy — 3 города (17,00 ₽/сек), Юмор — 3 города (13,50 ₽/сек), Максима — 2 города (9,00 ₽/сек).</p>'+
'<p>Зоны покрытия около 40 км; в низинах (Тоцкое) приём зависит от погоды. Процесс: заявка → подбор → договор → запись → эфир.</p>'+
'<div class="kpf">Отдел рекламы: 8 922 825-05-50 · radio56@bk.ru · Пн–Пт 9:00–18:00<br>ООО «Радио 56» · ИНН 7726581710 · ОГРН 1077762658577 · Лицензия Роскомнадзора № Л033-00114-77/00062730<br>Вещание ведётся исключительно в эфирном FM-диапазоне. © 2007–2026.</div>';
doc.body.classList.add('pk');
window.print();
setTimeout(function(){doc.body.classList.remove('pk');},500);
}
window.addEventListener('afterprint',function(){doc.body.classList.remove('pk');});
doc.addEventListener('click',function(e){
var t=e.target.closest('[data-act]'); if(!t){return;}
var a=t.getAttribute('data-act');
if(a==='kit'){open(parseInt(t.getAttribute('data-tab')||'0',10));}
else if(a==='close'){close();}
else if(a==='kitsvg'){download();}
else if(a==='kitprint'){printKit();}
else if(a==='top'){window.scrollTo({top:0,behavior:RM?'auto':'smooth'});}
});
});
/* menu, scroll, nav active */
function menu(v){
doc.body.classList.toggle('menu',v);
var b=$('#burger'); if(b){b.setAttribute('aria-expanded',v?'true':'false');}
doc.body.classList.toggle('lock',v);
}
guard(function(){
var burger=$('#burger');
if(burger){burger.addEventListener('click',function(){menu(!doc.body.classList.contains('menu'));});}
$$('#drawer a').forEach(function(a){a.addEventListener('click',function(){menu(false);});});
var ticking=false;
function onScroll(){
if(ticking){return;} ticking=true;
requestAnimationFrame(function(){
ticking=false;
var y=window.pageYOffset||0;
var h=doc.documentElement.scrollHeight-window.innerHeight;
var p=$('#prog'); if(p){p.style.width=(h>0?Math.min(y/h,1)*100:0)+'%';}
var nav=$('#nav'); if(nav){nav.classList.toggle('stuck',y>8);}
});
}
window.addEventListener('scroll',onScroll,{passive:true});
onScroll();
if('IntersectionObserver' in window){
var links=$$('#nlinks a');
var io=new IntersectionObserver(function(entries){
entries.forEach(function(en){
if(!en.isIntersecting){return;}
var id='#'+en.target.id;
links.forEach(function(a){a.classList.toggle('act',a.getAttribute('href')===id);});
});
},{rootMargin:'-45% 0px -50% 0px'});
['about','stations','advertisers','production','contacts'].forEach(function(id){
var s=doc.getElementById(id); if(s){io.observe(s);}
});
}
});
})();