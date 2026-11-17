(function(){
var U='https://eijqkqdjkgfseykghofj.supabase.co';
var K='sb_publishable_1eapR9qprPKILPltpiNwaQ_aevcqLr6';
var LS='cg1',SK='cg_sess',FL='cg_synced',RV='cg_rev',DY='cg_dirty';
var set0=Storage.prototype.setItem;
var S=null,CID=null,ready=false,tm=null,ov=null,busy=false,lastSig='';
try{S=JSON.parse(localStorage.getItem(SK))}catch(e){}
function H(t){var h={'apikey':K,'Content-Type':'application/json'};if(t)h['Authorization']='Bearer '+t;return h}
function J(r){return r.json().catch(function(){return {}})}
function keep(d){S={at:d.access_token,rt:d.refresh_token,uid:d.user.id,exp:Date.now()+(d.expires_in-60)*1000};set0.call(localStorage,SK,JSON.stringify(S))}
function tok(){
if(!S)return Promise.reject();
if(Date.now()<S.exp)return Promise.resolve(S.at);
return fetch(U+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:H(),body:JSON.stringify({refresh_token:S.rt})}).then(J).then(function(d){if(!d.access_token)throw 0;keep(d);return S.at})
}
function api(p,m,b,x){
return tok().then(function(t){var h=H(t);if(x)for(var k in x)h[k]=x[k];return fetch(U+'/rest/v1/'+p,{method:m||'GET',headers:h,body:b?JSON.stringify(b):undefined})}).then(function(r){if(!r.ok)throw r.status;return J(r)})
}
/* ---- حماية المزامنة: لا كتابة فوق ما تغيّر في السحابة، ولا رفع نسخة فارغة ---- */
function sig(v){return String(v||'').replace(/"tab":\d+,?/g,'')}
function getRev(){return localStorage.getItem(RV)}
function setRev(v){set0.call(localStorage,RV,v)}
function setDirty(v){set0.call(localStorage,DY,v?'1':'0')}
function isDirty(){return localStorage.getItem(DY)==='1'}
function hasData(row){return !!(row&&row.data&&Object.keys(row.data).length)}
function pullRemote(){return api('company_data?select=data,updated_at&company_id=eq.'+CID)}
function adopt(row,note){
var cur=localStorage.getItem(LS);
if(cur&&cur!==JSON.stringify(row.data))set0.call(localStorage,'cg_prev',JSON.stringify({t:Date.now(),d:cur}));
set0.call(localStorage,LS,JSON.stringify(row.data));
setRev(row.updated_at);setDirty(false);
sessionStorage.setItem(FL,'1');
if(note)sessionStorage.setItem('cg_note','1');
location.reload()
}
function conflict(retry){
set0.call(localStorage,'cg_conflict',JSON.stringify({t:Date.now(),d:localStorage.getItem(LS)}));
return pullRemote().then(function(r){
var row=r&&r[0];
if(hasData(row)){adopt(row,true);return}
if(row&&!retry){setRev(row.updated_at);busy=false;return push(true)}
})
}
function push(retry){
if(!ready||!CID||busy||!isDirty())return Promise.resolve();
var raw=localStorage.getItem(LS),d;
try{d=JSON.parse(raw||'{}')}catch(e){return Promise.resolve()}
busy=true;
var rev=getRev(),now=new Date().toISOString(),req;
if(rev)req=api('company_data?company_id=eq.'+CID+'&updated_at=eq.'+encodeURIComponent(rev),'PATCH',{data:d,updated_at:now},{'Prefer':'return=representation'});
else req=api('company_data?on_conflict=company_id','POST',[{company_id:CID,data:d,updated_at:now}],{'Prefer':'resolution=ignore-duplicates,return=representation'});
return req.then(function(a){
if(a&&a[0]){
setRev(a[0].updated_at);lastSig=sig(raw);
if(sig(localStorage.getItem(LS))===lastSig)setDirty(false);else{clearTimeout(tm);tm=setTimeout(function(){push()},500)}
busy=false;return
}
return conflict(retry)
}).catch(function(){}).then(function(){busy=false})
}
function refresh(){
if(!ready||!CID||busy)return Promise.resolve();
if(isDirty())return push();
return pullRemote().then(function(r){
var row=r&&r[0];
if(hasData(row)&&row.updated_at!==getRev())adopt(row,false)
}).catch(function(){})
}
Storage.prototype.setItem=function(k,v){
set0.apply(this,arguments);
if(k===LS&&ready&&sig(v)!==lastSig){setDirty(true);clearTimeout(tm);tm=setTimeout(function(){push()},1500)}
};
document.addEventListener('visibilitychange',function(){
if(document.hidden){clearTimeout(tm);push()}else refresh()
});
setInterval(function(){
if(document.hidden||!ready)return;
var a=document.activeElement,t=a&&a.tagName;
if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')return;
refresh()
},45000);
/* ---- الواجهة ---- */
function box(h){if(!ov){ov=document.createElement('div');ov.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:#faf7f0;display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl;font-family:system-ui,Tahoma,Arial,sans-serif;color:#2a2418';document.body.appendChild(ov)}ov.innerHTML=h}
function done(){if(ov){ov.remove();ov=null}}
function note(){
if(!sessionStorage.getItem('cg_note'))return;
sessionStorage.removeItem('cg_note');
var n=document.createElement('div');
n.textContent='⚠️ تغيّرت البيانات من جهاز آخر فتم تحديثها هنا. نسخة تعديلك الأخير محفوظة احتياطيًا في هذا الهاتف.';
n.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99998;background:#fff3cd;color:#5c4400;padding:10px 12px;font-size:14px;text-align:center;direction:rtl;font-family:system-ui,Tahoma,Arial,sans-serif;border-bottom:1px solid #e0c36a';
n.onclick=function(){n.remove()};
document.body.appendChild(n);
setTimeout(function(){n.remove()},15000)
}
function login(msg){
var st='width:100%;padding:12px;margin:6px 0;border:1px solid #e6dcc3;border-radius:8px;font-size:16px;direction:ltr;box-sizing:border-box';
box('<div style="width:100%;max-width:360px"><h2 style="text-align:center">Cloud Gold ☁️</h2><input id="cge" type="email" placeholder="البريد الإلكتروني" style="'+st+'"><input id="cgp" type="password" placeholder="كلمة المرور" style="'+st+'"><button id="cgb" style="width:100%;padding:12px;margin-top:8px;border:0;border-radius:8px;background:#8a6508;color:#fff;font-size:16px;font-weight:700">دخول</button><p id="cgm" style="color:#c62828;text-align:center">'+(msg||'')+'</p></div>');
document.getElementById('cgb').onclick=function(){
var e=document.getElementById('cge').value.trim(),p=document.getElementById('cgp').value;
document.getElementById('cgm').textContent='جاري الدخول...';
fetch(U+'/auth/v1/token?grant_type=password',{method:'POST',headers:H(),body:JSON.stringify({email:e,password:p})}).then(J).then(function(d){
if(d.access_token){keep(d);boot()}else login('البريد أو كلمة المرور غير صحيحة')
}).catch(function(){login('تعذّر الاتصال بالإنترنت')})
}
}
function out(){
var b=document.createElement('button');b.textContent='خروج ☁';
b.style.cssText='position:fixed;top:6px;left:6px;z-index:60;font-size:11px;padding:3px 8px;border:1px solid #e6dcc3;border-radius:10px;background:#fff;color:#7a6f5a;opacity:.8';
b.onclick=function(){if(!confirm('تسجيل الخروج؟'))return;clearTimeout(tm);push().then(function(){
if(isDirty()&&!confirm('لم تُحفظ آخر تعديلاتك في السحابة (قد يكون الإنترنت ضعيفًا). الخروج الآن قد يفقدها. هل تخرج رغم ذلك؟'))return;
localStorage.removeItem(SK);localStorage.removeItem(LS);localStorage.removeItem('cg_role');localStorage.removeItem(RV);localStorage.removeItem(DY);sessionStorage.removeItem('cg_as');sessionStorage.removeItem(FL);location.reload()})};
document.body.appendChild(b)
}
function go(){lastSig=sig(localStorage.getItem(LS));ready=true;if(window.cgApply)window.cgApply();done();out();note()}
function boot(){
box('<p>جاري المزامنة...</p>');
api('profiles?select=company_id,role&user_id=eq.'+S.uid).then(function(a){
if(!a||!a[0]||!a[0].company_id){S=null;localStorage.removeItem(SK);localStorage.removeItem('cg_role');return login('هذا الحساب غير مربوط بشركة')}
CID=a[0].company_id;var R=String(a[0].role||'').toLowerCase(),role=/both|معا/.test(R)?'both':(/super|oper|مسي|مشغل/.test(R)?'supervisor':'manager');set0.call(localStorage,'cg_role',role);
return pullRemote().then(function(r){
var row=r&&r[0],rev=getRev(),dirty=isDirty();
if(hasData(row)){
if(row.updated_at===rev){go();if(dirty)push();return}
if(!rev||!dirty){adopt(row,false);return}
set0.call(localStorage,'cg_conflict',JSON.stringify({t:Date.now(),d:localStorage.getItem(LS)}));
adopt(row,true);return
}
if(row)setRev(row.updated_at);else localStorage.removeItem(RV);
setDirty(true);go();push()
})
}).catch(function(){login('تعذّر الاتصال، تحقق من الإنترنت ثم حاول مجدداً')})
}
function start(){if(!S)login();else boot()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
