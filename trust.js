/* Data you can trust (by Josh Singer): when a map layer's source stops answering, say so plainly instead of quietly
   showing old data: "DriveBC isn't answering · showing what we had at 2:15 PM". Once per source every 30 minutes, only for layers you have on. */
(function(){
  var BTN={road:'roadbtn',fire:'firebtn',ferry:'ferrybtn',apt:'aptbtn',lt:'ltbtn',mt:'mtbtn',rep:'trbtn'}, ICO={road:'🚧',fire:'🔥',ferry:'⛴️',apt:'🛫',lt:'⚡',mt:'❄️',rep:'🚩',fsr:'🌲',trail:'🥾'};
  var said={};
  function on(k){ if(k==='fsr'||k==='trail') return document.body.classList.contains('fsron'); var b=document.getElementById(BTN[k]); return !!b&&(b.getAttribute('aria-pressed')==='true'||b.classList.contains('on')) }
  function hm(t){ var d=new Date(t), same=new Date().toDateString()===d.toDateString(); return (same?'':d.toLocaleDateString([],{month:'short',day:'numeric'})+' ')+d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}) }
  function toast(txt){ var n=document.createElement('div'); n.className='frtoast awsrcdown'; n.setAttribute('role','status'); n.style.zIndex=6300; n.textContent=txt; document.body.appendChild(n);
    setTimeout(function(){ n.classList.add('go') },5200); setTimeout(function(){ n.remove() },5800) }
  addEventListener('aw-srcdown',function(e){ var d=e.detail||{}, k=d.k; if(!k||!ICO[k]||document.hidden||!on(k)) return;
    if(said[k]&&Date.now()-said[k]<1800000) return; said[k]=Date.now();
    setTimeout(function(){ var F=window.__fresh; if(F&&F.down&&!F.down(k)) return; /* it answered on a retry: nothing to say */
      toast(ICO[k]+' '+d.name+' isn’t answering · '+(d.last?'showing what we had at '+hm(d.last):'nothing saved yet, trying again soon')) },3500) });
})();
