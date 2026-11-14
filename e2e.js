// AwareBC end-to-end locked chat (by Josh Singer): every message is locked on the sender's phone for each person in the chat
// (1-to-1 and groups). The server only stores the locked text and can't open it. Each phone has its own lock pair; the unlock
// half never leaves the phone (it is included in your encrypted settings backup when you sign in with Google).
(function(){
  var K='aw-e2e', S=crypto.subtle, enc=new TextEncoder(), dec=new TextDecoder();
  function b64(u){ u=new Uint8Array(u); var s=''; for(var i=0;i<u.length;i++) s+=String.fromCharCode(u[i]); return btoa(s) }
  function ub(s){ var b=atob(s), u=new Uint8Array(b.length); for(var i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u }
  var me=null; // {pub:b64 raw, priv:CryptoKey}
  var ready=(function(){ var j=null; try{ j=JSON.parse(localStorage.getItem(K)||'null') }catch(e){}
    if(j&&j.pub&&j.priv) return S.importKey('jwk',j.priv,{name:'ECDH',namedCurve:'P-256'},false,['deriveKey']).then(function(k){ me={pub:j.pub,priv:k}; return me });
    return S.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveKey']).then(function(kp){ return Promise.all([S.exportKey('raw',kp.publicKey),S.exportKey('jwk',kp.privateKey)]).then(function(x){
      var pub=b64(x[0]); try{ localStorage.setItem(K,JSON.stringify({pub:pub,priv:x[1]})) }catch(e){} me={pub:pub,priv:kp.privateKey}; return me }) }) })().catch(function(){ return null });
  var WK={}; // shared lock with another phone's public half
  function shared(pub){ if(WK[pub]) return WK[pub]; return WK[pub]=S.importKey('raw',ub(pub),{name:'ECDH',namedCurve:'P-256'},false,[]).then(function(pk){ return S.deriveKey({name:'ECDH',public:pk},me.priv,{name:'AES-GCM',length:256},false,['encrypt','decrypt']) }) }
  // lock {x,lat,lon} for every member: [{id,pk}]
  function lock(body,members,myId){ return ready.then(function(m){ if(!m) throw new Error('Locks not ready');
    var list=members.filter(function(x){ return x.pk }); if(!list.some(function(x){ return x.id===myId })) list.push({id:myId,pk:m.pub});
    return S.generateKey({name:'AES-GCM',length:256},true,['encrypt']).then(function(mk){ var iv=crypto.getRandomValues(new Uint8Array(12));
      return Promise.all([S.encrypt({name:'AES-GCM',iv:iv},mk,enc.encode(JSON.stringify(body))),S.exportKey('raw',mk)]).then(function(r){ var k={};
        return Promise.all(list.map(function(x){ return shared(x.pk).then(function(w){ var wi=crypto.getRandomValues(new Uint8Array(12)); return S.encrypt({name:'AES-GCM',iv:wi},w,r[1]).then(function(ct){ var o=new Uint8Array(12+ct.byteLength); o.set(wi); o.set(new Uint8Array(ct),12); k[x.id]=b64(o) }) }).catch(function(){}) }))
          .then(function(){ return JSON.stringify({v:1,p:m.pub,iv:b64(iv),ct:b64(r[0]),k:k}) }) }) }) }) }
  function unlock(e,myId){ return ready.then(function(m){ var j=JSON.parse(e); var w=j.k&&j.k[myId]; if(!m||!w) throw new Error('not for me'); var wb=ub(w);
    return shared(j.p).then(function(sk){ return S.decrypt({name:'AES-GCM',iv:wb.slice(0,12)},sk,wb.slice(12)) }).then(function(raw){ return S.importKey('raw',raw,{name:'AES-GCM'},false,['decrypt']) })
      .then(function(mk){ return S.decrypt({name:'AES-GCM',iv:ub(j.iv)},mk,ub(j.ct)) }).then(function(pt){ return JSON.parse(dec.decode(pt)) }) }) }
  window.__e2e={ ready:ready, pub:function(){ return me&&me.pub }, lock:lock, unlock:unlock };
})();
