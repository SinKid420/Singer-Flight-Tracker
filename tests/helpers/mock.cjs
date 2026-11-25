const L=require('path').join(__dirname,'..','lib');
// synthetic BC road grid around 50.11,-120.79: N-S "Main St", "2nd Ave"...; E-W "Coast Hwy"
function roads(){ const f=[]; let id=1; const la0=50.09, lo0=-120.82;
 for(let i=0;i<8;i++){ const lo=lo0+i*0.006; f.push({type:'Feature',id:'r'+id,properties:{DIGITAL_ROAD_ATLAS_LINE_ID:id++,ROAD_CLASS:i==3?'highway':'local',ROAD_NAME_FULL:i==3?'Coast Hwy':('Street '+(i+1)),ROAD_SURFACE:'paved'},geometry:{type:'LineString',coordinates:Array.from({length:25},(_,k)=>[+lo.toFixed(6),+(la0+k*0.002).toFixed(6)])}}) }
 for(let j=0;j<8;j++){ const la=la0+j*0.006; f.push({type:'Feature',id:'r'+id,properties:{DIGITAL_ROAD_ATLAS_LINE_ID:id++,ROAD_CLASS:'local',ROAD_NAME_FULL:'Avenue '+(j+1),ROAD_SURFACE:'paved'},geometry:{type:'LineString',coordinates:Array.from({length:25},(_,k)=>[+(lo0+k*0.002).toFixed(6),+la.toFixed(6)])}}) }
 return {type:'FeatureCollection',features:f} }
module.exports=async(c,opt={})=>{ await c.addInitScript(()=>{ try{ if(localStorage.getItem('aw-oldui')===null) localStorage.setItem('aw-oldui','1') }catch(e){} }); await c.route(/^https?:\/\//,r=>{ const u=r.request().url();
 if(/^http:\/\/localhost/.test(u)) return r.continue();
 if(/leaflet\.min\.css/.test(u)) return r.fulfill({path:L+'/leaflet.min.css',contentType:'text/css'});
 if(/leaflet\.min\.js/.test(u)) return r.fulfill({path:L+'/leaflet.min.js',contentType:'application/javascript'});
 if(/leaflet-rotate/.test(u)) return r.fulfill({path:L+'/leaflet-rotate.js',contentType:'application/javascript'});
 if(/openmaps\.gov\.bc\.ca/.test(u)&&/DRA_DGTL_ROAD_ATLAS/.test(u)){ (opt.log||[]).push('dra'); return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(/startIndex=0/.test(u)?roads():{type:'FeatureCollection',features:[]})}) }
 if(/openmaps\.gov\.bc\.ca/.test(u)&&/(FTEN_ROAD|WAA_MVPR)/.test(u)) return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"type":"FeatureCollection","features":[]}'});
 if(/router\.project-osrm/.test(u)){ (opt.log||[]).push('osrm'); return r.abort() }
 return r.abort() }) }
