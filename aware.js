// AwareBC "Aware" co-pilot (by Josh Singer): tap the mic, say what you need ("gas station", "hospital", "restaurant"),
// and Aware finds the nearest one, says it out loud and can guide you there. Off-road only. Gas and hospitals also come
// from the saved map squares, so they work with no signal. Listens only when you tap: never in the background.
(function(){
  if(!window.__AW) return;
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition, rec=null, on=false, R=[], ri=0, lastQ='';
  var BADGE='<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#1a1d22" stroke="#ff453a" stroke-width="2.5"/><g fill="none" stroke="#ff453a" stroke-width="1.4" opacity=".55"><circle cx="32" cy="32" r="21"/><circle cx="32" cy="32" r="12"/><path d="M32 4v56M4 32h56"/></g><path d="M32 32 L52 17" stroke="#ff453a" stroke-width="2.4"/><rect x="27" y="20" width="10" height="17" rx="5" fill="#fff"/><path d="M23 31a9 9 0 0 0 18 0M32 40v5M27 45h10" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>';
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] }) }
  function hav(a,b,c,d){ var r=Math.PI/180, x=Math.sin((c-a)*r/2), y=Math.sin((d-b)*r/2), h=x*x+Math.cos(a*r)*Math.cos(c*r)*y*y; return 12742*Math.asin(Math.min(1,Math.sqrt(h))) }
  function dir(a,b,c,d){ var r=Math.PI/180, y=Math.sin((d-b)*r)*Math.cos(c*r), x=Math.cos(a*r)*Math.sin(c*r)-Math.sin(a*r)*Math.cos(c*r)*Math.cos((d-b)*r), g=(Math.atan2(y,x)/r+360)%360;
    return ['north','north-east','east','south-east','south','south-west','west','north-west'][Math.round(g/45)%8] }
  function me(){ var m=__AW.me&&__AW.me(); return m&&isFinite(m.lat)?m:null }

  var st=document.createElement('style'); st.textContent=
    '#awbtn{position:absolute;left:max(12px,env(safe-area-inset-left,0px));bottom:32px;z-index:690;height:44px;padding:0 16px 0 5px;border-radius:22px;border:0;background:var(--bg,#111418);color:var(--fg,#fff);display:none;align-items:center;gap:8px;font:700 14px/1.1 var(--font,system-ui);box-shadow:var(--shadow,0 6px 18px rgba(0,0,0,.55));text-align:left}'+
    'body.fsron #awbtn{display:flex}body.menuon #awbtn,body.toolon #awbtn,body.fsrp #awbtn,body.navon #awbtn,body.srchon #awbtn,body.keyon #awbtn,body.trcard #awbtn,body.awon #awbtn{display:none}'+
    '#awbtn svg{width:36px;height:36px;flex:none}#awbtn small{display:block;font:600 10.5px var(--font,system-ui);color:#9aa4b2;margin-top:2px}'+
    'body.fsron #fsrleg{bottom:116px}'+ // trail colours sit next to My spot so the Aware button has the corner
    '.aws{position:fixed;left:0;right:0;bottom:0;z-index:5300;background:#15181d;color:#fff;border-radius:22px 22px 0 0;padding:12px 16px calc(env(safe-area-inset-bottom,0px) + 16px);font-family:var(--font,system-ui);box-shadow:0 -12px 30px rgba(0,0,0,.6);max-height:78vh;overflow-y:auto;box-sizing:border-box}'+
    '.aws .g{width:40px;height:5px;border-radius:3px;background:#3a3f47;margin:0 auto 10px}'+
    '.aws .h{display:flex;align-items:center;gap:10px}.aws .h svg{width:40px;height:40px;flex:none}.aws .h b{font-size:16px}.aws .h small{display:block;color:#9aa4b2;font-size:11.5px;font-weight:700;margin-top:1px}.aws .h small.l{color:#30d158}'+
    '.aws .x{margin-left:auto;width:36px;height:36px;border-radius:50%;background:#2c2c2e;border:0;color:#fff;font-size:16px;flex:none}'+
    '.aws .you{text-align:right;margin:10px 0 8px;min-height:4px}.aws .you span{display:inline-block;background:#2c2c2e;border-radius:16px 16px 4px 16px;padding:8px 12px;font-size:14px;max-width:85%;text-align:left}'+
    '.aws .ans{background:#1f242b;border-radius:16px 16px 16px 4px;padding:10px 12px;font-size:14px;line-height:1.4}.aws .ans b{color:#ff9f0a}.aws .ans small{display:block;color:#9aa4b2;font-size:12px;margin-top:3px}'+
    '.aws .ans .r{display:flex;gap:8px;margin-top:9px}.aws .ans .r button{flex:1;height:38px;border-radius:19px;border:0;font:700 13.5px var(--font,system-ui);background:#2c2c2e;color:#fff}.aws .ans .r .p{background:#ff3b30}'+
    '.aws .ans:empty{display:none}.aws .try{color:#9aa4b2;font:700 11.5px var(--font,system-ui);margin-top:12px;letter-spacing:.3px}'+
    '.aws .ex{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.aws .ex button{background:#22272e;border:1px solid #333a43;border-radius:16px;padding:7px 11px;font:600 13px var(--font,system-ui);color:#fff}'+
    '.aws .mic{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:18px}.aws .mic>button{width:66px;height:66px;border-radius:50%;border:0;padding:0;background:linear-gradient(135deg,#ff453a,#ff9f0a);box-shadow:0 0 0 8px rgba(255,159,10,.18),0 0 0 16px rgba(255,159,10,.08);display:grid;place-items:center}'+
    '.aws .mic>button svg{width:30px;height:30px}.aws .wv{display:flex;gap:3px;align-items:center;height:30px;opacity:.25}.aws .wv span{width:4px;border-radius:2px;background:#ff9f0a;height:8px}'+
    '.aws.lis .wv{opacity:1}.aws.lis .wv span{animation:awwv .9s ease-in-out infinite}.aws.lis .mic>button{background:#30d158;box-shadow:0 0 0 8px rgba(48,209,88,.2),0 0 0 16px rgba(48,209,88,.08)}'+
    '@keyframes awwv{0%,100%{height:6px}50%{height:26px}}'+
    '.aws .ft{color:#9aa4b2;font-size:12px;text-align:center;margin-top:14px}.aws .ft b{color:#fff}'+
    '.aws .ty[hidden]{display:none}.aws .ty{display:flex;gap:8px;margin-top:14px}.aws .ty input{flex:1;min-width:0;height:42px;border-radius:21px;border:1px solid #333a43;background:#22272e;color:#fff;padding:0 14px;font:600 14px var(--font,system-ui)}.aws .ty button{height:42px;border-radius:21px;border:0;background:#ff3b30;color:#fff;font:700 14px var(--font,system-ui);padding:0 16px}';
  st.textContent+=
    '.aws.awg{top:auto;max-height:calc(100% - 70px);background:radial-gradient(80% 40% at 50% 0%,rgba(255,69,58,.16),transparent 70%),#0d1015;border-top:1px solid rgba(255,255,255,.08);border-radius:26px 26px 0 0;color:#eef1f5;padding:12px 16px calc(env(safe-area-inset-bottom,0px) + 14px)}'+
    '.awg .g{width:38px;height:4px;background:#3a414a;margin-bottom:8px}.awg .h b{font:800 18px var(--font,system-ui)}.awg .h small{font:500 11.5px var(--font,system-ui)!important;color:#9aa3ad!important}.awg .x{width:32px;height:32px;background:rgba(255,255,255,.08);color:#c2c9d1;font-size:14px}'+
    '.awg .bm{position:relative;display:grid;place-items:center;width:104px;height:104px;margin:16px auto 0;border-radius:50%;border:0;padding:0;background:radial-gradient(circle,#ff6a5f,#d0281d 70%);box-shadow:0 0 0 10px rgba(255,69,58,.14),0 0 0 22px rgba(255,69,58,.07),0 0 50px rgba(255,69,58,.5),inset 0 2px 0 rgba(255,255,255,.35);transition:transform .15s}'+
    '.awg .bm svg{width:44px;height:44px}.awg.lis .bm{animation:awpl 1.6s ease-in-out infinite}@keyframes awpl{0%,100%{box-shadow:0 0 0 10px rgba(255,69,58,.18),0 0 0 22px rgba(255,69,58,.08),0 0 50px rgba(255,69,58,.5)}50%{box-shadow:0 0 0 14px rgba(255,69,58,.24),0 0 0 30px rgba(255,69,58,.1),0 0 64px rgba(255,69,58,.65)}}'+
    '.awg .lst{text-align:center;margin-top:12px;font:700 14px var(--font,system-ui)}.awg .lst .you{margin:2px 0 0;text-align:center;min-height:16px}.awg .lst .you span{background:none;padding:0;border-radius:0;font:500 12px var(--font,system-ui);color:#9aa3ad;max-width:100%}.awg .lst .you span:before{content:"“"}.awg .lst .you span:after{content:"”"}'+
    '.awg .vg{margin:8px auto 0;width:236px;padding:8px 10px 5px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}.awg .vb{display:flex;justify-content:space-between;align-items:flex-end;height:38px;background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 9.5px)}'+
    '.awg .vb i{width:5px;height:3px;border-radius:3px 3px 1px 1px;background:linear-gradient(0deg,#32d74b,#ffd60a 26px,#ff453a 38px);background-size:5px 38px;background-position:bottom;opacity:.35;transition:height .08s linear}.awg.lis .vb i{opacity:1;box-shadow:0 0 6px rgba(255,106,95,.3)}'+
    '.awg .vl{display:flex;justify-content:space-between;font:600 10.5px var(--font,system-ui);color:#6b737d;margin-top:3px}'+
    '.awg .ans{margin-top:12px;border-radius:16px;padding:11px 12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);font:500 13px/1.4 var(--font,system-ui);color:#d5dbe3}.awg .ans.hit{background:linear-gradient(160deg,rgba(50,215,75,.12),rgba(255,255,255,.03) 60%);border-color:rgba(50,215,75,.28)}'+
    '.awg .ar{display:flex;gap:10px;align-items:center}.awg .ai{width:38px;height:38px;flex:none;border-radius:12px;display:grid;place-items:center;font-size:19px;background:linear-gradient(145deg,#32d74b,#1e9e33);box-shadow:0 4px 12px rgba(50,215,75,.4)}.awg .ar>div{min-width:0}.awg .ar b{display:block;color:#eef1f5;font:800 13.5px var(--font,system-ui);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.awg .ar small{margin:1px 0 0;color:#9aa3ad;font-size:11.5px}'+
    '.awg .ans .r{margin-top:10px}.awg .ans .r button{height:36px;border-radius:11px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:#d5dbe3;font:800 12.5px var(--font,system-ui)}.awg .ans .r .p{background:linear-gradient(180deg,#5ee877,#24b23e);border:0;color:#04140a}'+
    '.awg .try{display:none}.awg .ex{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px}.awg .ex button{height:42px;border-radius:13px;display:flex;align-items:center;justify-content:center;gap:7px;padding:0;font:700 13px var(--font,system-ui);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:#d5dbe3}.awg .ex button i{font-style:normal;font-size:17px}'+
    '.awg .ty{margin-top:14px}.awg .ty input{height:46px;border-radius:15px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);color:#eef1f5;font:500 14px var(--font,system-ui)}.awg .ty button{width:46px;height:46px;padding:0;border-radius:14px;background:rgba(255,69,58,.2);color:#ff6a5f;font:800 16px var(--font,system-ui)}.awg .ft{display:none}';
  document.head.appendChild(st);

  var MIC='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="#fff"/><path d="M6 11a6 6 0 0 0 12 0M12 17v3M9 20h6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  var wv=function(){ var h=''; for(var i=0;i<6;i++) h+='<span style="animation-delay:'+(i*.12)+'s"></span>'; return '<div class="wv">'+h+'</div>' };

  // the button: bottom-left corner of the Off-road map
  var btn=document.createElement('button'); btn.type='button'; btn.id='awbtn'; btn.setAttribute('aria-label','Ask Aware, your hands-free co-pilot');
  btn.innerHTML=BADGE+'<span>Ask Aware<small>Hands-free co-pilot</small></span>';
  (document.getElementById('app')||document.body).appendChild(btn);
  btn.onclick=function(){ open(true) };

  var S=null;
  function open(listen){ if(S) return; document.body.classList.add('awon'); S=document.createElement('div'); S.className='aws'; S.setAttribute('role','dialog'); S.setAttribute('aria-label','Aware co-pilot');
    S.className='aws awg'; var bars=''; for(var i=0;i<30;i++) bars+='<i></i>';
    S.innerHTML='<div class="g"></div><div class="h"><div><b>Aware</b><small>Say what you need. Works with no signal for gas and hospitals.</small></div><button type="button" class="x" aria-label="Close">✕</button></div>'+
      (SR?'<button type="button" class="m bm" aria-label="Tap to talk">'+MIC+'</button><div class="lst"><span class="s">Tap to talk</span><div class="you"></div></div><div class="vg" aria-hidden="true"><div class="vb">'+bars+'</div><div class="vl"><span>Your voice</span><span>Now ▸</span></div></div>':'<div class="lst"><span class="s">Type what you need</span><div class="you"></div></div>')+
      '<div class="ans"></div><div class="ex"><button type="button" data-q="gas station" aria-label="Gas station"><i aria-hidden="true">⛽</i>Gas</button><button type="button" data-q="hospital"><i aria-hidden="true">🏥</i>Hospital</button><button type="button" data-q="restaurant" aria-label="Restaurant"><i aria-hidden="true">🍔</i>Food</button></div>'+
      '<form class="ty"><input type="search" placeholder="Type what you need" enterkeyhint="search" aria-label="What do you need?"><button type="submit" aria-label="Find">➤</button></form>';
    document.body.appendChild(S);
    S.querySelector('.x').onclick=close;
    S.querySelector('.ex').onclick=function(e){ var b=e.target.closest&&e.target.closest('[data-q]'); if(b) ask(b.getAttribute('data-q')) };
    var m=S.querySelector('.m'); if(m) m.onclick=function(){ on?stopL():listenNow() };
    var f=S.querySelector('.ty'); if(f) f.onsubmit=function(e){ e.preventDefault(); var v=f.querySelector('input').value.trim(); if(v) ask(v) };
    if(listen&&SR) listenNow() }
  // ---- volume graph: live mic level while listening (falls back to a gentle wave on phones that can't share the mic) ----
  var VM={sm:null,ac:null,an:null,t:null,lv:[],fake:false}, NOMETER=(function(){ try{ return localStorage.getItem('aw-nometer')==='1' }catch(e){ return false } })();
  function vPaint(){ if(!S) return; var b=S.querySelectorAll('.vb i'); for(var i=0;i<b.length;i++){ var v=VM.lv[VM.lv.length-b.length+i]||0; b[i].style.height=Math.max(3,Math.round(v*38))+'px' } }
  function vPush(v){ VM.lv.push(Math.max(0,Math.min(1,v))); if(VM.lv.length>60) VM.lv.splice(0,VM.lv.length-60); vPaint() }
  function vStart(){ vStop(); VM.lv=[]; var md=navigator.mediaDevices, AC=window.AudioContext||window.webkitAudioContext;
    function fake(){ VM.fake=true; var ph=0; VM.t=setInterval(function(){ ph+=.45; vPush(.18+.22*Math.abs(Math.sin(ph))*(.6+.4*Math.random())) },90) }
    if(NOMETER||window.__awLow||!md||!md.getUserMedia||!AC) return fake();
    md.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}).then(function(sm){ if(!S||!on){ sm.getTracks().forEach(function(t){ t.stop() }); return }
      VM.sm=sm; VM.ac=new AC(); var src=VM.ac.createMediaStreamSource(sm); VM.an=VM.ac.createAnalyser(); VM.an.fftSize=512; src.connect(VM.an); var buf=new Uint8Array(VM.an.fftSize);
      VM.t=setInterval(function(){ VM.an.getByteTimeDomainData(buf); var q=0; for(var i=0;i<buf.length;i++){ var x=(buf[i]-128)/128; q+=x*x } var rms=Math.sqrt(q/buf.length); vPush(Math.pow(Math.min(1,rms*4.2),.7)) },70)
    },function(){ fake() }) }
  function vStop(){ clearInterval(VM.t); VM.t=null; if(VM.sm) try{ VM.sm.getTracks().forEach(function(t){ t.stop() }) }catch(e){} if(VM.ac) try{ VM.ac.close() }catch(e){} VM.sm=VM.ac=VM.an=null; VM.fake=false;
    var n=0, dec=setInterval(function(){ VM.lv=VM.lv.map(function(v){ return v*.6 }); vPaint(); if(++n>8) clearInterval(dec) },60) }
  function close(){ stopL(); vStop(); try{ speechSynthesis.cancel() }catch(e){} if(S){ S.remove(); S=null } document.body.classList.remove('awon') }
  function status(t,l){ if(!S) return; var s=S.querySelector('.s'); s.textContent=t; s.classList.toggle('l',!!l) }
  function you(t){ if(S) S.querySelector('.you').innerHTML=t?'<span>'+esc(t)+'</span>':'' }
  function ans(h){ if(!S) return; var a=S.querySelector('.ans'); a.innerHTML=h; a.classList.toggle('hit',h.indexOf('class="ar"')>=0) }

  // ---- listening (only after a tap) ----
  // the microphone question comes from the phone; if it was blocked before, say exactly how to allow it and offer typing
  function typeBox(){ if(!S) return; var f=S.querySelector('.ty'); if(f){ f.hidden=false } }
  function blocked(){ var t=NAT?'AwareBC needs the microphone. Open your phone’s Settings ▸ Apps ▸ AwareBC ▸ Permissions ▸ Microphone ▸ Allow, or type below.'
      :'The microphone is blocked for AwareBC. Tap the icon left of the web address ▸ Permissions ▸ Microphone ▸ Allow, then tap the mic again. Or type below.';
    ans('<span>'+esc(t)+'</span>'); status('Mic blocked'); typeBox() }
  var NAT=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
  function listenNow(){ if(!SR||!S) return; try{ speechSynthesis.cancel() }catch(e){}
    var md=navigator.mediaDevices; if(md&&md.getUserMedia&&!listenNow.ok){ status('Asking for the mic…');
      return md.getUserMedia({audio:true}).then(function(sm){ try{ sm.getTracks().forEach(function(t){ t.stop() }) }catch(e){} listenNow.ok=1; listenNow() },function(er){ if(er&&(er.name==='NotAllowedError'||er.name==='SecurityError')) blocked(); else { listenNow.ok=1; listenNow() } }) }
    try{ rec=new SR() }catch(e){ return status('Voice isn’t available here') }
    rec.lang='en-CA'; rec.interimResults=true; rec.maxAlternatives=1; var said='';
    rec.onresult=function(e){ said=''; for(var i=0;i<e.results.length;i++) said+=e.results[i][0].transcript; you(said) };
    rec.onerror=function(e){ if(e.error==='audio-capture'&&VM.sm&&!NOMETER){ NOMETER=true; try{ localStorage.setItem('aw-nometer','1') }catch(x){} vStop(); rec.onend=null; on=false; rec=null; return setTimeout(listenNow,250) } /* this phone can't share the mic: drop the live meter and listen again */
      if(e.error==='not-allowed'){ listenNow.ok=0; return blocked() } var t=e.error==='service-not-allowed'?'Voice typing is off on this phone. Turn on Google voice typing in your phone’s settings, or type below.':e.error==='audio-capture'?'I can’t reach the microphone. Another app may be using it. Try again, or type below.':e.error==='network'?'Voice needs some signal on this phone. Tap an example instead.':e.error==='no-speech'?'I didn’t hear anything. Tap the mic and try again.':'';
      if(t){ ans('<span>'+esc(t)+'</span>'); if(e.error!=='no-speech') typeBox() } };
    rec.onend=function(){ on=false; vStop(); if(S) S.classList.remove('lis'); status('Tap to talk'); rec=null; if(said.trim()) ask(said.trim()) };
    try{ rec.start(); on=true; S.classList.add('lis'); status('Listening…',true); you(''); vStart() }catch(e){ on=false } }
  function stopL(){ if(rec) try{ rec.stop() }catch(e){} on=false; vStop(); if(S) S.classList.remove('lis') }
  function say(t){ try{ if(!window.speechSynthesis) return; speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(t); u.lang='en-CA'; u.rate=1; speechSynthesis.speak(u) }catch(e){} }

  // ---- understanding: what kind of place ----
  var KINDS=[
    {k:'fuel',re:/\b(gas|fuel|petrol|diesel|gas station|fill up)\b/i,word:'gas station',ic:'⛽'},
    {k:'hosp',re:/\b(hospital|emergency room|\ber\b|clinic|doctor|medical|health cent(re|er))\b/i,word:'hospital',ic:'🏥'},
    {k:'food',re:/\b(restaurant|food|eat|diner|lunch|dinner|breakfast|burger|pizza|cafe|coffee)\b/i,word:'restaurant',ic:'🍔',ph:'restaurant',tag:'amenity:restaurant'}];
  function clean(q){ return q.toLowerCase().replace(/\b(how far (is it )?to( the)?|where('s| is)( the)?|find( me)?( a| the)?|take me to( a| the)?|nearest|closest|near( me| here)?|is there( a| an)?|i need( a| an)?|show me( a| the)?|please|around here)\b/g,' ').replace(/[?.!,]/g,' ').replace(/\s+/g,' ').trim() }

  function ask(q){ if(!S) open(false); lastQ=q; you(q); var m=me(); if(!m){ ans('<span>I need your location first. Turn on location and try again.</span>'); return }
    var K=null; KINDS.forEach(function(x){ if(!K&&x.re.test(q)) K=x });
    var term=clean(q)||q; status('Looking…'); ans('<span>Looking near you…</span>');
    find(K,term,m).then(function(list){ R=list; ri=0; show() },function(){ R=[]; ri=0; show() }) }

  function J(u){ return fetch(u).then(function(r){ if(!r.ok) throw 0; return r.json() }) }
  function photon(s,tag,m){ return J('https://photon.komoot.io/api/?q='+encodeURIComponent(s)+'&limit=15&lang=en&lat='+m.lat.toFixed(3)+'&lon='+m.lon.toFixed(3)+(tag?'&osm_tag='+encodeURIComponent(tag):''))
      .then(function(j){ return (j.features||[]).map(function(f){ var p=f.properties||{}, c=f.geometry&&f.geometry.coordinates||[]; return {lat:c[1],lon:c[0],n:p.name||p.street||s,town:p.city||p.town||p.village||p.county||''} }) }) }
  function osmPts(kind,m){ var O=window.__osm; if(!O) return Promise.resolve([]);
    if(kind==='hosp') return O.nearest(m.lat,m.lon,80).then(function(P){ return (P||[]).filter(function(p){ return p.t.amenity==='hospital' }).map(function(p){ return {lat:p.lat,lon:p.lon,n:p.t.name||'Hospital',er:p.t.emergency==='yes'} }) }).catch(function(){ return [] });
    var d=.25, cl=Math.cos(m.lat*Math.PI/180); return O.inArea({s:m.lat-d,n:m.lat+d,w:m.lon-d/cl,e:m.lon+d/cl}).then(function(P){ return (P||[]).filter(function(p){ return p.t.amenity==='fuel' }).map(function(p){ return {lat:p.lat,lon:p.lon,n:p.t.name||p.t.brand||'Gas station'} }) }).catch(function(){ return [] }) }
  // nearest places straight from OpenStreetMap around you (25 km, then 80 km): finds every gas station, not just ones with "gas" in the name
  var OP='https://overpass-api.de/api/interpreter?data=', OQ={fuel:'nwr(around:R,LA,LO)[amenity=fuel];',hosp:'nwr(around:R,LA,LO)[amenity=hospital];',
    food:'nwr(around:R,LA,LO)[amenity~"^(restaurant|fast_food|cafe|pub|food_court)$"];'};
  function around(kind,m,km){ var q='[out:json][timeout:20];('+OQ[kind].replace('R',Math.round(km*1000)).replace('LA',m.lat.toFixed(4)).replace('LO',m.lon.toFixed(4))+');out tags center 60;';
    return J(OP+encodeURIComponent(q)).then(function(j){ return (j.elements||[]).map(function(e){ var c=e.center||e, t=e.tags||{}; return {lat:c.lat,lon:c.lon,n:t.name||t.brand||(kind==='fuel'?'Gas station':kind==='hosp'?'Hospital':'Restaurant'),town:t['addr:city']||'',er:t.emergency==='yes'} }) }) }
  function near(kind,m){ return around(kind,m,25).then(function(L){ return L.length?L:around(kind,m,80) }) }
  function box(m,d){ var cl=Math.cos(m.lat*Math.PI/180); return [m.lon-d/cl,m.lat-d,m.lon+d/cl,m.lat+d].map(function(v){ return v.toFixed(3) }).join(',') }
  function photonNear(s,tag,m){ return J('https://photon.komoot.io/api/?q='+encodeURIComponent(s)+'&limit=15&lang=en&lat='+m.lat.toFixed(3)+'&lon='+m.lon.toFixed(3)+'&bbox='+box(m,.7)+(tag?'&osm_tag='+encodeURIComponent(tag):''))
      .then(function(j){ return (j.features||[]).map(function(f){ var p=f.properties||{}, c=f.geometry&&f.geometry.coordinates||[]; return {lat:c[1],lon:c[0],n:p.name||p.street||s,town:p.city||p.town||p.village||''} }) }) }
  function find(K,term,m){ var on2=navigator.onLine!==false, jobs=[];
    if(K&&(K.k==='fuel'||K.k==='hosp')){ jobs.push(osmPts(K.k,m)); if(on2) jobs.push(near(K.k,m).catch(function(){ return photonNear(K.k==='fuel'?'gas':'hospital',K.k==='fuel'?'amenity:fuel':'amenity:hospital',m).catch(function(){ return [] }) })) }
    else if(on2&&K&&K.k==='food') jobs.push(near('food',m).catch(function(){ return photonNear('restaurant','amenity:restaurant',m).catch(function(){ return [] }) }));
    else if(on2) jobs.push(photonNear(term,'',m).then(function(L){ return L.length?L:photon(term,'',m) }).catch(function(){ return [] }));
    return Promise.all(jobs).then(function(A){ var all=[].concat.apply([],A), seen={};
      return all.filter(function(p){ if(!isFinite(p.lat)||!isFinite(p.lon)) return false; p.d=hav(m.lat,m.lon,p.lat,p.lon); var k=Math.round(p.lat*500)+':'+Math.round(p.lon*500); if(seen[k]||p.d>250) return false; seen[k]=1; return true }).sort(function(a,b){ return a.d-b.d }).slice(0,8) }) }
  function km(d){ return d<1?Math.round(d*1000)+' m':d<10?d.toFixed(1)+' km':Math.round(d)+' km' }
  function show(){ if(!S) return; status(SR?'Tap to talk':'Type what you need'); var m=me(), K=null; KINDS.forEach(function(x){ if(!K&&x.re.test(lastQ)) K=x });
    var word=K?K.word:clean(lastQ)||'place';
    if(!R.length){ var off=navigator.onLine===false;
      var t=off?(K&&K.k!=='food'?'I couldn’t find a '+word+' in your saved maps. Save maps for this area on Wi-Fi so I can find it with no signal.':'There’s no signal, so I can only find gas and hospitals from your saved maps right now.'):'I couldn’t find a '+word+' near you.';
      ans('<span>'+esc(t)+'</span>'); say(t); return }
    var p=R[ri], dr=dir(m.lat,m.lon,p.lat,p.lon), ic=K?K.ic:'📍', first=ri===0;
    var line=(first?'Nearest '+word+' is ':'Next one is ')+'<b>'+km(p.d)+'</b> '+dr+'.';
    ans('<div class="ar"><span class="ai" aria-hidden="true">'+ic+'</span><div><b>'+esc(p.n)+' · '+km(p.d)+'</b><small>'+(first?'Nearest '+esc(word):'Next one')+' · '+dr+(p.town?' · '+esc(p.town):'')+(p.er?' · ER':'')+'</small></div></div><div class="r"><button type="button" class="p" data-a="go">Go there</button>'+(R.length>ri+1?'<button type="button" data-a="nx">Next one</button>':'')+'</div>');
    say((first?'The nearest '+word+' is ':'The next one is ')+p.n+', '+km(p.d).replace('km','kilometres').replace(' m',' metres')+' '+dr+'.');
    S.querySelector('.ans').onclick=function(e){ var b=e.target.closest&&e.target.closest('[data-a]'); if(!b) return;
      if(b.getAttribute('data-a')==='nx'){ ri++; show() }
      else { var pt=R[ri]; close(); if(window.__nav) window.__nav.to({lat:pt.lat,lng:pt.lon},pt.n); else if(window.__goTo) window.__goTo([pt.lat,pt.lon],15) } } }
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&S) close() });

  // Settings ▸ Basics ▸ Microphone for Aware: shows Allowed / Blocked / Not asked, with a button to ask
  (function(){ var md=navigator.mediaDevices; if(!SR||!md||!md.getUserMedia) return; var row=null;
    function state(){ if(!navigator.permissions||!navigator.permissions.query) return Promise.resolve(listenNow.ok?'granted':'prompt'); return navigator.permissions.query({name:'microphone'}).then(function(p){ return p.state },function(){ return 'prompt' }) }
    function paint(){ if(!row) return; state().then(function(s){ row.querySelector('b').textContent=s==='granted'?'Allowed':s==='denied'?'Blocked':'Not asked yet'; var bt=row.querySelector('button'); bt.hidden=s==='granted'; bt.textContent=s==='denied'?'How to allow':'Allow';
      var h=row.nextSibling; if(h&&h.classList&&h.classList.contains('fhelp')) h.textContent=s==='denied'?(NAT?'Open your phone’s Settings ▸ Apps ▸ AwareBC ▸ Permissions ▸ Microphone ▸ Allow.':'Tap the icon left of the web address ▸ Permissions ▸ Microphone ▸ Allow.'):'Lets you ask Aware out loud on the Off-road map. Used only when you tap the mic.' }) }
    function mount(){ var hb=document.getElementById('gfolder'); if(!hb||row) return; row=document.createElement('div'); row.className='setrow'; row.id='microw'; row.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px';
      row.innerHTML='<span>Microphone for Aware: <b></b></span><button type="button" class="setbtn" style="width:auto;padding:0 14px;margin:0">Allow</button>';
      var help=document.createElement('div'); help.className='fhelp'; hb.appendChild(row); hb.appendChild(help);
      row.querySelector('button').onclick=function(){ state().then(function(s){ if(s==='denied') return paint();
        md.getUserMedia({audio:true}).then(function(sm){ try{ sm.getTracks().forEach(function(t){ t.stop() }) }catch(e){} listenNow.ok=1; paint() },function(){ paint() }) }) };
      paint(); hb.addEventListener('toggle',paint) }
    if(document.readyState==='complete') setTimeout(mount,700); else addEventListener('load',function(){ setTimeout(mount,700) }) })();
  window.__aware={open:open,ask:ask,close:close};
})();
