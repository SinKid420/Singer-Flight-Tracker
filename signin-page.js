// AwareBC sign-in page for the Android app (by Josh Singer): Google signs you in here in the phone's browser,
// then the app gets a one-time code (good for 3 minutes) and links your account. Your Google token never goes into the app.
(function(){
  var GCLIENT='', RS='https://awarebc.aware-bc.workers.dev', m=document.getElementById('m');
  function say(t){ m.textContent=t }
  if(!GCLIENT){ say('Google sign-in is being set up. Please try again soon.'); return }
  var s=document.createElement('script'); s.src='https://accounts.google.com/gsi/client'; s.async=true; s.onerror=function(){ say('Google sign-in could not load. Check your signal and try again.') };
  s.onload=function(){ google.accounts.id.initialize({client_id:GCLIENT,ux_mode:'popup',auto_select:false,itp_support:true,callback:function(r){ say('Signing you in…');
      fetch(RS+'/auth/code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cred:r.credential})}).then(function(x){ return x.json() }).then(function(j){
        if(!j||!j.code) throw new Error(j&&j.error||'Sign-in failed');
        var u='awarebc://signin?code='+encodeURIComponent(j.code)+'&first='+encodeURIComponent(j.first||''); document.getElementById('back').href=u; say('Done. Opening AwareBC…'); location.href=u })
      .catch(function(e){ say((e&&e.message)||'Sign-in failed. Try again.') }) }});
    google.accounts.id.renderButton(document.getElementById('g'),{type:'standard',theme:'outline',size:'large',shape:'pill',text:'continue_with',logo_alignment:'center',width:300}) };
  document.head.appendChild(s);
})();
