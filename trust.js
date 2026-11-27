/* Data you can trust (by Josh Singer): when a map layer's source stops answering, say so plainly instead of quietly
   showing old data: "DriveBC isn't answering · showing what we had at 2:15 PM". Once per source every 30 minutes, only for layers you have on. */
(function(){
  var BTN={road:'roadbtn',fire:'firebtn',ferry:'ferrybtn',apt:'aptbtn',lt:'ltbtn',mt:'mtbtn',rep:'trbtn'}, ICO={road:'🚧',fire:'🔥',ferry:'⛴️',apt:'🛫',mt:'❄️',rep:'🚩'}; /* only live data gets a note: trails, FSRs and lightning (it has its own note) just show "Couldn't check" on their tile */
  var said={}, pend=[], pt=null;
  function on(k){ if(k==='fsr'||k==='trail') return document.body.classList.contains('fsron'); var b=document.getElementById(BTN[k]); return !!b&&(b.getAttribute('aria-pressed')==='true'||b.classList.contains('on')) }
  function hm(t){ var d=new Date(t), same=new Date().toDateString()===d.toDateString(); return (same?'':d.toLocaleDateString([],{month:'short',day:'numeric'})+' ')+d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}) }
  function toast(txt){ var n=document.createElement('div'); n.className='frtoast awsrcdown'; n.setAttribute('role','status'); n.style.zIndex=6300; n.textContent=txt; document.body.appendChild(n);
    setTimeout(function(){ n.classList.add('go') },5200); setTimeout(function(){ n.remove() },5800) }
  addEventListener('aw-srcdown',function(e){ var d=e.detail||{}, k=d.k; if(!k||!ICO[k]||document.hidden||!on(k)) return;
    if(said[k]&&Date.now()-said[k]<1800000) return; said[k]=Date.now();
    pend.push({k:k,d:d}); if(pt) return; /* several sources down at once (no signal): one note, not a stack */
    pt=setTimeout(function(){ pt=null; var F=window.__fresh, L=pend.filter(function(x){ return !(F&&F.down&&!F.down(x.k)) }); pend=[]; if(!L.length) return;
      var off=L.some(function(x){ return x.d.off }), last=Math.min.apply(null,L.map(function(x){ return x.d.last||Infinity }));
      if(L.length===1){ var d=L[0].d; toast(ICO[L[0].k]+' '+(off?'No signal':d.name+' isn\u2019t answering')+' \u00b7 '+(d.last?'showing what we had at '+hm(d.last):'nothing saved yet, trying again soon')); return }
      toast(L.map(function(x){ return ICO[x.k] }).join('')+' '+(off?'No signal':L.length+' sources aren\u2019t answering')+' \u00b7 '+(isFinite(last)?'showing what we had at '+hm(last):'showing what\u2019s saved')) },3500) });
})();
