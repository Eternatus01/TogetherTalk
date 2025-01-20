import{d as D,a as E,s as v,_ as P,e as f,f as B,w as k,o as h,c as _,r as b,g as w,b as p,t as y,h as C,i as F}from"./index-B_YhoeON.js";import{u as V}from"./errors-ptkwsH4S.js";const q=D("changeUser ",()=>{const a=V(),s=E(),i=async(r,e)=>{const{error:t}=await v.from("users").update({avatar_url:e}).eq("id",r);if(s.avatar_url=e,t)throw new Error("Ошибка при обновлении URL аватара: "+t.message)},o=async(r,e)=>{try{const{data:t,error:l}=await v.from("users").update({birthdate:e}).eq("id",r);if(l)throw l;return t}catch(t){throw console.error("Ошибка при изменении даты рождения:",t),t}},n=async r=>{if(r.length<3)return a.setErrors("Имя пользователя должно содержать не менее 3 символов."),!1;const{data:e,error:t}=await v.from("users").select("username").eq("username",r);return t?(a.setErrors("Ошибка при проверке имени пользователя."),console.error("Ошибка при проверке имени пользователя:",t),!1):e.length>0?(a.setErrors("Имя пользователя уже занято."),!1):!0},u=r=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r)?!0:(a.setErrors("Введите корректный адрес электронной почты."),!1),d=async(r,e)=>{const{data:t,error:l}=await v.from("users").select("username, friends");if(l){console.error("Ошибка при получении пользователей:",l);return}for(const g of t){const U=g.friends||[];if(U.includes(r)){const A=U.map(S=>S===r?e:S),{error:x}=await v.from("users").update({friends:A}).eq("username",g.username);x&&console.error("Ошибка при обновлении списка друзей у пользователя:",x)}}};return{changeUsername:async(r,e)=>{if(!await n(e))return;const{data:t,error:l}=await v.from("users").update({username:e}).eq("username",r).select();if(console.log("то что пришло ",t[0]),l){a.setErrors("Ошибка при изменении имени пользователя"),console.error("Ошибка при изменении имени пользователя:",l);return}await d(r,e),a.clearErrors()},changeEmail:async(r,e)=>{if(!u(e))return;const{error:t}=await v.auth.updateUser({email:e});if(t){a.setErrors("Ошибка при изменении почты пользователя"),console.error("Ошибка при изменении почты пользователя:",t);return}const{error:l}=await v.from("users").update({email:e}).eq("email",r).select();if(l){a.setErrors("Ошибка при изменении почты пользователя"),console.error("Ошибка при изменении почты пользователя:",l);return}a.clearErrors()},updateAvatarUrl:i,changeBirthdate:o}}),T={key:0,alt:"Аватар",height:"100px",width:"100px",class:"avatar"},j={key:1,src:"https://kawdmbqsvrrmvhymflnx.supabase.co/storage/v1/object/public/avatars/avatars/default-avatar-icon-of-social-media-user-vector.jpg",alt:"Аватар",height:"100px",width:"100px",class:"avatar"},N={__name:"DisplayAvatar",setup(a){const s=E(),i=f(()=>s.avatar_url);return(o,n)=>{const u=B("lazy");return i.value?k((h(),_("img",T,null,512)),[[u,i.value]]):(h(),_("img",j))}}},z=P(N,[["__scopeId","data-v-a7274546"]]),I={__name:"AvatarUploader",setup(a){const s=E(),i=q(),o=f(()=>s.user_id);f(()=>s.status);const n=f(()=>s.avatar_url),u=b(null),d=c=>{u.value=c.target.files[0]},m=async()=>{try{if(n.value){const l=`avatars/${o.value}/${n.value.split("/").pop()}`,{error:g}=await v.storage.from("avatars").remove([l]);if(g)throw g}const c=`avatars/${o.value}/${u.value.name}`,{data:r,error:e}=await v.storage.from("avatars").upload(c,u.value,{upsert:!0});if(e)throw e;const t=`https://kawdmbqsvrrmvhymflnx.supabase.co/storage/v1/object/public/avatars/${r.path}`;await i.updateAvatarUrl(o.value,t),u.value=null}catch(c){console.error("Ошибка загрузки аватара:",c)}};return(c,r)=>(h(),_("div",null,[w(z),p("div",null,[p("input",{type:"file",onChange:d,accept:"image/*"},null,32),p("button",{onClick:m},"Загрузить аватар")])]))}},L={key:0},M=["type","name"],R={style:{color:"red"}},$={__name:"EditableField",props:{label:String,value:String,inputType:String,name:String,error:String},emits:["save"],setup(a,{emit:s}){const i=s,o=b(!1),n=b(""),u=()=>{i("save",n.value),o.value=!1,n.value=""};return(d,m)=>(h(),_("div",null,[p("p",null,y(a.label)+": "+y(a.value?a.value:"Неизвестно"),1),p("button",{onClick:m[0]||(m[0]=c=>o.value=!o.value)},y(a.value?"Изменить":"Добавить"),1),o.value?(h(),_("div",L,[k(p("input",{"onUpdate:modelValue":m[1]||(m[1]=c=>n.value=c),type:a.inputType,name:a.name},null,8,M),[[C,n.value]]),p("button",{onClick:u},"Сохранить")])):F("",!0),p("pre",R,y(a.error),1)]))}},J={__name:"PersonalProfilePage",setup(a){const s=E(),i=q(),o=f(()=>s.user_id),n=f(()=>s.username),u=f(()=>s.birthdate),d=b(""),m=async r=>{try{await i.changeUsername(n.value,r)}catch(e){d.value=e.message}},c=async r=>{try{await i.changeBirthdate(o.value,r)}catch(e){d.value=e.message}};return(r,e)=>(h(),_("section",null,[w(I),w($,{label:"Никнейм",value:n.value,inputType:"text",name:"username",error:d.value,onSave:m},null,8,["value","error"]),w($,{label:"Дата рождения",value:u.value,inputType:"date",name:"birthdate",error:d.value,onSave:c},null,8,["value","error"])]))}};export{J as default};
