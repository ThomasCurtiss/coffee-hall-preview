(function(){
const S=window.SITE||{};
document.querySelectorAll('[data-site]').forEach(el=>{const v=S[el.dataset.site];if(v)el.textContent=v});
document.title=(S.name||'Coffee Hall')+' — '+(S.city||'')+' (draft)';
const hrs=document.getElementById('hours');
if(hrs&&S.hours)hrs.innerHTML=S.hours.map(h=>`<dt>${h[0]}</dt><dd>${h[1]}</dd>`).join('');
const set=(id,v)=>{const e=document.getElementById(id);if(e&&v)e.textContent=v};
set('addr',S.address);set('phone',S.phone);set('email',S.email);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
gsap.registerPlugin(ScrollTrigger);

const chaps=[...document.querySelectorAll('.chap')];
const dots=[...document.querySelectorAll('#dots i')];
const chips=[...document.querySelectorAll('.chip')];
const WIDTH=.14;
function layoutChaps(p){
  let best=0,bo=-1;
  chaps.forEach((c,i)=>{
    const ctr=parseFloat(c.dataset.c);let d=(p-ctr)/WIDTH;
    if(c.dataset.first&&d<0)d=0; if(c.dataset.last&&d>0)d=0;
    const o=Math.max(0,1-Math.pow(Math.abs(d),2.2));
    const y=-d*130;               // text scrolls up with the page, like the reel
    c.style.opacity=o.toFixed(3);
    c.style.transform=`translate3d(0,${y.toFixed(1)}px,0)`;
    c.style.visibility=o<.01?'hidden':'visible';
    if(o>bo){bo=o;best=i}
  });
  dots.forEach((d,i)=>d.classList.toggle('on',i===best));
}
function layoutChips(p){
  const on=Math.max(0,Math.min(1,(p-.84)/.08));
  chips.forEach((c,i)=>{
    const pos=CoffeeScene.toScreen(parseFloat(c.dataset.u),parseFloat(c.dataset.v));
    const k=Math.max(0,Math.min(1,on*1.4-i*.25));
    const x=Math.min(innerWidth-c.offsetWidth-8,Math.max(8,pos.x-c.offsetWidth/2));
    c.style.opacity=k.toFixed(2);
    c.style.transform=`translate3d(${x}px,${pos.y+(1-k)*14}px,0)`;
  });
}
let target=0,shown=0;
ScrollTrigger.create({trigger:'#top',start:'top top',end:'bottom bottom',onUpdate:s=>{target=s.progress;
  gsap.to('.scrollcue',{opacity:target>.03?0:1,duration:.3,overwrite:true})}});
const t0=performance.now();
function loop(now){
  shown+=(target-shown)*(reduce?1:.12);
  CoffeeScene.render(shown,(now-t0)/1000);
  layoutChaps(shown);layoutChips(shown);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
window.__setProgress=v=>{target=v;shown=v};

const bar=document.getElementById('progressBar');
addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;bar.style.width=(scrollY/h*100)+'%'},{passive:true});

if(!reduce){
  gsap.utils.toArray('.rv').forEach(el=>{gsap.from(el,{y:50,opacity:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}})});
  gsap.utils.toArray('.card').forEach((el,i)=>{gsap.from(el,{y:80,opacity:0,rotate:i%2?2:-2,duration:.9,delay:(i%3)*.08,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%'}})});
  gsap.to('.outline-word',{x:-220,ease:'none',scrollTrigger:{trigger:'.about',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.to('.marquee .track',{x:'-=120',ease:'none',scrollTrigger:{trigger:'.marquee',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.to('.brickband',{backgroundPositionX:'-128px',ease:'none',scrollTrigger:{trigger:'body',start:'top top',end:'bottom bottom',scrub:true}});
  if(matchMedia('(hover:hover)').matches){
    document.querySelectorAll('[data-tilt]').forEach(c=>{
      c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;gsap.to(c,{rotationY:x*10,rotationX:-y*10,duration:.4,transformPerspective:800})});
      c.addEventListener('pointerleave',()=>gsap.to(c,{rotationX:0,rotationY:0,duration:.6}));
    });
  }
}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const t=document.querySelector(a.getAttribute('href'));if(!t)return;e.preventDefault();
  t.scrollIntoView({behavior:reduce?'auto':'smooth'});
}));
})();
