import{f as c,$ as m,j as p,t as d,o as t,l as g,G as f,C as v,Z as h,B as w,c as y}from"./index-QomUHjFO.js";import{u as U}from"./errors-ptkwsH4S-CVFA_oyv.js";const _=f("userLogin",()=>{const i=U(),o=v(),e=h();async function a(r,n){const{error:s}=await y.auth.signInWithPassword({email:r,password:n});s?(console.error("Ошибка при входе после авторизации:",s),i.setErrors("Неверный логин или пароль")):(console.log("Пользователь успешно вошел в систему:",r),await e.getUser(),o.push("/"))}return{loginUser:a}}),b={class:"form"},k={__name:"LoginPage",setup(i){const o=_(),e=c(""),a=c(""),r=c(o.errorMessages),n=async()=>{try{await o.loginUser(e.value,a.value)}catch(s){console.error(s)}};return(s,l)=>(w(),m("div",b,[p(t("input",{type:"email",id:"email","onUpdate:modelValue":l[0]||(l[0]=u=>e.value=u),placeholder:"Почта"},null,512),[[d,e.value]]),p(t("input",{type:"password",id:"password","onUpdate:modelValue":l[1]||(l[1]=u=>a.value=u),placeholder:"Пароль"},null,512),[[d,a.value]]),t("button",{onClick:n,class:"form__btn"},"Войти"),t("pre",null,g(r.value),1)]))}};export{k as default};
