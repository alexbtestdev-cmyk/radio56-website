(function(){
'use strict';
var doc=document, root=doc.documentElement;
function $(s,r){return (r||doc).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||doc).querySelectorAll(s));}
function guard(fn){try{fn();}catch(err){if(window.console&&console.warn){console.warn(err);}}}

var RM=false; try{RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
var MKEY='r56-motion', TKEY='r56-theme';
var storedMotion=null, storedTheme=null;
try{storedMotion=window.localStorage.getItem(MKEY);storedTheme=window.localStorage.getItem(TKEY);}catch(e){}
var motion=!RM && storedMotion!=='off';
function animOK(){return motion && !RM;}
root.setAttribute('data-motion',animOK()?'on':'off');

var NAME={maxima:'Максима ФМ',humor:'Юмор ФМ',energy:'Energy ФМ',iskatel:'Искатель'};
var CVAR={maxima:'--st-max',humor:'--st-hum',energy:'--st-enr',iskatel:'--st-isk'};
var ORDER=['maxima','humor','energy','iskatel'];
var CV={};
function colorOf(v){try{return (getComputedStyle(root).getPropertyValue(v)||'').trim()||'#0F4C81';}catch(e){return '#0F4C81';}}
function readColors(){for(var k in CVAR){CV[k]=colorOf(CVAR[k]);}}
var sel='maxima';

var sysDark=false; try{sysDark=window.matchMedia('(prefers-color-scheme: dark)').matches;}catch(e){}
var dark=storedTheme?(storedTheme==='dark'):sysDark;
if(dark){root.setAttribute('data-theme','dark');}

var SEC={
  'about':'--prim','stations':'--sel','geography':'--info','advertisers':'--amber2',
  'production':'--st-enr','result':'--ok','contacts':'--prim2',
  'rates':'--amber2','packs':'--prim','special':'--ok','network':'--st-enr','terms':'--info'
};
var activeSec='';
function paintAccent(){
  var v=SEC[activeSec]||'--prim';
  var c=(v==='--sel')?(CV[sel]||colorOf('--st-max')):colorOf(v);
  root.style.setProperty('--prog-c',c);
}

function toast(msg){
  var box=$('#toasts'); if(!box){return;}
  var el=doc.createElement('div'); el.className='toast';
  var dot=doc.createElement('i'), span=doc.createElement('span');
  span.textContent=msg; el.appendChild(dot); el.appendChild(span); box.appendChild(el);
  while(box.children.length>4){box.removeChild(box.firstChild);}
  setTimeout(function(){
    el.classList.add('out');
    setTimeout(function(){if(el.parentNode){el.parentNode.removeChild(el);}},animOK()?260:0);
  },2600);
}

/* reveal */
var revealItems=[];
guard(function(){
  revealItems=$$('[data-rv]');
  if(!animOK()||!('IntersectionObserver' in window)){return;}
  revealItems.forEach(function(el){el.classList.add('rvh');});
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){en.target.classList.remove('rvh');io.unobserve(en.target);}
    });
  },{threshold:.08,rootMargin:'0px 0px -40px 0px'});
  revealItems.forEach(function(el){io.observe(el);});
  setTimeout(function(){revealItems.forEach(function(el){el.classList.remove('rvh');});},2600);
});

/* counters */
guard(function(){
  var nodes=$$('[data-count]');
  if(!animOK()||!('IntersectionObserver' in window)){return;}
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting){return;}
      io.unobserve(en.target);
      var el=en.target, to=parseInt(el.getAttribute('data-count'),10), suf=el.getAttribute('data-suf')||'', t0=0;
      if(isNaN(to)){return;}
      function fmt(v){return to>=1000?v.toLocaleString('ru-RU'):String(v);}
      function step(now){
        if(!t0){t0=now;}
        var p=Math.min((now-t0)/1200,1), e=1-Math.pow(1-p,3);
        el.textContent=fmt(Math.round(e*to))+(p>=1?suf:'');
        if(p<1){requestAnimationFrame(step);}
      }
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
  root.style.setProperty('--skyA',t[0]);
  root.style.setProperty('--skyB',t[1]);
}
guard(function(){
  readColors(); setSky(); paintAccent();
  var btn=$('#themeBtn'); if(!btn){return;}
  btn.setAttribute('aria-pressed',dark?'true':'false');
  btn.addEventListener('click',function(){
    dark=!dark;
    if(dark){root.setAttribute('data-theme','dark');}else{root.removeAttribute('data-theme');}
    btn.setAttribute('aria-pressed',dark?'true':'false');
    try{window.localStorage.setItem(TKEY,dark?'dark':'light');}catch(e){}
    setSky(); readColors(); paintAccent();
    toast(dark?'Тёмная тема включена':'Светлая тема включена');
  });
});

/* equalizers — один rAF-цикл */
var eqList=[], raf=0, running=false, eqVisible=true;
function sizeEq(){
  var dpr=Math.min(window.devicePixelRatio||1,2);
  eqList.forEach(function(o){
    var w=o.el.clientWidth||300;
    o.el.width=Math.round(w*dpr);
    o.el.height=Math.round(56*dpr);
    o.ctx.setTransform(dpr,0,0,dpr,0,0);
    o.w=w; o.h=56;
  });
}
function hash(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function sig(id,i,n,t){
  var u=i/n,v;
  if(id==='energy'){v=.35+.5*Math.abs(Math.sin(t*3.4+u*11))+.15*Math.sin(t*7+u*23);}
  else if(id==='humor'){var g=(Math.sin(t*1.7+u*2.5)>0?1:.35);v=(.3+.5*Math.abs(Math.sin(t*2.6+u*9)))*g;}
  else if(id==='iskatel'){v=.22+.32*Math.abs(Math.sin(t*1.2+u*5));if(hash(i+Math.floor(t*2))>.86){v+=.4;}}
  else{v=.34+.42*Math.exp(-Math.pow((u-.45)*2.2,2))+.18*Math.abs(Math.sin(t*1.6+u*7));}
  return Math.min(Math.max(v*(.82+.3*hash(i)),.05),1);
}
function drawEq(o,t,instant){
  if(!o.w){return;}
  var ctx=o.ctx,n=30,gap=2,bw=(o.w-12)/n-gap,col=CV[o.id]||'#0F4C81';
  ctx.clearRect(0,0,o.w,o.h);
  for(var i=0;i<n;i++){
    var target=sig(o.id,i,n,t);
    var prev=o.vals[i]===undefined?0:o.vals[i];
    o.vals[i]=instant?target:prev+(target-prev)*.18;
    var h=Math.max(3,o.vals[i]*(o.h-12)), x=6+i*(bw+gap), y=o.h-6-h;
    ctx.fillStyle=col; ctx.globalAlpha=.85; ctx.fillRect(x,y,bw,h);
    ctx.globalAlpha=.25; ctx.fillRect(x,o.h-4,bw,2); ctx.globalAlpha=1;
  }
}
function activeEq(){
  for(var i=0;i<eqList.length;i++){
    var p=eqList[i].el.parentNode;
    if(p&&p.classList.contains('on')){return eqList[i];}
  }
  return null;
}
function drawStatic(){var o=activeEq(); if(o){drawEq(o,1.2,true);}}
function loop(now){
  raf=requestAnimationFrame(loop);
  var o=activeEq();
  if(o){drawEq(o,now/1000,false);}
}
function syncLoop(){
  var want=animOK() && !doc.hidden && eqVisible && eqList.length>0;
  if(want&&!running){running=true;raf=requestAnimationFrame(loop);}
  else if(!want&&running){running=false;cancelAnimationFrame(raf);raf=0;}
}
guard(function(){
  $$('.eqc').forEach(function(c){
    var ctx=c.getContext('2d');
    if(ctx){eqList.push({el:c,ctx:ctx,id:c.getAttribute('data-eq'),vals:[]});}
  });
  if(!eqList.length){return;}
  sizeEq(); drawStatic(); syncLoop();
  doc.addEventListener('visibilitychange',syncLoop);
  if('IntersectionObserver' in window){
    var box=$('#selector');
    if(box){
      new IntersectionObserver(function(en){
        eqVisible=en[0].isIntersecting; syncLoop();
      },{threshold:0}).observe(box);
    }
  }
});

/* выбор станции */
var scale=null, needle=null, needlePct=12.5, tuneT=0;
function placeNeedle(animate){
  if(!scale||!needle){return;}
  var w=scale.clientWidth;
  var noAnim=!animate||!animOK();
  if(noAnim){needle.style.transition='none';}
  needle.style.transform='translate3d('+(w*needlePct/100-1.5)+'px,0,0)';
  if(noAnim){void needle.offsetWidth;needle.style.transition='';}
}
function moveRail(id){
  var ind=$('#railInd'), btn=$('.stb[data-st="'+id+'"]');
  if(!ind||!btn){return;}
  ind.style.height=btn.offsetHeight+'px';
  ind.style.background='var('+CVAR[id]+')';
  ind.style.transform='translate3d(0,'+btn.offsetTop+'px,0)';
}
function selectSt(id){
  if(NAME[id]===undefined){return;}
  var changed=(id!==sel);
  sel=id;
  root.style.setProperty('--sel','var('+CVAR[id]+')');
  needlePct=12.5+ORDER.indexOf(id)*25;
  placeNeedle(true);
  if(needle&&changed&&animOK()){
    needle.classList.remove('tuning'); void needle.offsetWidth; needle.classList.add('tuning');
    clearTimeout(tuneT); tuneT=setTimeout(function(){needle.classList.remove('tuning');},380);
  }
  $$('.stop').forEach(function(b){
    var on=b.getAttribute('data-st')===id;
    b.classList.toggle('on',on);
    b.setAttribute('aria-pressed',on?'true':'false');
    if(on&&changed&&animOK()){
      b.classList.remove('lock'); void b.offsetWidth; b.classList.add('lock');
      setTimeout(function(){b.classList.remove('lock');},640);
    }
  });
  $$('.key').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-st')===id);});
  $$('.stb').forEach(function(b){
    var on=b.getAttribute('data-st')===id;
    b.classList.toggle('on',on);
    b.setAttribute('aria-selected',on?'true':'false');
    b.tabIndex=on?0:-1;
  });
  $$('.doss').forEach(function(d){d.classList.toggle('on',d.getAttribute('data-d')===id);});
  $$('.panel').forEach(function(p){p.classList.toggle('on',p.getAttribute('data-p')===id);});
  moveRail(id);
  eqList.forEach(function(o){if(o.id===id){o.vals=[];}});
  guard(sizeEq);
  if(!animOK()){drawStatic();}
  syncLoop();
  paintAccent();
}
guard(function(){
  scale=$('#scale'); needle=$('#needle');
  if(needle){needle.style.left='0px';}
  if(!$$('.stb').length && !$$('.stop').length){return;}
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
        var st=$('#stations');
        if(st){st.scrollIntoView({behavior:animOK()?'smooth':'auto',block:'start'});}
      }
    });
  });
  if(scale){
    var dragging=false;
    function idxFromX(x){
      var r=scale.getBoundingClientRect();
      var t=Math.min(Math.max((x-r.left)/r.width,0),1);
      return Math.min(Math.max(Math.round((t*100-12.5)/25),0),3);
    }
    scale.addEventListener('pointerdown',function(e){
      if(e.target.closest('.stop')){return;}
      dragging=true;
      try{scale.setPointerCapture(e.pointerId);}catch(err){}
      selectSt(ORDER[idxFromX(e.clientX)]);
    });
    scale.addEventListener('pointermove',function(e){if(dragging){selectSt(ORDER[idxFromX(e.clientX)]);}});
    scale.addEventListener('pointerup',function(){dragging=false;});
    scale.addEventListener('pointercancel',function(){dragging=false;});
    scale.addEventListener('keydown',function(e){
      var i=ORDER.indexOf(sel);
      if(e.key==='ArrowRight'||e.key==='ArrowDown'){selectSt(ORDER[Math.min(i+1,3)]);e.preventDefault();}
      if(e.key==='ArrowLeft'||e.key==='ArrowUp'){selectSt(ORDER[Math.max(i-1,0)]);e.preventDefault();}
    });
  }
  selectSt('maxima');
  placeNeedle(false);
});

/* бегущая строка частот */
guard(function(){
  var row=$('#trow'), tick=$('#ticker');
  if(!row){return;}
  function speed(){
    var half=row.scrollWidth/2;
    if(half>0){row.style.animationDuration=Math.max(24,Math.round(half/55))+'s';}
  }
  speed();
  window.addEventListener('resize',function(){clearTimeout(window.__tkt);window.__tkt=setTimeout(speed,180);});
  if(tick&&'IntersectionObserver' in window){
    new IntersectionObserver(function(en){
      tick.classList.toggle('paused',!en[0].isIntersecting);
    },{threshold:0}).observe(tick);
  }
});

/* точки выходов в пакетах */
guard(function(){
  $$('.dots').forEach(function(box){
    if(box.children.length){return;}
    var n=parseInt(box.getAttribute('data-dots'),10)||0, b=parseInt(box.getAttribute('data-bonus'),10)||0;
    var frag=doc.createDocumentFragment();
    for(var i=0;i<n+b;i++){var s=doc.createElement('i');if(i>=n){s.className='bn';}frag.appendChild(s);}
    box.appendChild(frag);
  });
});

/* часы блоков + «сейчас блок» */
guard(function(){
  if(!$$('.clockcard').length){return;}
  function tick(){
    var d=new Date(), mins=d.getMinutes(), frac=mins+d.getSeconds()/60;
    $$('.ck-hand').forEach(function(h){h.style.transform='rotate('+(frac*6)+'deg)';});
    $$('.clockcard').forEach(function(card){
      var svg=$('.clock',card); if(!svg){return;}
      var blocks=(svg.getAttribute('data-blocks')||'').split(',').map(function(x){return parseInt(x,10);});
      var live=-1;
      blocks.forEach(function(b){if(!isNaN(b)&&mins>=b&&mins<b+3){live=b;}});
      var badge=$('.nowbadge',card);
      if(badge){badge.hidden=(live<0);}
      card.classList.toggle('live',live>=0);
      $$('.ci',card).forEach(function(ci){
        ci.classList.toggle('now',parseInt(ci.getAttribute('data-min'),10)===live);
      });
    });
  }
  tick();
  setInterval(tick,30000);
});

/* карта — одноразовая прорисовка, без кликов и тостов */
guard(function(){
  var svg=$('#mapsvg'); if(!svg){return;}
  var paths=$$('.draw',svg);
  if(animOK()){
    svg.classList.add('predraw');
    paths.forEach(function(p){
      var len=0;
      try{len=p.getTotalLength();}catch(e){}
      if(len>0){p.style.strokeDasharray=len;p.style.strokeDashoffset=len;}
    });
  }
  function draw(){
    svg.classList.add('drawn');
    paths.forEach(function(p){p.style.strokeDashoffset='0';});
  }
  if(animOK()&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(en){
      if(en[0].isIntersecting){draw();io.disconnect();}
    },{threshold:.15});
    io.observe(svg);
    setTimeout(function(){if(!svg.classList.contains('drawn')){draw();}},4000);
  }else{draw();}
  window.__mapDraw=draw;
});

/* сворачиваемые блоки: десктоп открыт, мобильный закрыт */
guard(function(){
  var ds=$$('details.fold');
  if(!ds.length){return;}
  var mq=null; try{mq=window.matchMedia('(max-width:760px)');}catch(e){}
  function sync(){
    var mob=mq?mq.matches:window.innerWidth<=760;
    ds.forEach(function(d){d.open=!mob;});
  }
  sync();
  if(mq){
    if(mq.addEventListener){mq.addEventListener('change',sync);}
    else if(mq.addListener){mq.addListener(sync);}
  }
});

/* меню, скролл, активный раздел */
function menu(v){
  doc.body.classList.toggle('menu',v);
  var b=$('#burger'); if(b){b.setAttribute('aria-expanded',v?'true':'false');}
  doc.body.classList.toggle('lock',v);
}
guard(function(){
  var burger=$('#burger'), drawer=$('#drawer');
  if(burger){burger.addEventListener('click',function(){menu(!doc.body.classList.contains('menu'));});}
  $$('#drawer a').forEach(function(a){a.addEventListener('click',function(){menu(false);});});
  doc.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&doc.body.classList.contains('menu')){menu(false);if(burger){burger.focus();}}
    if(e.key==='Tab'&&doc.body.classList.contains('menu')&&drawer){
      var f=$$('a[href],button',drawer).filter(function(x){return x.offsetParent!==null;});
      if(!f.length){return;}
      var first=f[0], last=f[f.length-1];
      if(e.shiftKey&&doc.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&doc.activeElement===last){e.preventDefault();first.focus();}
    }
  });

  var layers=[$('.amb .l1'),$('.amb .l2'),$('.amb .l3')], sky=$('#hsky');
  var ticking=false;
  function onScroll(){
    if(ticking){return;}
    ticking=true;
    requestAnimationFrame(function(){
      ticking=false;
      var y=window.pageYOffset||0;
      var h=doc.documentElement.scrollHeight-window.innerHeight;
      var p=$('#prog'); if(p){p.style.width=(h>0?Math.min(y/h,1)*100:0)+'%';}
      var nav=$('#nav'); if(nav){nav.classList.toggle('stuck',y>8);}
      if(animOK()&&y<window.innerHeight*1.4){
        if(layers[0]){layers[0].style.transform='translate3d(0,'+(y*0.06)+'px,0)';}
        if(layers[1]){layers[1].style.transform='translate3d(0,'+(y*-0.045)+'px,0)';}
        if(layers[2]){layers[2].style.transform='translate3d(0,'+(y*0.03)+'px,0)';}
        if(sky){sky.style.transform='translate3d(0,'+(y*0.12)+'px,0)';}
      }
    });
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  if('IntersectionObserver' in window){
    var links=$$('#nlinks a');
    var ids=[];
    links.forEach(function(a){
      var h=a.getAttribute('href')||'';
      if(h.charAt(0)==='#'&&h.length>1){ids.push(h.slice(1));}
    });
    if(ids.length){
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(!en.isIntersecting){return;}
          activeSec=en.target.id;
          var id='#'+activeSec;
          links.forEach(function(a){a.classList.toggle('act',a.getAttribute('href')===id);});
          paintAccent();
        });
      },{rootMargin:'-45% 0px -50% 0px'});
      ids.forEach(function(id){var s=doc.getElementById(id);if(s){io.observe(s);}});
    }
  }
});

/* переключатель анимаций */
guard(function(){
  var btn=$('#motionBtn'), row=$('#motionRow'), state=$('#motionRowState');
  function paint(){
    var on=animOK();
    root.setAttribute('data-motion',on?'on':'off');
    if(btn){
      btn.setAttribute('aria-pressed',on?'true':'false');
      btn.setAttribute('aria-label','Анимации: '+(on?'включены':'выключены'));
      btn.title='Анимации: '+(on?'включены':'выключены');
    }
    if(row){row.setAttribute('aria-pressed',on?'true':'false');}
    if(state){state.textContent=on?'включены':'выключены';}
  }
  function apply(){
    paint();
    if(!animOK()){
      revealItems.forEach(function(el){el.classList.remove('rvh');});
      if(window.__mapDraw){window.__mapDraw();}
      $$('.msvg .draw').forEach(function(p){p.style.strokeDasharray='none';p.style.strokeDashoffset='0';});
      placeNeedle(false);
      drawStatic();
    }
    syncLoop();
  }
  function toggle(){
    if(RM){toast('Анимации отключены системной настройкой');return;}
    motion=!motion;
    try{window.localStorage.setItem(MKEY,motion?'on':'off');}catch(e){}
    apply();
    toast(motion?'Анимации включены':'Анимации выключены');
  }
  if(btn){btn.addEventListener('click',toggle);}
  if(row){row.addEventListener('click',toggle);}
  paint();
});

/* resize */
guard(function(){
  var t=0;
  window.addEventListener('resize',function(){
    clearTimeout(t);
    t=setTimeout(function(){
      if(eqList.length){sizeEq(); if(!animOK()){drawStatic();}}
      placeNeedle(false);
      moveRail(sel);
    },150);
  });
});

/* прочее */
guard(function(){
  doc.addEventListener('click',function(e){
    var t=e.target.closest('[data-act]'); if(!t){return;}
    if(t.getAttribute('data-act')==='top'){
      window.scrollTo({top:0,behavior:animOK()?'smooth':'auto'});
    }
  });
});
})();