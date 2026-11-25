// AwareBC rider rigs (by Josh Singer): rig types drawn from above (no brand names or logos), in 20 paint colours.
// Used for rider pins on the map (turned to face the way they're going), My spot in Off-road, and the rig picker.
(function(){
  var N=0;
  function defs(c,i){ return `<defs>
<linearGradient id="p${i}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c}" stop-opacity="1"/><stop offset=".1" stop-color="#000" stop-opacity=".3"/><stop offset=".2" stop-color="${c}"/><stop offset=".8" stop-color="${c}"/><stop offset=".9" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="${c}"/></linearGradient>
<radialGradient id="b${i}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient>
<linearGradient id="g${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9e2f5"/><stop offset=".35" stop-color="#4c6a82"/><stop offset=".6" stop-color="#1e2a35"/><stop offset="1" stop-color="#0e151c"/></linearGradient>
<linearGradient id="t${i}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0b0c0e"/><stop offset=".5" stop-color="#2b2e33"/><stop offset="1" stop-color="#0b0c0e"/></linearGradient>
<pattern id="tr${i}" width="4" height="2" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="url(#t${i})"/><path d="M0 1h4" stroke="#000" stroke-opacity=".6" stroke-width=".6"/></pattern>
<radialGradient id="s${i}"><stop offset=".5" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>` }

  var tire=(i,x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.6" fill="url(#tr${i})"/>`;
var mirror=(c,y,l,r)=>`<path d="M${l} ${y}l-3 -.6v2.4l3 .2z" fill="${c}" stroke="#0007" stroke-width=".4"/><path d="M${r} ${y}l3 -.6v2.4l-3 .2z" fill="${c}" stroke="#0007" stroke-width=".4"/>`;
var lights=(y,l,r,back)=>back?`<rect x="${l}" y="${y}" width="3.4" height="1.3" rx=".5" fill="#ff3b30"/><rect x="${r-3.4}" y="${y}" width="3.4" height="1.3" rx=".5" fill="#ff3b30"/>`:`<rect x="${l}" y="${y}" width="3.8" height="1.6" rx=".7" fill="#fffbe8"/><rect x="${r-3.8}" y="${y}" width="3.8" height="1.6" rx=".7" fill="#fffbe8"/>`;

  var R={
pickup:(c,i)=>`<ellipse cx="20" cy="33" rx="15" ry="29" fill="url(#s${i})"/>${tire(i,6.5,10,4,9)}${tire(i,29.5,10,4,9)}${tire(i,6.5,44,4,9)}${tire(i,29.5,44,4,9)}
<rect x="9" y="3" width="22" height="58" rx="5" fill="url(#p${i})"/><rect x="9" y="3" width="22" height="58" rx="5" fill="url(#b${i})"/>
<path d="M12 6c2-1.6 14-1.6 16 0l.6 10h-17.2z" fill="${c}" opacity=".35"/><path d="M20 4.5v12" stroke="#000" stroke-opacity=".25" stroke-width=".6"/>
${lights(3.6,10.5,29.5)}${mirror(c,19,9,31)}
<path d="M11.2 17h17.6l-2 5.6h-13.6z" fill="url(#g${i})"/><rect x="12.6" y="22.6" width="14.8" height="9" rx="1.4" fill="${c}"/><rect x="12.6" y="22.6" width="14.8" height="9" rx="1.4" fill="url(#b${i})"/>
<path d="M13 31.6h14l-.8 2.6h-12.4z" fill="url(#g${i})"/>
<rect x="11.5" y="36" width="17" height="22.5" rx="1.4" fill="#16191d" stroke="#000" stroke-opacity=".5"/><path d="M12.5 40h15M12.5 45h15M12.5 50h15M12.5 55h15" stroke="#2a2e33" stroke-width=".8"/>${lights(59.5,10,30,1)}`,
suv:(c,i)=>`<ellipse cx="20" cy="32" rx="14" ry="28" fill="url(#s${i})"/>${tire(i,7,10,4,8.5)}${tire(i,29,10,4,8.5)}${tire(i,7,42,4,8.5)}${tire(i,29,42,4,8.5)}
<rect x="9.5" y="5" width="21" height="54" rx="6" fill="url(#p${i})"/><rect x="9.5" y="5" width="21" height="54" rx="6" fill="url(#b${i})"/>${lights(5.6,11,29)}${mirror(c,21,9.5,30.5)}
<path d="M11.8 18h16.4l-2 5.5h-12.4z" fill="url(#g${i})"/><rect x="13" y="23.5" width="14" height="24" rx="2" fill="${c}"/><rect x="13" y="23.5" width="14" height="24" rx="2" fill="url(#b${i})"/>
<path d="M14 24.5v22M26 24.5v22" stroke="#111" stroke-opacity=".65" stroke-width="1.2"/><path d="M13 47.5h14l1.2 5h-16.4z" fill="url(#g${i})"/>${lights(57.2,11,29,1)}`,
van:(c,i)=>`<ellipse cx="20" cy="32" rx="14" ry="29" fill="url(#s${i})"/>${tire(i,7.5,9,3.8,8)}${tire(i,28.7,9,3.8,8)}${tire(i,7.5,45,3.8,8)}${tire(i,28.7,45,3.8,8)}
<rect x="9.5" y="3" width="21" height="58" rx="4" fill="url(#p${i})"/><rect x="9.5" y="3" width="21" height="58" rx="4" fill="url(#b${i})"/>${lights(3.6,11,29)}${mirror(c,14,9.5,30.5)}
<path d="M11.6 9h16.8l-1.5 5h-13.8z" fill="url(#g${i})"/><rect x="12" y="15" width="16" height="43" rx="1.5" fill="${c}"/><path d="M12 15h16v43h-16z" fill="url(#b${i})"/><path d="M15 20h10M15 30h10M15 40h10M15 50h10" stroke="#000" stroke-opacity=".2"/>${lights(59.4,10.5,29.5,1)}`,
jeep:(c,i)=>`<ellipse cx="20" cy="32" rx="15" ry="27" fill="url(#s${i})"/>${tire(i,5.5,10,5,10)}${tire(i,29.5,10,5,10)}${tire(i,5.5,40,5,10)}${tire(i,29.5,40,5,10)}
<rect x="9" y="6" width="22" height="48" rx="3" fill="url(#p${i})"/><rect x="9" y="6" width="22" height="48" rx="3" fill="url(#b${i})"/><rect x="10" y="4.5" width="20" height="3" rx="1" fill="#1c1f23"/>${lights(7.6,10.5,29.5)}
<path d="M10.5 9.5v8M29.5 9.5v8" stroke="#000" stroke-opacity=".35"/><rect x="11" y="19" width="18" height="2" rx=".6" fill="url(#g${i})"/>
<rect x="11.5" y="22" width="17" height="24" rx="1.5" fill="#15181c"/><rect x="12.8" y="23.5" width="6.4" height="7" rx="2.4" fill="#2f3339"/><rect x="20.8" y="23.5" width="6.4" height="7" rx="2.4" fill="#2f3339"/><rect x="12.5" y="33" width="15" height="11" rx="1.5" fill="#22262b"/>
<circle cx="20" cy="57.5" r="4.6" fill="url(#tr${i})"/><circle cx="20" cy="57.5" r="1.8" fill="#4a4f55"/>`,
utv:(c,i)=>`<ellipse cx="20" cy="32" rx="16" ry="26" fill="url(#s${i})"/>${tire(i,4.5,9,6,10)}${tire(i,29.5,9,6,10)}${tire(i,4.5,41,6,11)}${tire(i,29.5,41,6,11)}
<path d="M11 8h18l1.5 6v34l-1.5 6h-18l-1.5-6v-34z" fill="url(#p${i})"/><path d="M11 8h18l1.5 6v34l-1.5 6h-18l-1.5-6v-34z" fill="url(#b${i})"/>${lights(8.6,12,28)}
<rect x="10.8" y="19" width="18.4" height="19" rx="2" fill="none" stroke="#1a1d21" stroke-width="2.2"/><rect x="12" y="20.4" width="16" height="16.2" rx="1" fill="#0d0f12" opacity=".55"/>
<rect x="12.8" y="23" width="6" height="8" rx="2.4" fill="#2f3339"/><rect x="21.2" y="23" width="6" height="8" rx="2.4" fill="#2f3339"/><circle cx="16" cy="21.5" r="2" fill="none" stroke="#111" stroke-width="1.1"/>
<rect x="12.5" y="40" width="15" height="11" rx="1" fill="#16191d"/><path d="M13.5 43h13M13.5 46h13M13.5 49h13" stroke="#2a2e33" stroke-width=".7"/>`,
quad:(c,i)=>`<ellipse cx="20" cy="32" rx="15" ry="24" fill="url(#s${i})"/>${tire(i,5,10,6,10)}${tire(i,29,10,6,10)}${tire(i,5,40,6.5,11)}${tire(i,28.5,40,6.5,11)}
<path d="M13 10h14l3 5v4h-20v-4z" fill="url(#p${i})"/><path d="M12 38h16l3 4v6l-2 3h-18l-2-3v-6z" fill="url(#p${i})"/><path d="M13 10h14l3 5v4h-20v-4zM12 38h16l3 4v6l-2 3h-18l-2-3v-6z" fill="url(#b${i})"/>
<rect x="16" y="18" width="8" height="21" rx="3" fill="url(#p${i})"/><path d="M8.5 21.5h23" stroke="#1a1d21" stroke-width="2.2" stroke-linecap="round"/><circle cx="8.6" cy="21.5" r="1.4" fill="#2a2e33"/><circle cx="31.4" cy="21.5" r="1.4" fill="#2a2e33"/>
<rect x="17" y="25" width="6" height="12" rx="2.6" fill="#1b1e22"/>${lights(10.6,14,26)}<rect x="15" y="44" width="10" height="5" rx="1" fill="#1b1e22"/>`,
bike:(c,i)=>`<ellipse cx="20" cy="32" rx="9" ry="26" fill="url(#s${i})"/><rect x="18" y="6" width="4" height="13" rx="2" fill="url(#tr${i})"/><rect x="17.8" y="42" width="4.4" height="15" rx="2" fill="url(#tr${i})"/>
<path d="M17 14l1.5-3h3l1.5 3v8l1.2 3v11l-2.2 5h-4l-2.2-5v-11l1.2-3z" fill="url(#p${i})"/><path d="M17 14l1.5-3h3l1.5 3v8l1.2 3v11l-2.2 5h-4l-2.2-5v-11l1.2-3z" fill="url(#b${i})"/>
<path d="M10 17.5h20" stroke="#1a1d21" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="17.5" r="1.3" fill="#2a2e33"/><circle cx="30" cy="17.5" r="1.3" fill="#2a2e33"/><rect x="18" y="25" width="4" height="14" rx="1.8" fill="#1b1e22"/>`,
sled:(c,i)=>`<ellipse cx="20" cy="32" rx="14" ry="28" fill="url(#s${i})"/><path d="M8 5q2-4 5 0l.6 13h-5.6zM27 5q3-4 5 0l-.6 13h-5.6z" fill="#2d3136" stroke="#111" stroke-width=".5"/>
<path d="M12 18l4-10h8l4 10v14l-2 3h-12l-2-3z" fill="url(#p${i})"/><path d="M12 18l4-10h8l4 10v14l-2 3h-12l-2-3z" fill="url(#b${i})"/><path d="M15.6 11h8.8l-1.2 4h-6.4z" fill="url(#g${i})"/>
<path d="M10.5 18.5h19" stroke="#1a1d21" stroke-width="2" stroke-linecap="round"/><rect x="16.8" y="21" width="6.4" height="13" rx="2.4" fill="#1b1e22"/>
<rect x="14" y="34" width="12" height="25" rx="2" fill="#1a1d21"/><path d="M15 37h10M15 41h10M15 45h10M15 49h10M15 53h10M15 57h10" stroke="#34393f" stroke-width="1"/>${lights(58.5,15,25,1)}`,
};
R.mid=(c,i)=>R.pickup(c,i).replace(/x="9" y="3" width="22" height="58"/g,'x="9.5" y="5" width="21" height="54"');
R.wagon=R.suv;

  var NAMES={pickup:'Pickup',mid:'Mid truck',van:'Van',suv:'SUV',jeep:'Jeep-style 4×4',wagon:'Wagon',utv:'Side-by-side',quad:'Quad',bike:'Dirt bike',sled:'Sled'};
  var ORDER=['pickup','mid','van','suv','jeep','wagon','utv','quad','bike','sled'];
  var COL=[['white','White','#eceef0'],['silver','Silver','#b9bfc6'],['grey','Grey','#6f767d'],['black','Black','#2a2d32'],['red','Red','#c42b22'],['maroon','Maroon','#6e1a1f'],['orange','Orange','#e0761c'],['yellow','Yellow','#e8c12a'],['lime','Lime','#8cc63f'],['green','Green','#3c7a3a'],
    ['army','Army','#5b6534'],['teal','Teal','#1f8a8a'],['sky','Sky blue','#5aa9e6'],['blue','Blue','#2f6fc4'],['navy','Navy','#1d2f57'],['purple','Purple','#6d47b8'],['pink','Pink','#d65a8f'],['tan','Tan','#c8a97a'],['brown','Brown','#6b4a2e'],['bronze','Bronze','#9a6b3a']];
  var CM={}; COL.forEach(function(c){ CM[c[0]]=c[2] });
  var DEF={pickup:'white',mid:'red',van:'white',suv:'navy',jeep:'army',wagon:'silver',utv:'red',quad:'orange',bike:'white',sled:'purple'};
  function hex(k,c){ return CM[c]||(/^#[0-9a-f]{6}$/i.test(c||'')?c:CM[DEF[k]||'white']) }
  /* svg(type, size, ring, colour, turn): ring = round dark chip with a coloured ring (pickers); turn = degrees the rig faces */
  function svg(k,size,ring,c,rot){ k=R[k]?k:'pickup'; size=size||28; N++; var col=hex(k,c), body=defs(col,'w'+N)+R[k](col,'w'+N);
    if(ring) return '<svg class="awrig" width="'+size+'" height="'+size+'" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#1a1d22" stroke="'+(typeof ring==='string'?ring:'#30d158')+'" stroke-width="3"/><g transform="translate(32 32) rotate('+(rot||0)+') translate(-15.5 -24.8) scale(.775)">'+body+'</g></svg>';
    return '<svg class="awrig" width="'+size+'" height="'+size+'" viewBox="-12 0 64 64" aria-hidden="true"'+(rot?' style="transform:rotate('+rot+'deg)"':'')+'>'+body+'</svg>' }
  window.__rigs={list:ORDER.map(function(k){ return [k,NAMES[k]] }), svg:svg, has:function(k){ return !!R[k] }, colours:COL, hex:hex, def:function(k){ return DEF[k]||'white' }};
})();
