// AwareBC (by Josh Singer): saved places. Favourite or Want to go, kept on the phone (works with no service).
// On road and Off road each keep their own lists.
(function(){
  var A=window.__AW; if(!A||!A.map){ return } var map=A.map, K='aw-saved';
  var LS={fav:{n:'Favourites',ic:'⭐',one:'Favourite'},want:{n:'Want to go',ic:'🚩',one:'Want to go'}};
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] }) }
  function mode(){ return window.__awp&&window.__awp.onRoad&&!window.__awp.onRoad()?'off':'on' }
  function all(){ try{ var o=JSON.parse(localStorage.getItem(K)||'{}'); return {on:Array.isArray(o.on)?o.on:[],off:Array.isArray(o.off)?o.off:[]} }catch(e){ return {on:[],off:[]} } }
  function put(o){ try{ localStorage.setItem(K,JSON.stringify(o)) }catch(e){} draw();  }
  function near(a,la,lo){ return Math.abs(a.lat-la)<0.00025&&Math.abs(a.lon-lo)<0.00035 }
  function find(m,la,lo){ var L2=all()[m]; for(var i=0;i<L2.length;i++) if(near(L2[i],la,lo)) return L2[i]; return null }
  function toggle(m,ll,name,list){ var o=all(), L2=o[m], hit=null; for(var i=0;i<L2.length;i++) if(near(L2[i],ll.lat,ll.lng)){ hit=L2[i]; break }
    if(hit&&hit.l===list){ o[m]=L2.filter(function(x){ return x!==hit }); put(o); return null }
    if(hit){ hit.l=list; hit.n=name||hit.n; hit.t=Date.now() } else L2.unshift({lat:+ll.lat.toFixed(6),lon:+ll.lng.toFixed(6),n:String(name||'Pinned spot').slice(0,80),l:list,t:Date.now()});
    if(L2.length>300) L2.length=300; put(o); return list }
  window.__saveCard=function(box,ll,pin){ // the save row on a pin's card
    var row=document.createElement('div'); row.className='svrow'; var cx=box.querySelector('.gpsx'); box.insertBefore(row,cx);
    function nm(){ var b=box.querySelector('b'); return b?b.textContent:'' }
    function paint(){ var m=mode(), h=find(m,ll.lat,ll.lng);
      row.innerHTML=['fav','want'].map(function(k){ var on=h&&h.l===k; return '<button type="button" data-s="'+k+'" aria-pressed="'+(on?'true':'false')+'"'+(on?' class="on"':'')+'>'+LS[k].ic+' '+(on?'Saved':LS[k].one)+'</button>' }).join('') }
    row.onclick=function(e){ var t=e.target.closest&&e.target.closest('[data-s]'); if(!t) return; e.stopPropagation(); toggle(mode(),ll,nm(),t.getAttribute('data-s')); paint() };
    paint() };
  // saved spots on the map (only the lists for the side you are on)
  var lay=L.layerGroup().addTo(map);
  function draw(){ lay.clearLayers(); all()[mode()].forEach(function(a){
    L.marker([a.lat,a.lon],{icon:L.divIcon({className:'',html:'<span class="svmk" role="button" aria-label="'+esc(a.n)+'">'+LS[a.l==='want'?'want':'fav'].ic+'</span>',iconSize:[0,0]}),keyboard:false,zIndexOffset:500})
     .on('click',function(){ if(window.__pin) window.__pin(L.latLng(a.lat,a.lon),a.n) }).addTo(lay) }) }
  document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('.seg button')) setTimeout(function(){ draw(); if(P&&!P.hidden) list() },60) },true);
  // the Saved list (Tools ▸ Saved)
  var P=null, tab='fav';
  function km(a){ var me=A.me&&A.me(); if(!me||!me.lat||me.label==='none') return ''; var r=Math.PI/180, d=6371*2*Math.asin(Math.sqrt(Math.pow(Math.sin((a.lat-me.lat)*r/2),2)+Math.cos(me.lat*r)*Math.cos(a.lat*r)*Math.pow(Math.sin((a.lon-me.lon)*r/2),2))); return d<10?d.toFixed(1)+' km':Math.round(d)+' km' }
  function list(){ var m=mode(), L2=all()[m].filter(function(a){ return (a.l==='want'?'want':'fav')===tab });
    P.querySelector('h3').textContent='Saved · '+(m==='on'?'On road':'Off road');
    [].forEach.call(P.querySelectorAll('.svt button'),function(b){ var on=b.getAttribute('data-t')===tab; b.className=on?'on':''; b.setAttribute('aria-pressed',on?'true':'false') });
    P.querySelector('.svl').innerHTML=L2.length?L2.map(function(a,i){ return '<div class="svi"><button type="button" class="svgo" data-i="'+i+'"><b>'+esc(a.n)+'</b><small>'+esc(km(a))+'</small></button><button type="button" class="svx" data-x="'+i+'" aria-label="Remove '+esc(a.n)+'">✕</button></div>' }).join('')
      :'<div class="sve">Nothing saved yet. Tap a spot on the map, then '+LS[tab].ic+' '+LS[tab].one+'.</div>';
    P._l=L2 }
  function open(){ if(!P){ P=document.createElement('div'); P.id='svp'; P.hidden=true; P.setAttribute('role','dialog'); P.setAttribute('aria-label','Saved places'); document.body.appendChild(P);
      P.innerHTML='<div class="sh"><h3></h3><div class="svt"><button type="button" data-t="fav">⭐ Favourites</button><button type="button" data-t="want">🚩 Want to go</button></div><div class="svl"></div><button type="button" class="svc">Close</button></div>';
      P.onclick=function(e){ var t=e.target; if(t===P||t.closest('.svc')){ P.hidden=true; return }
        var b=t.closest('[data-t]'); if(b){ tab=b.getAttribute('data-t'); list(); return }
        var x=t.closest('[data-x]'); if(x){ var a=P._l[+x.getAttribute('data-x')], o=all(); o[mode()]=o[mode()].filter(function(y){ return !(y.lat===a.lat&&y.lon===a.lon) }); put(o); list(); return }
        var g=t.closest('[data-i]'); if(g){ var c=P._l[+g.getAttribute('data-i')]; P.hidden=true; map.setView([c.lat,c.lon],Math.max(map.getZoom(),15),{animate:true}); setTimeout(function(){ if(window.__pin) window.__pin(L.latLng(c.lat,c.lon),c.n) },450) } } }
    list(); P.hidden=false }
  window.__saved={open:open,all:all};
  var st=document.createElement('style'); st.textContent=
    '.svrow{display:flex;gap:6px;margin-top:6px}.svrow button{flex:1;min-width:0;padding:7px 4px;border:0;border-radius:10px;font:600 12.5px var(--font,system-ui);background:#f1f3f4;color:#202124;white-space:nowrap}.svrow button.on{background:#fff4c2;box-shadow:inset 0 0 0 1.5px #f9ab00}'+
    '.svmk{display:inline-block;transform:translate(-50%,-50%);font-size:20px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.7));cursor:pointer}'+
    '#svp{position:fixed;inset:0;z-index:5500;background:rgba(0,0,0,.55);display:flex;align-items:flex-end}#svp[hidden]{display:none}#svp .sh{width:100%;max-height:78vh;display:flex;flex-direction:column;background:var(--bg,#1c1c1e);color:var(--fg,#fff);border-radius:18px 18px 0 0;padding:12px 16px calc(env(safe-area-inset-bottom,0px) + 10px);font:13px var(--font,system-ui);box-sizing:border-box}'+
    '#svp h3{margin:0 0 8px;font:800 17px var(--font,system-ui)}#svp .svt{display:flex;gap:8px;margin-bottom:8px}#svp .svt button{flex:1;height:36px;border:0;border-radius:18px;background:var(--chip,#2c2c2e);color:var(--fg,#fff);font:700 13px var(--font,system-ui)}#svp .svt button.on{background:var(--accent,#ff3b30);color:#fff}'+
    '#svp .svl{overflow-y:auto;min-height:60px}#svp .svi{display:flex;gap:6px;align-items:stretch;margin-bottom:6px}#svp .svgo{flex:1;min-width:0;text-align:left;border:0;border-radius:12px;background:var(--chip,#2c2c2e);color:var(--fg,#fff);padding:8px 10px;font:14px var(--font,system-ui)}'+
    '#svp .svgo b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#svp .svgo small{color:var(--dim,#aaa);font-size:11.5px}#svp .svx{width:40px;border:0;border-radius:12px;background:var(--chip,#2c2c2e);color:var(--dim,#aaa);font-size:15px}'+
    '#svp .sve{color:var(--dim,#aaa);text-align:center;padding:16px 4px}#svp .svc{margin-top:8px;height:40px;border:0;border-radius:20px;background:var(--chip,#2c2c2e);color:var(--fg,#fff);font:700 14px var(--font,system-ui)}';
  document.head.appendChild(st);
  var tb=document.getElementById('t_saved'); if(tb) tb.onclick=function(){ document.body.classList.remove('toolon'); open() };
  draw();
})();
