import{u as $,_ as k}from"./PostList-DmzZ6tgL.js";import{u as S,r as s,c as w,e as a,a as i,b as n,h as P,v as U,t as V,i as f,s as R,_ as A,o as D,p as b,d as g,q as F,x as I,y as L}from"./index-BSYZ5ZA2.js";import{A as M}from"./Avatar-Ox8f1Xwj.js";import"./DisplayAvatar-B4vZ9VTa.js";const T={class:"create-post"},q=["disabled"],z={key:0},O={key:1},j={key:0,class:"error"},G={__name:"CreatePost",setup(B){const v=S(),p=$(),t=s(""),o=s(""),c=s(""),d=s(!1),y=w(()=>t.value.trim().length>0),l=async()=>{var _;try{if(c.value="",d.value=!0,!((_=v.user)!=null&&_.id))throw new Error("Пользователь не авторизован");const{data:e,error:r}=await R.from("posts").insert({user_id:v.user.id,title:o.value.trim()||"Без названия",username:v.user.username,text:t.value.trim()}).select("*").single();if(r)throw r;p.posts=[e,...p.posts],t.value="",o.value=""}catch(e){c.value=e.message||"Ошибка при создании поста",console.error("Post creation error:",e)}finally{d.value=!1}};return(_,e)=>(a(),i("div",T,[e[2]||(e[2]=n("h2",null," Создать пост: ",-1)),P(n("input",{type:"text","onUpdate:modelValue":e[0]||(e[0]=r=>o.value=r),placeholder:"Заголовок",class:"post-input",maxlength:"60"},null,512),[[U,o.value]]),P(n("textarea",{"onUpdate:modelValue":e[1]||(e[1]=r=>t.value=r),placeholder:"Что у вас нового?",rows:"3",class:"post-textarea",maxlength:"1000"},null,512),[[U,t.value]]),n("button",{onClick:l,disabled:!y.value||d.value,class:"post-button"},[d.value?(a(),i("span",O,"Публикация...")):(a(),i("span",z,"Опубликовать"))],8,q),c.value?(a(),i("p",j,V(c.value),1)):f("",!0)]))}},H={class:"profile setting_avatar"},J={key:0,class:"settings_icon"},K={class:"profile-info"},Q={class:"profile-text"},W={class:"profile-name"},X={key:0},Y={key:0,class:"create-and-posts"},Z={__name:"ProfilePage",setup(B){const v=F(),p=S(),t=w(()=>p.user),o=s(v.params.username),c=s(o.value),d=s(""),y=s(""),l=s(""),_=s(""),e=$(),r=s(!1),x=w(()=>e.getUserPosts(l.value)),C=()=>{const u=new URL(window.location.href);u.searchParams.set("username",o.value),window.history.pushState({},"",u.href),E()},E=async()=>{const u=window.location,h=u.pathname.substring(u.pathname.lastIndexOf("/")+1),m=await p.getUserByUsername(o.value);o.value=h,d.value=m.email,y.value=m.avatar_url,l.value=m.id,await N()},N=async()=>{try{r.value=!0,await e.fetchUserPosts(l.value,{forceRefresh:!0})}catch(u){_.value=u.message||"Ошибка загрузки постов"}finally{r.value=!1}};return D(async()=>{C()}),(u,h)=>{const m=I("router-link");return a(),i("section",null,[n("section",H,[t.value?(a(),i("div",J,[l.value===t.value.id?(a(),b(m,{key:0,to:"/settings"},{default:L(()=>h[0]||(h[0]=[n("span",{class:"material-icons"},"⚙️",-1)])),_:1})):f("",!0)])):f("",!0),n("div",K,[g(M,{size:50,username:c.value},null,8,["username"]),n("div",Q,[n("h2",W,V(c.value),1)])])]),t.value?(a(),i("div",X,[l.value===t.value.id?(a(),i("section",Y,[g(G),g(k,{posts:x.value},null,8,["posts"])])):l.value?(a(),b(k,{key:1,posts:x.value},null,8,["posts"])):f("",!0)])):f("",!0)])}}},oe=A(Z,[["__scopeId","data-v-24c0132a"]]);export{oe as default};
