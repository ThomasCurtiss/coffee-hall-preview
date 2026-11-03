/* Scroll-scrubbed photoreal image sequence (generated video clips -> 200 frames) on canvas.
   Falls back to the illustrated canvas scene if frames fail to load. */
(function(){
const N=200, PATH=i=>`assets/seq/f${String(i+1).padStart(3,'0')}.jpg`;
const cv=document.getElementById('scene'),ctx=cv.getContext('2d');
const imgs=new Array(N);let loaded=0,ready=false,failed=false;
let W=0,H=0,dpr=1;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
function resize(){dpr=Math.min(devicePixelRatio||1,2);const r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);if(window.CoffeeIllustrated)CoffeeIllustrated.resize()}
addEventListener('resize',resize);resize();
// load frames: first, last, then everything
const order=[...Array(N).keys()];
order.sort((a,b)=>(a%10===0?-1:0)-(b%10===0?-1:0));
order.forEach(i=>{const im=new Image();im.onload=()=>{imgs[i]=im;loaded++;
  if(loaded>=N*.98){ready=true}
  const f=document.getElementById('loadfill');if(f)f.style.width=(loaded/N*100)+'%';
  if(loaded===N){document.documentElement.classList.add('seq-ready')}
};im.onerror=()=>{failed=true};im.src=PATH(i)});
// focal x of the subject in each clip (0..1 of frame width) and its vertical centre
function focal(p){ // clip1 .60 -> clip2 .58 -> clip3 .82
  const a=clamp((p-.30)/.08),b=clamp((p-.62)/.08);
  return .60+(.58-.60)*a+(.82-.58)*b;
}
let T={x:0,y:0,s:1};
function transform(p){
  const mob=W<820;const FW=1024,FH=576;
  let s,sw,sh,x,y;
  if(mob){sh=H*.78;s=sh/FH;sw=FW*s;y=H*.02;
    const fx=focal(p);x=clamp(W*.5-fx*sw,W-sw,0)}
  else{const z=1+.2*clamp((p-.62)/.1);s=Math.max(W/FW,H/FH)*1.02*z;sw=FW*s;sh=FH*s;y=(H-sh)/2;
    const fx=focal(p);const target=W*(fx>.75?.8:.66);x=clamp(target-fx*sw,W-sw,0)}
  T={x,y,s,sw,sh};return T;
}
function drawFrame(im,a){
  if(!im)return;const t=T;ctx.globalAlpha=a;
  ctx.drawImage(im,t.x,t.y,t.sw,t.sh);
  // extend edges if the frame doesn't cover the canvas (mobile)
  if(t.y+t.sh<H){ctx.drawImage(im,0,im.height-2,im.width,2,t.x,t.y+t.sh-1,t.sw,H-(t.y+t.sh)+1)}
  if(t.y>0){ctx.drawImage(im,0,0,im.width,2,t.x,0,t.sw,t.y+1)}
  ctx.globalAlpha=1;
}
function render(p,t){
  if(failed&&loaded<N*.5&&window.CoffeeIllustrated){CoffeeIllustrated.render(p,t);return}
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.fillStyle='#f1e4cf';ctx.fillRect(0,0,W,H);
  const f=clamp(p)*(N-1),i0=Math.floor(f),a=f-i0;
  transform(p);
  // nearest loaded frames
  const get=i=>{i=Math.min(N-1,Math.max(0,i));for(let d=0;d<N;d++){if(imgs[i-d])return imgs[i-d];if(imgs[i+d])return imgs[i+d]}return null};
  const A=get(i0),B=get(i0+1);
  drawFrame(A,1);if(a>.01)drawFrame(B,a);
  // soft cream wash on the left so headlines always read
  if(W>=820){const g=ctx.createLinearGradient(0,0,W*.5,0);g.addColorStop(0,'rgba(244,234,219,.85)');g.addColorStop(1,'rgba(244,234,219,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W*.5,H)}
}
// map normalized video coords (u,v 0..1) to CSS px on the stage (for floating chips)
function toScreen(u,v){return {x:T.x+u*T.sw,y:T.y+v*T.sh}}
window.CoffeeScene={render,resize,toScreen,get ready(){return ready}};
})();
