/* Procedural coffee scene, drawn on <canvas>, driven by scroll progress p (0..1).
   Chapter 1 (0-.34): a bean splits in two, grounds burst.
   Chapter 2 (.34-.68): brass spout lowers, coffee pours into a cup, splash.
   Chapter 3 (.68-1): cup centers, latte art, steam. */
(function(){
const cv=document.getElementById('scene'),ctx=cv.getContext('2d');
let W=0,H=0,dpr=1;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const sm=x=>{x=clamp(x);return x*x*(3-2*x)};
const seg=(p,a,b)=>sm((p-a)/(b-a));
const lerp=(a,b,t)=>a+(b-a)*t;
function rnd(i){const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s)}

function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2);
  const r=cv.getBoundingClientRect();W=r.width;H=r.height;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
}
window.addEventListener('resize',resize);resize();

function bean(x,y,s,rot,split,flip){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);
  const g=ctx.createRadialGradient(-s*.3,-s*.4,s*.1,0,0,s*1.1);
  g.addColorStop(0,'#a8683f');g.addColorStop(.45,'#6b3a1f');g.addColorStop(1,'#26110a');
  ctx.fillStyle=g;
  ctx.beginPath();
  if(flip){ctx.ellipse(0,0,s*.72,s,0,-Math.PI/2,Math.PI/2)}
  else{ctx.ellipse(0,0,s*.72,s,0,Math.PI/2,Math.PI*1.5)}
  // flat cut edge with crease
  ctx.bezierCurveTo(s*.12*(flip?-1:1),s*.4,-s*.12*(flip?-1:1),-s*.4,0,-s);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,220,180,.18)';ctx.lineWidth=s*.04;ctx.stroke();
  ctx.restore();
}
function wholeBean(x,y,s,rot){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);
  const g=ctx.createRadialGradient(-s*.3,-s*.4,s*.1,0,0,s*1.15);
  g.addColorStop(0,'#b0713f');g.addColorStop(.45,'#6b3a1f');g.addColorStop(1,'#26110a');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,s*.72,s,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#1b0b05';ctx.lineWidth=s*.07;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,-s*.92);ctx.bezierCurveTo(s*.28,-s*.35,-s*.28,s*.35,0,s*.92);ctx.stroke();
  ctx.fillStyle='rgba(255,235,200,.25)';ctx.beginPath();ctx.ellipse(-s*.3,-s*.45,s*.12,s*.3,.5,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function cup(cx,cy,s,level,art,tilt){
  ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt||0);
  // shadow
  ctx.fillStyle='rgba(42,24,16,.18)';ctx.beginPath();ctx.ellipse(0,s*.98,s*1.5,s*.2,0,0,7);ctx.fill();
  // saucer
  let g=ctx.createLinearGradient(-s*1.4,0,s*1.4,0);g.addColorStop(0,'#8e3b1d');g.addColorStop(.5,'#c9693c');g.addColorStop(1,'#7c3218');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,s*.82,s*1.4,s*.26,0,0,7);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.12)';ctx.beginPath();ctx.ellipse(0,s*.8,s*.7,s*.12,0,0,7);ctx.fill();
  // handle
  ctx.strokeStyle='#a4492a';ctx.lineWidth=s*.17;ctx.lineCap='round';
  ctx.beginPath();ctx.arc(s*.98,s*.34,s*.34,-Math.PI*.55,Math.PI*.55);ctx.stroke();
  // body
  g=ctx.createLinearGradient(-s,0,s,0);g.addColorStop(0,'#8a381b');g.addColorStop(.35,'#d0713f');g.addColorStop(.7,'#b4532d');g.addColorStop(1,'#6f2c15');
  ctx.fillStyle=g;ctx.beginPath();
  ctx.moveTo(-s,0);ctx.bezierCurveTo(-s*.98,s*.62,-s*.6,s*.86,0,s*.88);ctx.bezierCurveTo(s*.6,s*.86,s*.98,s*.62,s,0);
  ctx.ellipse(0,0,s,s*.3,0,0,Math.PI,true);ctx.closePath();ctx.fill();
  // rim inside
  ctx.fillStyle='#e9d9c0';ctx.beginPath();ctx.ellipse(0,0,s,s*.3,0,0,7);ctx.fill();
  ctx.fillStyle='#d0b898';ctx.beginPath();ctx.ellipse(0,s*.01,s*.93,s*.26,0,0,7);ctx.fill();
  // coffee surface (level 0..1)
  const cyy=lerp(s*.14,s*.0,level),rx=lerp(s*.62,s*.9,level),ry=lerp(s*.12,s*.25,level);
  if(level>0.01){
    ctx.save();ctx.beginPath();ctx.ellipse(0,0,s*.93,s*.26,0,0,7);ctx.clip();
    const cg=ctx.createRadialGradient(0,cyy,2,0,cyy,rx);cg.addColorStop(0,'#5a2f18');cg.addColorStop(1,'#2a130a');
    ctx.fillStyle=cg;ctx.beginPath();ctx.ellipse(0,cyy,rx,ry,0,0,7);ctx.fill();
    if(art>0){
      ctx.fillStyle='rgba(246,232,208,'+(.92*art)+')';
      const n=5;
      for(let i=0;i<n;i++){
        const k=i/(n-1),w=lerp(rx*.5,rx*.2,k),h=ry*lerp(.62,.26,k);
        if(art<k*.6)continue;
        ctx.beginPath();ctx.ellipse(0,cyy-ry*.45+k*ry*.95,w*sm(art*1.2),h*.5,0,0,7);ctx.fill();
      }
      ctx.strokeStyle='rgba(60,30,15,'+(.8*art)+')';ctx.lineWidth=Math.max(1.2,s*.02);
      ctx.beginPath();ctx.moveTo(0,cyy-ry*.55);ctx.lineTo(0,cyy+ry*.55);ctx.stroke();
    }
    ctx.restore();
  }
  ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=s*.02;
  ctx.beginPath();ctx.ellipse(0,0,s,s*.3,0,Math.PI*1.05,Math.PI*1.45);ctx.stroke();
  ctx.restore();
}
function spout(x,y,s,appear){
  // brass group head hanging from top
  ctx.save();ctx.translate(x,y);
  const g=ctx.createLinearGradient(-s*.5,0,s*.5,0);
  g.addColorStop(0,'#7a5a1f');g.addColorStop(.35,'#f0cf7a');g.addColorStop(.6,'#c8923c');g.addColorStop(1,'#5f4417');
  ctx.fillStyle=g;
  ctx.fillRect(-s*.18,-H,s*.36,H+s*.5);              // pipe from top
  ctx.beginPath();ctx.moveTo(-s*.5,s*.3);ctx.lineTo(s*.5,s*.3);ctx.lineTo(s*.34,s*.72);ctx.lineTo(-s*.34,s*.72);ctx.closePath();ctx.fill();
  ctx.fillRect(-s*.62,s*.18,s*1.24,s*.16);
  ctx.fillStyle='#2a1810';ctx.fillRect(-s*.1,s*.72,s*.2,s*.12);
  ctx.restore();
}
function grounds(cx,cy,u,t,amt){
  ctx.fillStyle='#2b140a';
  for(let i=0;i<46;i++){
    const a=rnd(i)*Math.PI*2,sp=lerp(.4,1.5,rnd(i+9)),r=amt*u*sp*(1.6+rnd(i+3)*1.4);
    const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r+amt*amt*u*.9+Math.sin(t*1.3+i)*3;
    ctx.globalAlpha=(1-amt*.35)*clamp(amt*8);
    ctx.beginPath();ctx.arc(x,y,lerp(1.2,4.6,rnd(i+21))*(u/110),0,7);ctx.fill();
  }
  ctx.globalAlpha=1;
}
function stream(x,y0,y1,w,t){
  if(y1<=y0||w<.5)return;
  const g=ctx.createLinearGradient(x-w,0,x+w,0);
  g.addColorStop(0,'#2a130a');g.addColorStop(.35,'#7b4423');g.addColorStop(.6,'#4a2412');g.addColorStop(1,'#1f0d06');
  ctx.fillStyle=g;ctx.beginPath();
  const steps=24;
  for(let i=0;i<=steps;i++){const y=lerp(y0,y1,i/steps);const wob=Math.sin(y*.03+t*9)*w*.12;const ww=w*(1+.12*Math.sin(y*.05-t*12));ctx.lineTo(x+wob-ww,y)}
  for(let i=steps;i>=0;i--){const y=lerp(y0,y1,i/steps);const wob=Math.sin(y*.03+t*9)*w*.12;const ww=w*(1+.12*Math.sin(y*.05-t*12));ctx.lineTo(x+wob+ww,y)}
  ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,210,150,.35)';ctx.fillRect(x-w*.35,y0,w*.2,y1-y0);
}
function splash(cx,cy,u,t,power){
  if(power<=0)return;
  for(let i=0;i<22;i++){
    const ph=((t*1.6+rnd(i)*1)%1);
    const side=(i%2?1:-1),a=lerp(.15,.85,rnd(i+4));
    const vx=side*a*u*.95,vy=lerp(.8,1.7,rnd(i+7))*u*1.1;
    const x=cx+vx*ph,y=cy-(vy*ph-vy*1.3*ph*ph);
    const r=lerp(2,6,rnd(i+13))*(u/110)*(1-ph*.5);
    ctx.fillStyle='rgba(122,64,32,'+(power*(1-ph)*.95)+')';
    ctx.beginPath();ctx.ellipse(x,y,r,r*(1+(1-ph)*.9),Math.atan2(vx,-(vy-2.6*vy*ph))*-1,0,7);ctx.fill();
  }
  for(let k=0;k<3;k++){
    const ph=(t*.9+k/3)%1;
    ctx.strokeStyle='rgba(180,120,70,'+(power*(1-ph)*.7)+')';ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(cx,cy,u*.18+ph*u*.55,(u*.18+ph*u*.55)*.28,0,0,7);ctx.stroke();
  }
}
function steam(cx,cy,u,t,a){
  if(a<=0)return;
  ctx.lineCap='round';
  for(let k=0;k<4;k++){
    ctx.strokeStyle='rgba(120,90,70,'+(a*.28)+')';ctx.lineWidth=u*.07;
    ctx.beginPath();
    for(let i=0;i<=24;i++){const f=i/24;const x=cx+(k-1.5)*u*.34+Math.sin(f*5+t*1.4+k*1.7)*u*.1*f;const y=cy-f*u*1.5;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}
    ctx.stroke();
  }
}

function render(p,t){
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  const mob=W<820;
  const u=mob?Math.min(W*.3,H*.16):Math.min(W*.17,H*.24);
  const baseX=mob?W*.5:W*.62, baseY=mob?H*.3:H*.5;
  const c1=seg(p,.0,.3), c1out=seg(p,.3,.4);
  const c2=seg(p,.32,.42), pour=seg(p,.4,.5), fill=seg(p,.42,.7), up=seg(p,.66,.78);
  const art=seg(p,.74,.92);

  // soft sun disc
  const gr=ctx.createRadialGradient(baseX,baseY,0,baseX,baseY,u*3.2);
  gr.addColorStop(0,'rgba(255,224,170,.55)');gr.addColorStop(1,'rgba(255,224,170,0)');
  ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);

  // chapter 1: bean splits
  if(c1out<1){
    const a=1-c1out;ctx.save();ctx.globalAlpha=a;
    const bob=Math.sin(t*1.2)*u*.05;
    const sp=c1*u*.9;
    const rot=-.35+c1*.6;
    if(c1<.12){wholeBean(baseX,baseY+bob,u*1.2,rot)}
    else{
      const dx=Math.cos(rot)*sp,dy=Math.sin(rot)*sp;
      bean(baseX-dx*1.1,baseY+bob-dy,u*1.2,rot,false);
      bean(baseX+dx*1.1,baseY+bob+dy,u*1.2,rot,true);
    }
    ctx.restore();
    grounds(baseX,baseY,u,t,seg(p,.04,.34));
  }

  // chapter 2 & 3: cup + spout + stream
  if(c2>0){
    const cupS=u*lerp(.95,1.15,up);
    const cx=lerp(baseX,mob?W*.5:W*.73,up);
    const cyFinal=baseY+u*(mob?.55:.45);
    const cy=lerp(H+cupS*1.3,cyFinal,c2*c2*(3-2*c2));
    const lvl=fill;
    const spoutRest=-u*.2;
    const spoutY=lerp(-H*.3,baseY-cupS*1.9-u*.3,pour)-up*H*.5;
    const surfY=cy+cupS*lerp(.14,0,lvl);
    cup(cx,cy,cupS,lvl,art,Math.sin(t*.6)*.01);
    if(pour>0&&up<1){
      const sa=1-up;
      ctx.save();ctx.globalAlpha=sa;
      spout(cx,spoutY,cupS*.6,pour);
      const w=lerp(2,cupS*.075,seg(p,.43,.5))*(1-seg(p,.62,.68));
      stream(cx,spoutY+cupS*.5,surfY,w,t);
      splash(cx,surfY,cupS*.9,t,seg(p,.46,.52)*(1-seg(p,.62,.7)));
      ctx.restore();
    }
    steam(cx,cy-cupS*.1,cupS*.7,t,seg(p,.78,.9));
  }
}
window.CoffeeIllustrated={render,resize};
})();
