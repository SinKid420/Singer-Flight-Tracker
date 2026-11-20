// AwareBC Off-road safety (by Josh Singer):
//  1) "Back by" check-in: set a return time and pick friends. The AwareBC server keeps the timer, so if you don't check in,
//     your friends are alerted with your last spot even if your phone is dead or out of signal.
//  2) Resource road radio: on a forest road, shows the road's radio channel (from the sign, shared by riders) and how to call.
(function(){
  var A=window.__AW; if(!A||!A.map) return; var MAP=A.map, esc=A.esc, RS='https://awarebc.aware-bc.workers.dev';
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v) }catch(e){ return null } }
  function lj(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?d:v }catch(e){ return d } }
  function sj(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)) }catch(e){} }
  function uid(){ return ls('sky-uid')||'' }
  function name(){ return ls('sky-trname')||'' }
  function post(path,b){ return fetch(RS+'/s/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({uid:uid(),name:name()},b))})
    .then(function(r){ return r.json().catch(function(){ return {error:'Server error ('+r.status+')'} }).then(function(j){ if(!r.ok||j.error) throw new Error(j.error||'Server error'); return j }) }) }
  function offRoad(){ return document.body.classList.contains('fsron') }
  function me(){ var m=A.me&&A.me(); return m&&m.label!=='none'&&isFinite(m.lat)?m:null }
  function clock(t){ return new Date(t).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}) }
  function left(ms){ if(ms<=0) return 'now'; var m=Math.round(ms/60000); return m<60?m+' min':Math.floor(m/60)+':'+('0'+(m%60)).slice(-2) }
  function toast(t){ var d=document.createElement('div'); d.className='frtoast'; d.style.zIndex=6400; d.textContent=t; document.body.appendChild(d); setTimeout(function(){ d.classList.add('go') },2800); setTimeout(function(){ d.remove() },3400) }
  function buzz(){ try{ if(navigator.vibrate) navigator.vibrate([300,120,300,120,300]) }catch(e){} }
  function sheet(html){ var o=document.createElement('div'); o.className='osbg'; o.innerHTML='<div class="ossh" role="dialog"><div class="grab"></div>'+html+'</div>'; document.body.appendChild(o); o.addEventListener('click',function(e){ if(e.target===o) o.remove() }); return o }

  // ================= 1) BACK BY =================
  var C=lj('aw-chk',null), Q=lj('aw-chkq',[]); // my active check-in, actions waiting for signal
  function saveC(){ sj('aw-chk',C); paint() }
  var btn=document.createElement('button'); btn.type='button'; btn.id='bbbtn'; btn.className='sidebtn'; btn.setAttribute('aria-label','Back by: check-in timer'); btn.innerHTML='<span aria-hidden="true">⏱️</span>'; document.body.appendChild(btn);
  btn.onclick=function(){ if(C) return manage(); openSet() };
  var ban=document.createElement('div'); ban.id='bbban'; ban.hidden=true; ban.setAttribute('role','status'); document.body.appendChild(ban);
  function paint(){ var on=!!C&&offRoad(); btn.classList.toggle('on',!!C); ban.hidden=!on; if(typeof drawCard==='function'&&cur) setTimeout(drawCard,0); if(!on) return; var ms=C.due-Date.now(), late=ms<0;
    ban.classList.toggle('late',late); ban.innerHTML='<div class="t"><span>⏱️</span><div><b>'+(late?'You’re overdue':'Back by '+clock(C.due))+'</b><small>'+(late?'Your friends are being told. Check in now.':(C.n||0)+' friend'+(C.n===1?'':'s')+' told if you don’t check in')+'</small></div><em>'+(late?'⚠️':left(ms))+'</em></div>'+
      '<div class="bt"><button type="button" class="g" data-b="done">✓ I’m back</button><button type="button" data-b="ext">+1 hour</button><button type="button" data-b="edit">Edit</button></div>' }
  ban.onclick=function(e){ var b=e.target.closest&&e.target.closest('[data-b]'); if(!b){ if(ban.classList.contains('mini')){ ban.classList.add('open'); ban.classList.remove('mini'); drawCard(); setTimeout(function(){ ban.classList.remove('open'); drawCard() },8000) } return } var a=b.getAttribute('data-b');
    if(a==='done') return act({op:'done'},function(){ C=null; saveC(); toast('Welcome back 👍 Your friends won’t be alerted.') });
    if(a==='ext') return act({op:'ext',mins:60},function(j){ C.due=j&&j.due||C.due+3600000; saveC(); toast('Back by '+clock(C.due)) });
    if(a==='edit') return openSet() };
  function act(o,ok){ var m=me(); if(m){ o.lat=m.lat; o.lon=m.lon }
    if(navigator.onLine===false){ Q.push(o); sj('aw-chkq',Q); if(o.op==='ext') C.due+=o.mins*60000; ok(null); toast('No signal: this goes out as soon as you have service.'); return }
    post('chk',o).then(ok,function(e){ if(/fetch|network|load failed/i.test(String(e.message))){ Q.push(o); sj('aw-chkq',Q); if(o.op==='ext') C.due+=o.mins*60000; ok(null); toast('No signal: this goes out as soon as you have service.') } else toast(e.message) }) }
  function flush(){ if(!Q.length||navigator.onLine===false) return; var o=Q[0]; post('chk',o).then(function(){ Q.shift(); sj('aw-chkq',Q); flush() },function(){}) }
  addEventListener('online',function(){ setTimeout(flush,2000) });
  // last spot: every 5 minutes while a check-in is running
  setInterval(function(){ if(!C||navigator.onLine===false) return; var m=me(); if(m) post('chk',{op:'pos',lat:m.lat,lon:m.lon}).catch(function(){}) },300000);
  setInterval(function(){ paint(); if(C&&C.due<Date.now()&&!C.warned){ C.warned=1; sj('aw-chk',C); buzz(); if(window.__native&&window.__native.notify) window.__native.notify('AwareBC','You’re past your back-by time. Check in so your friends aren’t worried.') } },15000);
  document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('.seg button')) setTimeout(function(){ paint(); radio() },120) },true);
  function manage(){ openSet() }
  var BBCSS=false;
  function bbCss(){ if(BBCSS) return; BBCSS=true; var st=document.createElement('style'); st.textContent=
    '.ossh.bb2{background:radial-gradient(90% 34% at 50% 14%,rgba(255,179,64,.16),transparent 70%),#0b0e12;border-top:1px solid rgba(255,255,255,.08);padding-top:14px}.ossh.bb2 .grab{display:none}'+
    '.bb2 .hd{display:flex;align-items:center}.bb2 .hd h3{font:800 21px var(--font,system-ui)}.bb2 .hd button{margin-left:auto;width:38px;height:38px;border-radius:50%;border:0;background:rgba(255,255,255,.08);color:#fff;font:700 16px var(--font,system-ui)}'+
    '.bb2 .dial{display:block;width:100%;max-width:300px;margin:0 auto;touch-action:none;user-select:none;-webkit-user-select:none}.bb2 .dh{text-align:center;font:600 11px var(--font,system-ui);color:#7d8692;margin-top:-6px}'+
    '.bb2 .tc{display:flex;gap:6px;margin-top:10px}.bb2 .tc>*{flex:1;text-align:center;padding:9px 4px;border-radius:12px;font:700 12px var(--font,system-ui);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:#fff;position:relative;white-space:nowrap}'+
    '.bb2 .tc>.w{flex:1.5}.bb2 .tc .on{background:rgba(255,179,64,.2);color:#ffc35a;border-color:rgba(255,179,64,.45)}.bb2 .tc input{position:absolute;inset:0;opacity:0;width:100%}'+
    '.bb2 .card{display:flex;align-items:center;gap:8px;margin-top:10px;padding:8px 12px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);font:600 12px var(--font,system-ui);color:#c7ccd3}'+
    '.bb2 .card .k{font-weight:700;color:#9aa3ad}.bb2 .card .nm{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bb2 .card button{margin-left:auto;border:0;background:none;color:#64d2ff;font:700 12px var(--font,system-ui);flex:none}'+
    '.bb2 .av{width:28px;height:28px;border-radius:50%;flex:none;display:grid;place-items:center;font:800 10.5px var(--font,system-ui);color:#0a0d10;box-shadow:0 0 0 2px #0b0e12,0 0 0 3.5px #32d74b}'+
    '.bb2 .frs{margin-top:6px}.bb2 .frs[hidden]{display:none}.bb2 .fr{background:rgba(255,255,255,.04)!important;border:1px solid rgba(255,255,255,.07)}'+
    '.bb2 .note{margin-top:8px;background:rgba(255,255,255,.05)!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:14px!important;height:42px!important;font-size:14px!important}'+
    '.bb2 .ft{text-align:center;font:500 10.5px var(--font,system-ui);color:#7d8692;margin:12px 0 8px}'+
    '.bb2 .sl{position:relative;height:58px;border-radius:29px;background:linear-gradient(90deg,rgba(50,215,75,.28),rgba(50,215,75,.08));border:1px solid rgba(50,215,75,.4);overflow:hidden;touch-action:none}'+
    '.bb2 .sl.dis{filter:grayscale(1);opacity:.5}.bb2 .sl span{position:absolute;inset:0;display:grid;place-items:center;font:800 14px var(--font,system-ui);color:#bff5cb;pointer-events:none;padding-left:40px}'+
    '.bb2 .sl button{position:absolute;left:4px;top:3px;width:50px;height:50px;border-radius:50%;border:0;background:linear-gradient(180deg,#5df27a,#28b84a);box-shadow:0 0 18px rgba(50,215,75,.6);display:grid;place-items:center;color:#05150a;touch-action:none}'+
    '.bb2 .sl button svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'+
    '.bb2 .stop{display:block;width:100%;margin-top:8px;height:40px;border:0;border-radius:14px;background:rgba(255,69,58,.14);color:#ff8a80;font:700 13px var(--font,system-ui)}';
    document.head.appendChild(st) }
  var AVC=['#ffb340','#64d2ff','#bf8bff','#32d74b','#ff6a5f','#40e0c8'];
  function ini(n){ return String(n||'?').split(/\s+/).map(function(w){ return w[0]||'' }).join('').slice(0,2).toUpperCase() }
  function openSet(){ bbCss(); var F=window.__frApi&&window.__frApi.list?window.__frApi.list():[], sel=C&&C.ids?C.ids.slice():F.slice(0,3).map(function(f){ return f.id }), pick=C?C.due:Date.now()+4*3600000;
    var nine=new Date(); nine.setHours(21,0,0,0); if(nine.getTime()<Date.now()+3600000){ nine.setDate(nine.getDate()+1); nine.setHours(9) }
    var opts=[[2*3600000,'+2 h'],[4*3600000,'+4 h'],[nine.getTime()-Date.now(),nine.getHours()===21?'Tonight 9 PM':'Tomorrow 9 AM']];
    var CLK='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4.5l3 1.8M9.5 2.5h5"/></svg>';
    var o=sheet('<div class="hd"><h3>Back by</h3><button type="button" data-x="no" aria-label="Close">✕</button></div>'+
      '<svg class="dial" viewBox="0 0 328 250" role="slider" aria-label="Back by time" tabindex="0"></svg><div class="dh">Drag the dot to set your time</div>'+
      '<div class="tc">'+opts.map(function(x,i){ return '<button type="button" data-t="'+Math.round(x[0])+'"'+(i===2?' class="w"':'')+'>'+x[1]+'</button>' }).join('')+'<label>Pick…<input type="datetime-local" aria-label="Pick a time"></label></div>'+
      (F.length?'<div class="card"><span class="k">Tell</span><span class="avs" style="display:flex;gap:6px"></span><span class="nm"></span><button type="button" data-x="chg">Change</button></div>'+
        '<div class="frs" hidden>'+F.map(function(f){ return '<label class="fr"><input type="checkbox" value="'+esc(f.id)+'"'+(sel.indexOf(f.id)>=0?' checked':'')+'><b>'+esc(f.n)+'</b><small>#'+esc(f.t)+'</small></label>' }).join('')+'</div>'
        :'<div class="card">Add a friend first (Friends ▸ Add friend or Invite). Alerts go to friends on AwareBC.</div>')+
      '<input class="note" maxlength="140" placeholder="Trip note: where, rigs, people" value="'+esc(C&&C.note||'')+'" aria-label="Trip note">'+
      '<div class="ft">Miss it and they get your last spot, even if your phone dies.</div>'+
      '<div class="sl'+(F.length?'':' dis')+'"><span>'+(C?'Slide to update':'Slide to start timer')+'  ›››</span><button type="button" data-x="go" aria-label="'+(C?'Update timer':'Start timer')+'">'+CLK+'</button></div>'+
      (C?'<button type="button" class="stop" data-x="stop">Stop timer</button>':''));
    o.querySelector('.ossh').classList.add('bb2');
    var D=o.querySelector('.dial'), cx=164, cy=124, R=94;
    function ang(t){ var d=new Date(t), h=d.getHours()%12+d.getMinutes()/60; return h/12*2*Math.PI-Math.PI/2 }
    function pt(a,r){ return [cx+Math.cos(a)*r,cy+Math.sin(a)*r] }
    function draw(){ var a0=ang(Date.now()), a1=ang(pick), p0=pt(a0,R), p1=pt(a1,R), span=(pick-Date.now())/3600000, large=((a1-a0+4*Math.PI)%(2*Math.PI))>Math.PI?1:0, full=span>=12, t='';
      for(var i=0;i<60;i++){ var q=i/60*2*Math.PI-Math.PI/2, big=i%5===0, a=pt(q,R+16), b=pt(q,R+(big?24:20)); t+='<line x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+b[0].toFixed(1)+'" y2="'+b[1].toFixed(1)+'" stroke="rgba(255,255,255,'+(big?.45:.15)+')" stroke-width="'+(big?2:1)+'" stroke-linecap="round"/>' }
      [12,3,6,9].forEach(function(n){ var p=pt(n/12*2*Math.PI-Math.PI/2,R-24); t+='<text x="'+p[0].toFixed(1)+'" y="'+(p[1]+4).toFixed(1)+'" text-anchor="middle" font-weight="700" font-size="11" fill="rgba(255,255,255,.35)">'+n+'</text>' });
      var arc=full?'<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'"':'<path d="M'+p0[0].toFixed(1)+' '+p0[1].toFixed(1)+' A'+R+' '+R+' 0 '+large+' 1 '+p1[0].toFixed(1)+' '+p1[1].toFixed(1)+'"';
      var lbl=new Date(pick).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}), m=lbl.match(/^(.*?)\s*([AP]\.?M\.?)$/i), hm=m?m[1]:lbl, ap=m?m[2]+' · ':'', inT=span<1?Math.round(span*60)+' min':(Math.round(span*10)/10).toString().replace(/\.0$/,'')+' h';
      var day=new Date(pick).toDateString()!==new Date().toDateString()?(new Date(pick).getDate()-new Date().getDate()===1||span<36?'tomorrow · ':''):'';
      D.innerHTML='<defs><linearGradient id="bbag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#ff7a1a"/></linearGradient>'+(window.__awLow?'':'<filter id="bbgw" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>')+'<radialGradient id="bbfc"><stop offset="0" stop-color="#1a1610"/><stop offset="1" stop-color="#0d0f12"/></radialGradient></defs>'+
        '<circle cx="'+cx+'" cy="'+cy+'" r="'+(R+8)+'" fill="url(#bbfc)" stroke="rgba(255,255,255,.06)"/>'+t+'<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="14"/>'+
        (window.__awLow?'':arc+' fill="none" stroke="url(#bbag)" stroke-width="14" stroke-linecap="round" filter="url(#bbgw)" opacity=".75"/>')+arc+' fill="none" stroke="url(#bbag)" stroke-width="14" stroke-linecap="round"/>'+
        '<circle cx="'+p0[0].toFixed(1)+'" cy="'+p0[1].toFixed(1)+'" r="6" fill="#0b0e12" stroke="#ffd27a" stroke-width="3"/><circle cx="'+p1[0].toFixed(1)+'" cy="'+p1[1].toFixed(1)+'" r="15" fill="#fff" style="filter:drop-shadow(0 0 10px rgba(255,179,64,.9))"/><circle cx="'+p1[0].toFixed(1)+'" cy="'+p1[1].toFixed(1)+'" r="6" fill="#ff8a1a"/>'+
        '<text x="'+cx+'" y="'+(cy-20)+'" text-anchor="middle" font-weight="600" font-size="11.5" fill="#c9b48f">Back by</text><text x="'+cx+'" y="'+(cy+12)+'" text-anchor="middle" font-weight="800" font-size="34" fill="#fff">'+esc(hm)+'</text>'+
        '<text x="'+cx+'" y="'+(cy+32)+'" text-anchor="middle" font-weight="700" font-size="12" fill="#ffb340">'+esc(ap+day)+'in '+inT+'</text>';
      D.setAttribute('aria-valuetext','Back by '+clock(pick)+', in '+inT) }
    function show(){ draw(); [].forEach.call(o.querySelectorAll('[data-t]'),function(b){ b.classList.toggle('on',Math.abs(Date.now()+ +b.getAttribute('data-t')-pick)<90000) }); friends() }
    function friends(){ var av=o.querySelector('.avs'); if(!av) return; var ch=[].filter.call(o.querySelectorAll('.fr input'),function(i){ return i.checked }).map(function(i){ return i.value }), fs=F.filter(function(f){ return ch.indexOf(f.id)>=0 });
      av.innerHTML=fs.slice(0,2).map(function(f,i){ return '<span class="av" style="background:linear-gradient(145deg,'+AVC[i%6]+',color-mix(in srgb,'+AVC[i%6]+' 65%,#000))">'+esc(ini(f.n))+'</span>' }).join('');
      o.querySelector('.nm').textContent=fs.length?fs.map(function(f){ return f.n }).slice(0,2).join(' and ')+(fs.length>2?' +'+(fs.length-2):''):'No one picked yet' }
    // drag the dot: the time follows your finger around the clock (5-minute steps, from 15 minutes up to 12 hours ahead)
    function fromXY(e){ var r=D.getBoundingClientRect(), x=(e.clientX-r.left)/r.width*328-cx, y=(e.clientY-r.top)/r.height*250-cy, a=Math.atan2(y,x)+Math.PI/2; if(a<0) a+=2*Math.PI;
      var now=new Date(), nh=now.getHours()%12+now.getMinutes()/60, th=a/(2*Math.PI)*12, d=(th-nh+12)%12; if(d<.25) d+=12; var t=Date.now()+d*3600000; t=Math.round(t/300000)*300000; pick=Math.max(Date.now()+900000,t); show() }
    var drag=false; D.addEventListener('pointerdown',function(e){ drag=true; try{ D.setPointerCapture(e.pointerId) }catch(x){} fromXY(e) }); D.addEventListener('pointermove',function(e){ if(drag) fromXY(e) }); D.addEventListener('pointerup',function(){ drag=false }); D.addEventListener('pointercancel',function(){ drag=false });
    D.addEventListener('keydown',function(e){ var k=e.key; if(k==='ArrowRight'||k==='ArrowUp'){ pick=Math.min(Date.now()+72*3600000,pick+900000); show(); e.preventDefault() } if(k==='ArrowLeft'||k==='ArrowDown'){ pick=Math.max(Date.now()+900000,pick-900000); show(); e.preventDefault() } });
    show();
    o.querySelector('input[type=datetime-local]').onchange=function(e){ var t=new Date(e.target.value).getTime(); if(t>Date.now()+600000&&t<Date.now()+72*3600000){ pick=t; show() } else toast('Pick a time between 10 minutes and 3 days from now.') };
    [].forEach.call(o.querySelectorAll('.fr input'),function(i){ i.onchange=friends });
    function go(t){ var ids=[].map.call(o.querySelectorAll('.fr input:checked'),function(i){ return i.value }); if(!F.length) return toast('Add a friend first, so someone can be told.'); if(!ids.length) return toast('Pick at least one friend to tell.');
      if(navigator.onLine===false) return toast('Start it while you still have signal, so the server can keep the timer.');
      var m=me(), note=o.querySelector('.note').value.trim(), lab=o.querySelector('.sl span'); t.disabled=true; lab.textContent='Starting…';
      post('chk',{op:'set',due:pick,ids:ids,note:note,lat:m&&m.lat,lon:m&&m.lon}).then(function(j){ C={id:j.id,due:j.due,ids:ids,note:note,n:ids.length}; saveC(); o.remove(); toast('Back by '+clock(C.due)+'. Have a good trip.'); setTimeout(function(){ if(window.__pushAsk) window.__pushAsk('So you’ll know right away if a friend you’re watching is overdue.') },3500) },function(e){ t.disabled=false; lab.textContent=(C?'Slide to update':'Slide to start timer')+'  ›››'; knob.style.transform=''; toast(e.message) }) }
    // slide to start: a tap alone won't start it, so a bump in the rig can't set it off
    var sl=o.querySelector('.sl'), knob=sl.querySelector('button'), sx=0, moved=0, sliding=false;
    knob.addEventListener('pointerdown',function(e){ sliding=true; sx=e.clientX; moved=0; try{ knob.setPointerCapture(e.pointerId) }catch(x){} knob.style.transition='none' });
    knob.addEventListener('pointermove',function(e){ if(!sliding) return; var max=sl.clientWidth-58; moved=Math.max(0,Math.min(max,e.clientX-sx)); knob.style.transform='translateX('+moved+'px)' });
    function end(){ if(!sliding) return; sliding=false; var max=sl.clientWidth-58; knob.style.transition='transform .25s'; if(moved>=max*.85){ knob.style.transform='translateX('+max+'px)'; go(knob) } else { knob.style.transform=''; if(moved<6) toast('Slide the button to the right to '+(C?'update':'start')+'.') } }
    knob.addEventListener('pointerup',end); knob.addEventListener('pointercancel',end);
    knob.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(knob) } });
    knob.addEventListener('click',function(e){ e.stopPropagation() });
    o.onclick=function(e){ var t=e.target.closest&&e.target.closest('[data-t],[data-x]'); if(!t) return;
      if(t.hasAttribute('data-t')){ pick=Date.now()+ +t.getAttribute('data-t'); show(); return }
      var x=t.getAttribute('data-x'); if(x==='no') return o.remove();
      if(x==='chg'){ var fs=o.querySelector('.frs'); fs.hidden=!fs.hidden; t.textContent=fs.hidden?'Change':'Done'; return }
      if(x==='stop') return act({op:'done'},function(){ C=null; saveC(); o.remove(); toast('Back-by timer stopped.') }) } }

  // server is the source of truth; overdue alerts for me arrive with each Friends sync (any mode)
  var ack=lj('aw-odack',{});
  window.__onSync=function(j){ if(j.chk){ if(!C||C.id!==j.chk.id||C.due!==j.chk.due){ C={id:j.chk.id,due:j.chk.due,ids:j.chk.ids,note:j.chk.note,n:j.chk.ids.length,warned:C&&C.warned}; saveC() } } else if(C&&!Q.length){ C=null; saveC() }
    (j.od||[]).forEach(function(c){ if(ack[c.id]) return; ack[c.id]=Date.now(); sj('aw-odack',ack); overdue(c) }) };
  function overdue(c){ buzz(); if(window.__native&&window.__native.notify) window.__native.notify('AwareBC','⚠️ '+c.n+' hasn’t checked in (due '+clock(c.due)+')');
    var o=sheet('<div class="od"><div class="k">⚠️ OVERDUE CHECK-IN</div><h3>'+esc(c.n)+' hasn’t checked in</h3><div class="sub">Was due back '+clock(c.due)+'</div>'+
      (c.lat!=null?'<div class="it"><span>📍</span><div><b>Last spot '+(c.at?clock(c.at):'')+'</b><small>'+(+c.lat).toFixed(4)+', '+(+c.lon).toFixed(4)+'</small></div></div>':'<div class="it"><span>📍</span><div><b>No spot shared yet</b></div></div>')+
      (c.note?'<div class="it"><span>📝</span><div><b>Trip note</b><small>'+esc(c.note)+'</small></div></div>':'')+
      '<div class="row">'+(c.lat!=null?'<button type="button" class="s" data-o="go">🧭 Directions</button>':'')+'<button type="button" class="s" data-o="msg">💬 Message</button></div><a class="p911" href="tel:911">📞 Call 911 / RCMP</a><div class="sub" style="text-align:center">Try to reach '+esc(c.n)+' first. Call 911 if you can’t.</div><button type="button" class="s seen" data-o="x">Close</button></div>');
    o.querySelector('.ossh').classList.add('red');
    o.onclick=function(e){ var b=e.target.closest&&e.target.closest('[data-o]'); if(e.target===o){ o.remove(); return } if(!b) return; var a=b.getAttribute('data-o'); o.remove();
      if(a==='go'&&window.__nav) window.__nav.to(L.latLng(c.lat,c.lon),c.n+'’s last spot');
      if(a==='msg'&&window.__frApi) window.__frApi.chatTag(c.t,'Are you OK? You were due back at '+clock(c.due)+'.') } }

  // ================= 2) RESOURCE ROAD RADIO =================
  var RC=lj('aw-rrc',{}), card=document.createElement('div'); card.id='rrcard'; card.hidden=true; card.setAttribute('role','status'); document.body.appendChild(card);
  var cur=null, dir=ls('aw-rrdir')||'UP', hideFor=lj('aw-rrhide',{}), asked={};
  var VEH=['Pick-up','Car','Side-by-side','Quad','Motorbike','Truck & trailer','RV'];
  function veh(){ return ls('aw-rrveh')||'Pick-up' }
  function short(n){ var w=String(n||'').replace(/\s+(FSR|Forest Service Road|Road|Rd)$/i,'').split(/\s+/), t=w.slice(0,2).join(' '); return t.length>12?w[0]:t }
  function getCh(f){ var c=RC[f]; if(asked[f]||navigator.onLine===false) return; asked[f]=1;
    post('rl',{op:'rrget',fids:[f]}).then(function(j){ var x=j.c&&j.c[f]; RC[f]=x?{ch:x.ch,n:x.n,mine:x.mine,t:Date.now()}:{ch:'',t:Date.now()}; sj('aw-rrc',RC); drawCard() }).catch(function(){ asked[f]=0 }) }
  function radio(){ var on=offRoad()&&!document.body.classList.contains('menuon')&&!document.body.classList.contains('toolon')&&!document.body.classList.contains('fsrp'), m=on&&me(), n=m&&window.__fsrNear?window.__fsrNear(m.lat,m.lon,40):null;
    if(n&&hideFor[n.file]&&Date.now()-hideFor[n.file]<2*3600000) n=null;
    cur=n; if(n&&!RC[n.file]) getCh(n.file); drawCard() }
  function drawCard(){ if(!cur){ card.hidden=true; ban.classList.remove('mini'); return } var c=RC[cur.file]||{}, ch=c.ch||'';
    card.hidden=false; ban.classList.toggle('mini',!ban.hidden&&!ban.classList.contains('open')); card.style.top=(ban.hidden?100:(ban.offsetHeight+106))+'px';
    card.innerHTML='<div class="t"><div class="ch'+(ch?'':' none')+'"><small>'+(ch?esc(ch.split(' ')[0]):'CH')+'</small>'+(ch?esc(ch.split(' ').slice(1).join(' ')||ch):'?')+'</div><div class="nm"><b>'+esc(cur.name)+'</b><small>'+(ch?'Tap for how to call':'Tap to add the channel from the sign')+'</small></div><button type="button" class="x" data-r="x" aria-label="Hide for this road">✕</button></div>'+
      '<div class="say"><span>🗣️</span><div><small>Call at each km sign:</small><b>"'+esc(veh())+' <u data-r="dir">'+dir+'</u> [km], '+esc(short(cur.name))+'"</b></div></div>' }
  card.onclick=function(e){ var b=e.target.closest&&e.target.closest('[data-r]'); var a=b&&b.getAttribute('data-r');
    if(a==='x'){ hideFor[cur.file]=Date.now(); sj('aw-rrhide',hideFor); cur=null; drawCard(); return }
    if(a==='dir'){ dir=dir==='UP'?'DOWN':'UP'; ls('aw-rrdir',dir); drawCard(); return }
    how() };
  // official district channel maps (Gov of BC). Planning maps only: the road sign always wins.
  var DM=[['Selkirk','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/dse_road_channel_map_feb_2017.pdf'],['Rocky Mountain','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/drm_rr_channels.pdf'],['Okanagan Shuswap','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/ok_resource_road_channest_no_freq.pdf'],['Thompson Rivers','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/thompson_rivers_resource_road_channels_2017.pdf'],['Quesnel','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/quesnel_road_channel_map_june2017.pdf'],['Cascades','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/merrittradiopolysfinal.pdf'],['100 Mile','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/dmh_res_rd_channels_175.pdf'],['Cariboo','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/central_caribou_2014_frequency_road_map_rv7.pdf'],['Mackenzie','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/dmk_road_frequency_south.pdf'],['Prince George','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/pg_district_radio_frequency_map_georeferenced_low_resolution.pdf'],['Stuart Nechako','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/dva_radio_freq_map.pdf'],['Nadina','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/nadinachannelmap.pdf'],['Coast Mountains','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/coastmtnchannelmap.pdf'],['Skeena Stikine','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/dbu_dki_channel_map.pdf'],['Peace','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/southpeace_radiofrequency_may26_2014.pdf'],['Fort Nelson','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/fn_northpeace_radiofrequency_may_12_2014_final.pdf'],['Chilliwack','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/dck_resource_roads_radio_channels_map_-_january2018.pdf'],['Campbell River','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/coastradiofrequencynov23-2015_v10_8.pdf'],['Sunshine Coast','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/coastradiofrequencynov23-2015_v10_8.pdf'],['South Island','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/coastradiofrequencynov23-2015_v10_8.pdf'],['Haida Gwaii','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/haidagwaiieffectivenov19-2018.pdf'],['North Island','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/channel-maps/northislandjuly11-2014.pdf'],['Sea to Sky','https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/natural-resource-use/resource-roads/local-road-safety-information/sea-to-sky/seatosky_road_channels_jul02_2025.pdf']], DC=lj('aw-rrdist',{});
  function district(lat,lon){ var k=lat.toFixed(1)+','+lon.toFixed(1); if(DC[k]!==undefined) return Promise.resolve(DC[k]); if(navigator.onLine===false) return Promise.resolve(null);
    var f="BBOX(SHAPE,"+(lon-.001).toFixed(4)+','+(lat-.001).toFixed(4)+','+(lon+.001).toFixed(4)+','+(lat+.001).toFixed(4)+",'EPSG:4326')";
    return fetch('https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG&outputFormat=json&count=1&propertyName=DISTRICT_NAME&CQL_FILTER='+encodeURIComponent(f))
      .then(function(r){ return r.json() }).then(function(j){ var n=j.features&&j.features[0]&&j.features[0].properties.DISTRICT_NAME||''; DC[k]=n; sj('aw-rrdist',DC); return n }).catch(function(){ return null }) }
  function distMap(n){ n=String(n||''); for(var i=0;i<DM.length;i++) if(n.toLowerCase().indexOf(DM[i][0].toLowerCase())>=0) return DM[i]; return null }
  function how(){ if(!cur) return; var c=RC[cur.file]||{}, road=cur;
    var o=sheet('<h3>📻 Radio on this road</h3><div class="it"><div class="ch'+(c.ch?'':' none')+'"><small>'+(c.ch?esc(c.ch.split(' ')[0]):'CH')+'</small>'+(c.ch?esc(c.ch.split(' ').slice(1).join(' ')||c.ch):'?')+'</div><div><b>'+esc(road.name)+'</b><small>'+(c.ch?'Shared by '+(c.n||1)+' rider'+((c.n||1)===1?'':'s')+' from the road sign':'No channel yet. Add it from the sign at the start of the road.')+'</small></div></div>'+
      '<div class="lab">Channel on the sign</div><div class="row in"><input class="rch" maxlength="12" placeholder="e.g. RR 7" value="'+esc(c.mine||'')+'" autocapitalize="characters"><button type="button" class="p" data-h="save">Save</button></div>'+
      '<div class="lab">How to call</div>'+
      '<div class="it"><span>⬆️</span><div><b>UP = km numbers going up</b><small>Heading away from the start of the road</small></div></div>'+
      '<div class="it"><span>⬇️</span><div><b>DOWN = km numbers going down</b><small>Heading back toward km 0</small></div></div>'+
      '<div class="it"><span>🗣️</span><div><b>Say: vehicle · direction · km · road</b><small>"'+esc(veh())+' '+dir+' 18, '+esc(short(road.name))+'" at every km sign and at junctions</small></div></div>'+
      '<div class="it"><span>🚛</span><div><b>Loaded logging trucks have the right of way</b><small>Pull over in a safe spot when you hear one coming</small></div></div>'+
      '<div class="lab">My vehicle</div><div class="oschips">'+VEH.map(function(v){ return '<button type="button" data-v="'+esc(v)+'"'+(v===veh()?' class="on"':'')+'>'+esc(v)+'</button>' }).join('')+'</div>'+
      '<div class="dmap"></div><div class="sub" style="margin-top:10px">You need a two-way radio and a radio licence to talk on resource road channels. The sign on the road always wins over this app.</div>');
    var mm=me(); if(mm) district(mm.lat,mm.lon).then(function(n){ var d=distMap(n), box=o.querySelector('.dmap'); if(!d||!box) return; box.innerHTML='<a class="dml" href="'+d[1]+'" target="_blank" rel="noopener">📄 Official channel map · '+esc(n.replace(/ Natural Resource District/i,''))+' District</a><div class="sub">Gov of BC planning map. Use it to check the sign, not instead of it.</div>' });
    o.onclick=function(e){ var b=e.target.closest&&e.target.closest('[data-h],[data-v]'); if(e.target===o){ o.remove(); return } if(!b) return;
      if(b.hasAttribute('data-v')){ ls('aw-rrveh',b.getAttribute('data-v')); [].forEach.call(o.querySelectorAll('[data-v]'),function(x){ x.classList.toggle('on',x===b) }); drawCard(); return }
      var v=o.querySelector('.rch').value.trim().toUpperCase(); if(!/^[A-Z]{1,5}[ -]?\d{1,3}[A-Z]?$/.test(v)) return toast('Type the channel as it is on the sign, like RR 7.');
      if(navigator.onLine===false) return toast('No signal. Save it when you’re back in service.');
      b.disabled=true; post('rl',{op:'rrset',fid:road.file,ch:v,nm:road.name}).then(function(){ asked[road.file]=0; delete RC[road.file]; getCh(road.file); toast('Thanks! Channel saved for '+road.name+'.'); o.remove() },function(err){ b.disabled=false; toast(err.message) }) } }
  setInterval(radio,10000); setTimeout(radio,4000); MAP.on('moveend',function(){ setTimeout(radio,300) });
  new MutationObserver(function(){ paint(); radio() }).observe(document.body,{attributes:true,attributeFilter:['class']});

  var st=document.createElement('style'); st.textContent=
    '#bbbtn{display:none;position:absolute;z-index:1000;right:14px;top:382px;width:40px;height:40px}body.fsron #bbbtn{display:grid}#bbbtn span{font-size:18px}#bbbtn.on{box-shadow:var(--shadow),inset 0 0 0 2px #30d158}#bbbtn::after{content:"Back by";position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:1px;font:700 9.5px/12px var(--font);color:#fff;text-shadow:0 0 3px #000,0 0 3px #000;white-space:nowrap}'+
    '#bbban.mini .bt,#bbban.mini small{display:none}#bbban.mini{padding:7px 11px;cursor:pointer}body.menuon #bbbtn,body.toolon #bbbtn,body.fsrp #bbbtn,body.menuon #bbban,body.toolon #bbban,body.fsrp #bbban{visibility:hidden}'+
    '#bbban{position:fixed;z-index:1100;left:12px;right:64px;top:100px;background:rgba(18,20,24,.96);border:1.5px solid #30d158;border-radius:16px;padding:9px 11px;color:#fff;font-family:var(--font,system-ui);box-shadow:0 6px 18px rgba(0,0,0,.5)}#bbban[hidden]{display:none}#bbban.late{border-color:#ff3b30;background:rgba(42,18,18,.97)}'+
    '#bbban .t{display:flex;align-items:center;gap:8px}#bbban .t>span{font-size:18px}#bbban b{display:block;font-size:14px}#bbban small{display:block;color:#aeb4bd;font-size:11.5px;line-height:1.3}#bbban em{margin-left:auto;font:800 15px var(--font,system-ui);font-style:normal;color:#30d158}#bbban.late em{color:#ff6b5e}'+
    '#bbban .bt{display:flex;gap:6px;margin-top:7px}#bbban .bt button{flex:1;border:0;border-radius:12px;padding:8px 4px;font:700 12.5px var(--font,system-ui);background:#2c2c2e;color:#fff}#bbban .bt .g{background:#30d158;color:#000}'+
    '#rrcard{position:fixed;z-index:1090;left:12px;right:64px;top:100px;background:rgba(18,20,24,.96);border-radius:16px;padding:9px 11px;color:#fff;font-family:var(--font,system-ui);box-shadow:0 6px 18px rgba(0,0,0,.5);cursor:pointer}#rrcard[hidden]{display:none}'+
    '#rrcard .t,.ossh .it{display:flex;align-items:center;gap:10px}.ch{flex:none;background:#facc15;color:#000;border-radius:10px;padding:5px 8px;font:900 18px/1 var(--font,system-ui);text-align:center;min-width:38px}.ch small{display:block;font:800 9px var(--font,system-ui);letter-spacing:.06em}.ch.none{background:#3a3f47;color:#fff}'+
    '#rrcard .nm{min-width:0;flex:1}#rrcard .nm b{display:block;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#rrcard .nm small{color:#aeb4bd;font-size:11.5px}#rrcard .x{flex:none;border:0;background:#2c2c2e;color:#fff;width:28px;height:28px;border-radius:50%;font-size:13px}'+
    '#rrcard .say{margin-top:7px;background:#0f1317;border-radius:12px;padding:7px 10px;display:flex;align-items:center;gap:8px}#rrcard .say small{display:block;color:#9aa4b2;font-size:11px}#rrcard .say b{font:800 14px var(--font,system-ui)}#rrcard .say u{text-decoration:none;background:#2563eb;border-radius:6px;padding:0 5px}'+
    '.osbg{position:fixed;inset:0;z-index:6200;background:rgba(0,0,0,.55);display:flex;align-items:flex-end}.ossh{width:100%;max-height:90%;overflow-y:auto;background:#1c1c1e;color:#fff;border-radius:22px 22px 0 0;padding:12px 16px calc(env(safe-area-inset-bottom,0px) + 18px);box-sizing:border-box;font-family:var(--font,system-ui)}'+
    '.ossh .grab{width:40px;height:5px;border-radius:3px;background:#48484a;margin:0 auto 10px}.ossh h3{margin:0;font:800 18px var(--font,system-ui)}.ossh .sub{color:#9aa4b2;font-size:12.5px;margin-top:3px;line-height:1.4}'+
    '.ossh .lab{font:800 10.5px var(--font,system-ui);letter-spacing:.08em;color:#8b95a3;text-transform:uppercase;margin:12px 0 6px}.ossh .oschips{display:flex;gap:6px;flex-wrap:wrap}.ossh .oschips button,.ossh .pk{border:0;background:#2c2c2e;color:#fff;border-radius:16px;padding:8px 12px;font:700 13px var(--font,system-ui);position:relative}.ossh .oschips .on{background:#ff3b30}'+
    '.ossh .pk input{position:absolute;inset:0;opacity:0;width:100%}.ossh .fr{display:flex;align-items:center;gap:10px;background:#15191e;border-radius:12px;padding:9px 11px;margin-bottom:6px}.ossh .fr input{width:20px;height:20px;accent-color:#30d158}.ossh .fr small{margin-left:auto;color:#9aa4b2}'+
    '.ossh .note,.ossh .rch{width:100%;height:44px;border-radius:12px;background:#0f1317;border:1px solid #2b333d;padding:0 12px;color:#fff;font:15px var(--font,system-ui);box-sizing:border-box}'+
    '.ossh .row{display:flex;gap:8px;margin-top:12px}.ossh .row.in{margin-top:0}.ossh .row button{flex:1;height:46px;border-radius:23px;font:800 15px var(--font,system-ui)}.ossh .p{border:0;background:#30d158;color:#000}.ossh .s{background:#2c2c2e;border:0;color:#fff}.ossh .p[disabled]{opacity:.5}.ossh .row.in .p{flex:none;width:90px;background:#ff3b30;color:#fff}'+
    '.ossh .it{background:#15191e;border-radius:12px;padding:9px 11px;margin-top:6px}.ossh .it>span{font-size:18px}.ossh .it b{display:block;font-size:13.5px}.ossh .it small{color:#9aa4b2;font-size:12px}'+
    '.ossh.red{background:#2a1212;border-top:2px solid #ff3b30}.ossh .od .k{font:900 12px var(--font,system-ui);letter-spacing:.08em;color:#ff6b5e;margin-bottom:6px}.ossh.red .it{background:#1c0c0c}.ossh .p911{display:block;text-align:center;margin-top:8px;background:#ff3b30;color:#fff;border-radius:23px;padding:13px;font:800 15px var(--font,system-ui);text-decoration:none}.ossh .dml{display:block;margin-top:12px;background:#15191e;border-radius:12px;padding:11px;color:#8ab4f8;font:700 13.5px var(--font,system-ui);text-decoration:none}.ossh .seen{width:100%;height:42px;border-radius:21px;margin-top:10px;font:700 14px var(--font,system-ui)}';
  document.head.appendChild(st);
  paint(); flush();
})();
