import{f as M,r as h,u as $,c as g,s as _,e as c,a as v,b as i,y as D,p as V,t as k,_ as A,h as F,v as R,i as L,o as U,z as S,d as b,F as q,j as E,A as z,l as T,B as G}from"./index-CpXpfZ6u.js";import{A as H}from"./Avatar-CsIOmtyj.js";import{_ as J}from"./DisplayAvatar-DT18U7jm.js";const j=M("posts",()=>{const o=h([]),s=h({}),n=h(null),a=5*60*1e3,m=$(),l=g(()=>{var t;return(t=m.user)==null?void 0:t.id}),u=g(()=>[...o.value].sort((t,e)=>new Date(e.created_at)-new Date(t.created_at))),d=g(()=>t=>{var e;return((e=s.value[t])==null?void 0:e.posts)||[]}),p=t=>t.filter(e=>(e==null?void 0:e.id)&&(e==null?void 0:e.user_id)&&(e==null?void 0:e.title)&&(e==null?void 0:e.text)&&(e==null?void 0:e.created_at));return{posts:o,userPosts:s,lastFetch:n,sortedPosts:u,getUserPosts:d,fetchPosts:async(t={})=>{try{const{page:e=1,limit:f=10,forceRefresh:y=!1}=t;if(!y&&n.value&&Date.now()-n.value<a)return u.value;const{data:P,error:x}=await _.from("posts").select("*").order("created_at",{ascending:!1}).range((e-1)*f,e*f-1);if(x)throw x;return o.value=P,n.value=Date.now(),p(P)}catch(e){throw console.error("Error fetching posts:",e),e}},fetchUserPosts:async(t,e={})=>{var f;try{const{forceRefresh:y=!1}=e;if(!t)throw new Error("User ID is required");if(!y&&((f=s.value[t])!=null&&f.lastFetch)&&Date.now()-s.value[t].lastFetch<a)return s.value[t].posts;const{data:P,error:x}=await _.from("posts").select("*").eq("user_id",t).order("created_at",{ascending:!1});if(x)throw x;const C=p(P);return s.value[t]={posts:C,lastFetch:Date.now()},C}catch(y){throw console.error(`Error fetching posts for user ${t}:`,y),y}},createPost:async t=>{try{const{data:e,error:f}=await _.from("posts").insert(t).select("*").single();if(f)throw f;return o.value=[e,...o.value],s.value[e.user_id]?s.value[e.user_id].posts=[e,...s.value[e.user_id].posts]:s.value[e.user_id]={posts:[e],lastFetch:Date.now()},e}catch(e){throw console.error("Error creating post:",e),e}},reset:()=>{o.value=[],s.value={},n.value=null},addLike:async t=>{try{if(t.likes.includes(l.value)){const e=t.likes.filter(y=>y!==l.value),{error:f}=await _.from("posts").update({likes:e}).eq("id",t.id)}else{const e=[...t.likes,l.value],{error:f}=await _.from("posts").update({likes:e}).eq("id",t.id)}}catch(e){console.error(e)}},fetchComments:async t=>{try{const{data:e,error:f}=await _.from("comments").select("*").eq("id_post",t).order("created_at",{ascending:!1});return e}catch(e){console.error(e)}},addDislike:async t=>{try{if(t.dislike.includes(l.value)){const e=t.likes.filter(f=>f!==l.value);await _.from("posts").update({dislike:e}).eq("id",t.id)}else{const e=[...t.dislike,l.value];await _.from("posts").update({dislike:e}).eq("id",t.id)}}catch(e){console.error(e)}}}}),K={class:"info"},Q={class:"info-user"},W={class:"username"},X={class:"date"},B={__name:"PostUserInfo",props:{post:Object,username:String,date:String},setup(o){const s=$(),n=o,a=m=>{const l={year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"};return new Date(m).toLocaleDateString("ru-RU",l)};return(m,l)=>{var u;return c(),v("div",K,[i("div",Q,[((u=D(s).user)==null?void 0:u.username)===n.username?(c(),V(J,{key:0})):(c(),V(H,{key:1,username:n.username},null,8,["username"])),i("span",W,k(n.username||"Unknown User"),1)]),i("span",X,k(a(n.date)),1)])}}},Y={class:"create-post"},Z=["disabled"],I={key:0},ee={key:1},se={key:0,class:"error"},te={__name:"CreateComment",props:{post:Object},setup(o){const s=$(),n=h(""),a=h(""),m=h(!1),l=g(()=>n.value.trim().length>0),u=o,d=async()=>{var p;try{if(a.value="",m.value=!0,!((p=s.user)!=null&&p.id))throw new Error("Пользователь не авторизован");const{data:r,error:w}=await _.from("comments").insert({id_post:u.post.id,username:s.user.username,content:n.value.trim()}).select("*").single();if(w)throw w;n.value=""}catch(r){a.value=r.message||"Ошибка при создании поста",console.error("Post creation error:",r)}finally{m.value=!1}};return(p,r)=>(c(),v("div",Y,[F(i("textarea",{"onUpdate:modelValue":r[0]||(r[0]=w=>n.value=w),placeholder:"Что вы думаете о данном посте?",rows:"3",class:"post-textarea",maxlength:"500"},null,512),[[R,n.value]]),i("button",{onClick:d,disabled:!l.value||m.value,class:"post-button"},[m.value?(c(),v("span",ee,"Публикация...")):(c(),v("span",I,"Опубликовать"))],8,Z),a.value?(c(),v("p",se,k(a.value),1)):L("",!0)]))}},oe=A(te,[["__scopeId","data-v-4fa334f4"]]),ne={class:"comments"},ae={class:"comment-content"},re={__name:"CommentsList",props:{post:Object},setup(o){const s=j(),n=h([]),a=h(!1),m=h(null),l=o;let u;return U(async()=>{try{a.value=!0,n.value=await s.fetchComments(l.post.id),u=_.channel("public-comments").on("postgres_changes",{event:"*",schema:"public",table:"comments"},async()=>{n.value=await s.fetchComments(l.post.id)}).subscribe()}catch(d){m.value="Не удалось загрузить комментарии",console.error(d)}finally{a.value=!1}}),S(()=>{u&&_.removeChannel(u)}),(d,p)=>(c(),v("div",ne,[b(oe,{post:l.post},null,8,["post"]),p[0]||(p[0]=i("h2",null,"Комментарии",-1)),(c(!0),v(q,null,E(n.value,r=>(c(),v("div",{key:r.id,class:"comment"},[i("div",null,[b(B,{post:l.post,username:r.username,date:r.created_at},null,8,["post","username","date"])]),i("div",ae,k(r.content),1)]))),128))]))}},le={class:""},ie={class:"post-info"},ce={class:"post-content-title"},ue={class:"grades"},de={class:"likes"},pe={key:1,class:"btn_like",style:{"user-select":"none"}},me={class:"likes"},ve={key:1,class:"btn_like",style:{"user-select":"none"}},N={__name:"Post",props:{post:Object,index:Number,expands:Array,posts:Array,full:{type:Boolean,default:!1}},setup(o){const s=o,n=j(),a=$(),m=g(()=>a.isAuthenticated),l=g(()=>{var d;return((d=a.user)==null?void 0:d.id)||null}),u=h(s.posts.map(()=>!1));return(d,p)=>(c(),v("div",le,[i("section",ie,[b(B,{post:s.post,username:s.post.username||"Unknown",date:s.post.created_at},null,8,["post","username","date"])]),i("div",ce,[i("strong",null,k(s.post.title),1)]),i("div",{class:z(["post-content",{expand:u.value[o.index]||s.full,full:s.full}])},k(s.post.text),3),s.full?L("",!0):F((c(),v("div",{key:0,class:"post-content-btn",onClick:p[0]||(p[0]=()=>u.value[o.index]=!u.value[o.index])},k(u.value[o.index]?"Свернуть":"Развернуть"),513)),[[T,s.post.text.length>300]]),i("section",ue,[i("section",de,[i("p",null,k(s.post.likes.length),1),m.value?(c(),v("button",{key:0,class:"btn_like",onClick:p[1]||(p[1]=r=>D(n).addLike(s.post))},k(s.post.likes.includes(l.value)?"❤️":"🤍"),1)):(c(),v("div",pe,"❤️"))]),i("section",me,[i("p",null,k(s.post.dislike.length),1),m.value?(c(),v("button",{key:0,class:"btn_like",onClick:p[2]||(p[2]=r=>D(n).addDislike(s.post))},k(s.post.dislike.includes(l.value)?"👎":"👎🏻"),1)):(c(),v("div",ve,"👎"))])])]))}},fe={class:"postView_inner"},_e={__name:"PostView",props:{post:Object,index:Number,expands:Array,posts:Array,togglePostView:Function},setup(o){const s=o;return U(()=>{document.body.classList.add("no-scroll")}),S(()=>{document.body.classList.remove("no-scroll")}),(n,a)=>(c(),v("div",{class:"postView_bg",onClick:a[2]||(a[2]=m=>o.togglePostView(s.post.id))},[i("div",{class:"postView container",onClick:a[1]||(a[1]=G(()=>{},["stop"]))},[i("div",{class:"postView_close",onClick:a[0]||(a[0]=m=>o.togglePostView(s.post.id))},"×"),i("div",fe,[b(N,{post:o.post,index:o.index,posts:o.posts,full:!0},null,8,["post","index","posts"]),b(re,{post:o.post},null,8,["post"])])])]))}},he=A(_e,[["__scopeId","data-v-5f782cd3"]]),ke=["onClick"],Ce={__name:"PostList",props:{posts:Array},setup(o){const s=o,n=h({}),a=h(!1),m=d=>{n.value[d]=!n.value[d],a.value=!a.value},l=d=>{const p=s.posts.findIndex(r=>r.id===d.new.id);p!==-1?s.posts[p]=d.new:s.posts.unshift(d.new)};let u;return U(async()=>{u=_.channel("public-posts").on("postgres_changes",{event:"*",schema:"public",table:"posts"},d=>{l(d)}).subscribe()}),S(()=>{u&&_.removeChannel(u)}),(d,p)=>(c(),v("section",null,[(c(!0),v(q,null,E(o.posts,(r,w)=>(c(),v("div",{key:r.id,class:"post"},[b(N,{post:r,index:w,posts:o.posts},null,8,["post","index","posts"]),i("button",{onClick:O=>m(r.id),class:"btn_comments"},"Комментарии",8,ke),n.value[r.id]?(c(),V(he,{key:0,post:r,index:w,posts:o.posts,togglePostView:()=>m(r.id)},null,8,["post","index","posts","togglePostView"])):L("",!0)]))),128))]))}};export{Ce as _,j as u};
