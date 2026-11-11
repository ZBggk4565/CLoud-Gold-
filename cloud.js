(function(){
var U='https://eijqkqdjkgfseykghofj.supabase.co';
var K='sb_publishable_1eapR9qprPKILPltpiNwaQ_aevcqLr6';
var LS='cg1',SK='cg_sess',FL='cg_synced';
var set0=Storage.prototype.setItem;
var S=null,CID=null,ready=false,tm=null,ov=null;
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
function push(){
if(!ready||!CID)return Promise.resolve();
var d;try{d=JSON.parse(localStorage.getItem(LS)||'{}')}catch(e){return Promise.resolve()}
return api('company_data?on_conflict=company_id','POST',[{company_id:CID,data:d,updated_at:new Date().toISOString()}],{'Prefer':'resolution=merge-duplicates'}).catch(function(){})
}
Storage.prototype.setItem=function(k,v){set0.apply(this,arguments);if(k===LS&&ready){clearTimeout(tm);tm=setTimeout(push,1500)}};
document.addEventListener('visibilitychange',function(){if(document.hidden){clearTimeout(tm);push()}});
function box(h){if(!ov){ov=document.createElement('div');ov.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:#faf7f0;display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl;font-family:system-ui,Tahoma,Arial,sans-serif;color:#2a2418';document.body.appendChild(ov)}ov.innerHTML=h}
function done(){if(ov){ov.remove();ov=null}}
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
b.onclick=function(){if(!confirm('تسجيل الخروج؟'))return;push().then(function(){localStorage.removeItem(SK);localStorage.removeItem(LS);sessionStorage.removeItem(FL);location.reload()})};
document.body.appendChild(b)
}
function boot(){
box('<p>جاري المزامنة...</p>');
api('profiles?select=company_id,role&user_id=eq.'+S.uid).then(function(a){
if(!a||!a[0]||!a[0].company_id){S=null;localStorage.removeItem(SK);return login('هذا الحساب غير مربوط بشركة')}
CID=a[0].company_id;
if(sessionStorage.getItem(FL)){ready=true;done();out();return}
return api('company_data?select=data&company_id=eq.'+CID).then(function(r){
if(r&&r[0]&&r[0].data&&Object.keys(r[0].data).length){
set0.call(localStorage,LS,JSON.stringify(r[0].data));sessionStorage.setItem(FL,'1');location.reload()
}else{
ready=true;sessionStorage.setItem(FL,'1');push().then(function(){done();out()})
}
})
}).catch(function(){login('تعذّر الاتصال، تحقق من الإنترنت ثم حاول مجدداً')})
}
function start(){if(!S)login();else boot()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
