// AwareBC sound relay (by Josh Singer): a tiny data modem in near-ultrasonic sound (17.5–19.4 kHz, barely audible).
// Phones with no signal and no radio link can still pass a help call or a "here I am" beacon a few metres, phone to phone.
// 16 tones, 4 bits per 60 ms beep: one packet (rider tag, spot, type, hops) is 11 bytes and takes about 1.7 s.
(function(){
  var F0=17500, DF=125, NT=16, SYM=0.06, PRE=[0,15,0,15,7,8], NB=11; // 9 data bytes + CRC-16
  var TA='23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // same letters as rider tags
  function crc16(b){ var c=0xffff; for(var i=0;i<b.length;i++){ c^=b[i]<<8; for(var j=0;j<8;j++) c=(c&0x8000)?((c<<1)^0x1021)&0xffff:(c<<1)&0xffff } return c }
  // packet: type 4 bits (1 help, 2 beacon, 3 hazard, 4 OK) · hops 4 · lat 22 · lon 22 · tag 20 = 72 bits
  function pack(o){ var la=Math.round((o.lat+90)*1e4*(4194303/1800000)), lo=Math.round((o.lon+180)*1e4*(4194303/3600000)), tg=0;
    String(o.tag||'').toUpperCase().slice(0,4).split('').forEach(function(ch){ var k=TA.indexOf(ch); tg=tg*32+(k<0?0:k) });
    var bits=[]; function put(v,n){ for(var i=n-1;i>=0;i--) bits.push(Math.floor(v/Math.pow(2,i))%2) }
    put(o.type&15,4); put((o.hops||0)&15,4); put(la,22); put(lo,22); put(tg,20);
    var by=[]; for(var i=0;i<72;i+=8){ var v=0; for(var j=0;j<8;j++) v=v*2+bits[i+j]; by.push(v) } var c=crc16(by); by.push(c>>8,c&255); return by }
  function unpack(by){ if(by.length!==NB||crc16(by.slice(0,9))!==((by[9]<<8)|by[10])) return null; var bits=[]; by.slice(0,9).forEach(function(v){ for(var j=7;j>=0;j--) bits.push((v>>j)&1) }); var p=0;
    function get(n){ var v=0; for(var i=0;i<n;i++) v=v*2+bits[p++]; return v } var type=get(4), hops=get(4), la=get(22), lo=get(22), tg=get(20), t='';
    for(var i=0;i<4;i++){ t=TA[tg%32]+t; tg=Math.floor(tg/32) }
    return {type:type,hops:hops,lat:+(la*1800000/4194303/1e4-90).toFixed(4),lon:+(lo*3600000/4194303/1e4-180).toFixed(4),tag:t} }
  function symbols(by){ var s=PRE.slice(); by.forEach(function(v){ s.push(v>>4,v&15) }); return s }
  // ---- make the sound (Float32 samples, used for playing and for tests) ----
  function render(by,sr){ var s=symbols(by), n=Math.round(SYM*sr), r=Math.round(0.006*sr), out=new Float32Array(s.length*n+Math.round(0.1*sr));
    s.forEach(function(k,i){ var f=F0+k*DF; for(var j=0;j<n;j++){ var a=j<r?j/r:j>n-r?(n-j)/r:1; out[i*n+j]=0.6*a*Math.sin(2*Math.PI*f*(i*n+j)/sr) } }); return out }
  // ---- listen: find the start tones, then read the beeps (Goertzel filters on the 16 tones) ----
  function power(x,st,len,f,sr){ var w=2*Math.cos(2*Math.PI*f/sr), a=0,b=0; for(var i=st;i<st+len;i++){ var c=x[i]+w*a-b; b=a; a=c } return a*a+b*b-w*a*b }
  function best(x,st,len,sr){ var bi=-1,bp=0,sum=0; for(var k=0;k<NT;k++){ var p=power(x,st,len,F0+k*DF,sr); sum+=p; if(p>bp){ bp=p; bi=k } } return {k:bi,q:sum>0?bp/sum:0,p:bp} }
  function decode(x,sr){ var n=Math.round(SYM*sr), win=Math.round(n*0.7), off=Math.round(n*0.15), step=Math.max(1,Math.round(n/10)), total=(PRE.length+NB*2)*n, found=[];
    for(var t=0;t+total<=x.length;t+=step){ var ok=0; for(var i=0;i<PRE.length;i++){ var b=best(x,t+i*n+off,win,sr); if(b.k===PRE[i]&&b.q>0.35) ok++; else if(i<2) break }
      if(ok<5) continue;
      // fine-tune the start within one step, keep the sharpest
      var bt=t, bs=-1; for(var d=-step;d<=step;d+=Math.max(1,step>>2)){ var sc=0; for(var i2=0;i2<PRE.length;i2++){ var b2=best(x,t+d+i2*n+off,win,sr); if(b2.k===PRE[i2]) sc+=b2.q } if(sc>bs){ bs=sc; bt=t+d } }
      var by=[]; for(var m=0;m<NB;m++){ var hi=best(x,bt+(PRE.length+2*m)*n+off,win,sr).k, lo=best(x,bt+(PRE.length+2*m+1)*n+off,win,sr).k; by.push((hi<<4)|lo) }
      var o=unpack(by); if(o){ found.push(o); t=bt+total-step } }
    return found }
  window.__sonic={ pack:pack, unpack:unpack, render:render, decode:decode, F0:F0, DF:DF };

  // ---------- live: play a packet, listen with the microphone ----------
  var AC=null, live=null, ring=null, rp=0, SR=48000, seen={}, onPkt=null;
  function ctx(){ if(!AC){ var C=window.AudioContext||window.webkitAudioContext; if(!C) return null; AC=new C() } if(AC.state==='suspended') AC.resume(); return AC }
  function play(o){ var c=ctx(); if(!c) return false; var x=render(pack(o),c.sampleRate), buf=c.createBuffer(1,x.length,c.sampleRate); buf.copyToChannel?buf.copyToChannel(x,0):buf.getChannelData(0).set(x);
    var s=c.createBufferSource(); s.buffer=buf; s.connect(c.destination); s.start(); seen[key(o)]=Date.now(); return true }
  function key(o){ return o.type+'|'+o.tag+'|'+o.lat.toFixed(3)+'|'+o.lon.toFixed(3) }
  function listen(cb){ onPkt=cb; if(live) return Promise.resolve(true); var c=ctx(); if(!c||!navigator.mediaDevices) return Promise.reject(new Error('This phone can’t listen for sound packets.'));
    return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}}).then(function(st){ SR=c.sampleRate; ring=new Float32Array(Math.round(SR*4)); rp=0;
      var src=c.createMediaStreamSource(st), pr=c.createScriptProcessor(4096,1,1), last=0;
      pr.onaudioprocess=function(e){ var d=e.inputBuffer.getChannelData(0); for(var i=0;i<d.length;i++){ ring[rp]=d[i]; rp=(rp+1)%ring.length } var now=Date.now(); if(now-last<700) return; last=now;
        var x=new Float32Array(ring.length); x.set(ring.subarray(rp)); x.set(ring.subarray(0,rp),ring.length-rp);
        decode(x,SR).forEach(function(o){ var k=key(o); if(seen[k]&&now-seen[k]<120000) return; seen[k]=now; if(onPkt) try{ onPkt(o) }catch(err){} }) };
      var mute=c.createGain(); mute.gain.value=0; src.connect(pr); pr.connect(mute); mute.connect(c.destination); live={st:st,src:src,pr:pr}; return true }) }
  function stop(){ if(!live) return; try{ live.pr.disconnect(); live.src.disconnect(); live.st.getTracks().forEach(function(t){ t.stop() }) }catch(e){} live=null }
  window.__sonic.play=play; window.__sonic.listen=listen; window.__sonic.stop=stop; window.__sonic.on=function(){ return !!live };
})();
