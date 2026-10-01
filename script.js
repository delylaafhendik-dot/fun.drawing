'use strict';
const $=s=>document.querySelector(s);
const cv=$('#cv'),ctx=cv.getContext('2d',{willReadFrequently:true});
let tool='brush',brush='pen',color='#ff4d6d',size=8,sticker='⭐',stamp='♥',hue=0,drawing=false,start,last,snap,hist=[],idx=-1;
const TOOLS=[['brush','🖌️ Brush'],['eraser','🧽 Eraser'],['fill','🪣 Fill'],['shape','🔷 Shape'],['text','🔤 Text']];
const BRUSHES=[['pen','Pen'],['pencil','Pencil'],['marker','Marker'],['highlighter','Highlighter']];
const FUN=[['sticker','✨ Sticker'],['rainbow','🌈 Rainbow Brush'],['stamp','💖 Stamp'],['random','⭐ Random Shape'],['palette','🎨 Color Palette'],['magic','🪄 Magic Brush']];
const STICKERS=['⭐','❤️','🌸','☁️','☀️','😊','🐱','🐶','🐰','🐥','🦋','🐟','🌈','🍎','🚀','🌳'];
const STAMPS=['♥','★','✿','♪','✦','☺','❄'];
const COLORS=['#ff4d6d','#ff9f1c','#ffd23f','#2fd18b','#3d8bff','#9b5de5','#000000','#ffffff','#8d5524','#ff8fab','#6ee7f9','#a3a3a3'];
const IDEAS=['Draw a cute cat','Draw your dream house','Draw a beautiful garden','Draw outer space','Draw your favorite food','Draw a funny monster','Draw a rainy day','Draw an underwater world','Draw your best friend','Draw a robot helper'];
const SHAPES=['rect','circle','triangle','star','heart','diamond'];

/* UI */
function btns(id,list,fn){const el=$(id);el.innerHTML='';list.forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.dataset.k=k;b.onclick=()=>fn(k);el.appendChild(b)})}
function mark(){document.querySelectorAll('#tools button,#fun button').forEach(b=>b.classList.toggle('on',(b.dataset.k===tool&&b.closest('#tools'))||(b.closest('#fun')&&((b.dataset.k===tool)||(b.dataset.k===brush&&tool==='brush')))));
 document.querySelectorAll('#brushes button').forEach(b=>b.classList.toggle('on',tool==='brush'&&b.dataset.k===brush));
 document.querySelectorAll('#stickers button').forEach(b=>b.classList.toggle('on',tool==='sticker'&&b.dataset.k===sticker));
 document.querySelectorAll('#stamps button').forEach(b=>b.classList.toggle('on',tool==='stamp'&&b.dataset.k===stamp))}
function pick(k){if(k==='palette'){newPalette();return}if(k==='rainbow'||k==='magic'){tool='brush';brush=k}else tool=k;mark()}
btns('#tools',TOOLS,pick);btns('#fun',FUN,pick);
btns('#brushes',BRUSHES,k=>{tool='brush';brush=k;mark()});
btns('#stickers',STICKERS.map(s=>[s,s]),k=>{tool='sticker';sticker=k;mark()});
btns('#stamps',STAMPS.map(s=>[s,s]),k=>{tool='stamp';stamp=k;mark()});
function swatches(list){const el=$('#swatches');el.innerHTML='';list.forEach(c=>{const b=document.createElement('button');b.style.background=c;b.title=c;b.onclick=()=>setColor(c);el.appendChild(b)})}
function setColor(c){color=c;$('#color').value=c}
function newPalette(){const h=Math.random()*360;swatches(Array.from({length:12},(_,i)=>`hsl(${(h+i*30)%360} ${60+Math.random()*30}% ${45+Math.random()*25}%)`).map(hex));toast('New palette ready!')}
function hex(c){const t=document.createElement('canvas').getContext('2d');t.fillStyle=c;return t.fillStyle}
function toast(t){$('#idea').textContent=t}
swatches(COLORS);mark();
$('#color').oninput=e=>color=e.target.value;
$('#size').oninput=e=>{size=+e.target.value;$('#sizeV').textContent=size};
$('#bg').oninput=e=>$('#wrap').style.background=e.target.value;
$('#ideaBtn').onclick=()=>toast('💡 '+IDEAS[Math.floor(Math.random()*IDEAS.length)]);

/* History */
function commit(){hist=hist.slice(0,idx+1);hist.push(ctx.getImageData(0,0,cv.width,cv.height));if(hist.length>40)hist.shift();idx=hist.length-1;upd()}
function go(n){if(n<0||n>=hist.length)return;idx=n;ctx.putImageData(hist[idx],0,0);upd()}
function upd(){$('#undo').disabled=idx<=0;$('#redo').disabled=idx>=hist.length-1}
$('#undo').onclick=()=>go(idx-1);$('#redo').onclick=()=>go(idx+1);
$('#clear').onclick=()=>{ctx.clearRect(0,0,cv.width,cv.height);commit()};
$('#new').onclick=()=>{if(confirm('Start a new drawing? Current drawing will be removed.')){ctx.clearRect(0,0,cv.width,cv.height);$('#bg').value='#ffffff';$('#wrap').style.background='#fff';hist=[];idx=-1;commit()}};
$('#save').onclick=()=>{const t=document.createElement('canvas');t.width=cv.width;t.height=cv.height;const c=t.getContext('2d');c.fillStyle=$('#bg').value;c.fillRect(0,0,t.width,t.height);c.drawImage(cv,0,0);const a=document.createElement('a');a.download='fun-drawing.png';a.href=t.toDataURL('image/png');a.click()};
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.ctrlKey||e.metaKey){if(e.key==='z'){e.preventDefault();go(idx-1)}if(e.key==='y'){e.preventDefault();go(idx+1)}}});

/* Drawing */
const pos=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height}};
function stroke(a,b){
 ctx.save();ctx.lineCap=ctx.lineJoin='round';ctx.strokeStyle=ctx.fillStyle=color;ctx.lineWidth=size;
 if(tool==='eraser'){ctx.globalCompositeOperation='destination-out';ctx.lineWidth=size*2}
 else if(brush==='pencil'){ctx.globalAlpha=.5;ctx.lineWidth=Math.max(1,size*.5);for(let i=0;i<3;i++)ctx.fillRect(b.x+(Math.random()-.5)*size,b.y+(Math.random()-.5)*size,1.5,1.5)}
 else if(brush==='marker'){ctx.lineWidth=size*1.5;ctx.globalAlpha=.9}
 else if(brush==='highlighter'){ctx.lineWidth=size*2.5;ctx.globalAlpha=.3;ctx.lineCap='square'}
 else if(brush==='rainbow'){hue=(hue+4)%360;ctx.strokeStyle=`hsl(${hue} 90% 55%)`}
 else if(brush==='magic'){for(let i=0;i<3;i++){ctx.fillStyle=`hsl(${Math.random()*360} 95% 60%)`;ctx.font=`${size+Math.random()*size*2+8}px serif`;ctx.fillText('✦',b.x+(Math.random()-.5)*size*5,b.y+(Math.random()-.5)*size*5)}ctx.restore();return}
 ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore()}
function path(t,a,b){ctx.beginPath();const x=Math.min(a.x,b.x),y=Math.min(a.y,b.y),w=Math.abs(b.x-a.x),h=Math.abs(b.y-a.y),cx=x+w/2,cy=y+h/2;
 if(t==='line'){ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y)}
 else if(t==='rect')ctx.rect(x,y,w,h);
 else if(t==='circle')ctx.ellipse(cx,cy,w/2,h/2,0,0,7);
 else if(t==='triangle'){ctx.moveTo(cx,y);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath()}
 else if(t==='diamond'){ctx.moveTo(cx,y);ctx.lineTo(x+w,cy);ctx.lineTo(cx,y+h);ctx.lineTo(x,cy);ctx.closePath()}
 else if(t==='star'){for(let i=0;i<10;i++){const r=i%2?.45:1,an=-Math.PI/2+i*Math.PI/5;ctx.lineTo(cx+Math.cos(an)*r*w/2,cy+Math.sin(an)*r*h/2)}ctx.closePath()}
 else if(t==='heart'){ctx.moveTo(cx,y+h);ctx.bezierCurveTo(x-w*.2,y+h*.45,x+w*.1,y-h*.1,cx,y+h*.28);ctx.bezierCurveTo(x+w*.9,y-h*.1,x+w*1.2,y+h*.45,cx,y+h);ctx.closePath()}}
function drawShape(t,a,b,fill){ctx.save();ctx.strokeStyle=ctx.fillStyle=color;ctx.lineWidth=size;ctx.lineJoin='round';ctx.lineCap='round';path(t,a,b);if(fill&&t!=='line')ctx.fill();else ctx.stroke();ctx.restore()}
function put(txt,p,font,col){ctx.save();ctx.fillStyle=col||color;ctx.font=font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,p.x,p.y);ctx.restore()}
function flood(p){
 const w=cv.width,h=cv.height,img=ctx.getImageData(0,0,w,h),d=img.data,x0=p.x|0,y0=p.y|0,i0=(y0*w+x0)*4,t=[d[i0],d[i0+1],d[i0+2],d[i0+3]];
 const c=hexRgb(color);if(t[0]===c[0]&&t[1]===c[1]&&t[2]===c[2]&&t[3]===255)return false;
 const seen=new Uint8Array(w*h),st=[x0+y0*w];
 while(st.length){const n=st.pop();if(seen[n])continue;const i=n*4;
  if(Math.abs(d[i]-t[0])+Math.abs(d[i+1]-t[1])+Math.abs(d[i+2]-t[2])+Math.abs(d[i+3]-t[3])>80)continue;
  seen[n]=1;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255;const x=n%w;
  if(x>0)st.push(n-1);if(x<w-1)st.push(n+1);if(n>=w)st.push(n-w);if(n<w*(h-1))st.push(n+w)}
 ctx.putImageData(img,0,0);return true}
function hexRgb(c){const h=hex(c);return[1,3,5].map(i=>parseInt(h.slice(i,i+2),16))}
cv.addEventListener('pointerdown',e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);const p=pos(e);start=last=p;
 if(tool==='fill'){flood(p);commit();return}
 if(tool==='sticker'){put(sticker,p,`${size*3+30}px serif`);commit();return}
 if(tool==='stamp'){put(stamp,p,`bold ${size*3+30}px serif`);commit();return}
 if(tool==='text'){put($('#text').value,p,`bold ${size*2+16}px "Trebuchet MS",sans-serif`);commit();return}
 if(tool==='random'){const s=40+Math.random()*120,c=`hsl(${Math.random()*360} 85% 58%)`,o=color;color=c;drawShape(SHAPES[Math.floor(Math.random()*SHAPES.length)],{x:p.x-s/2,y:p.y-s/2},{x:p.x+s/2,y:p.y+s/2},true);color=o;commit();return}
 drawing=true;if(tool==='shape')snap=ctx.getImageData(0,0,cv.width,cv.height);else stroke(p,{x:p.x+.01,y:p.y})});
cv.addEventListener('pointermove',e=>{if(!drawing)return;const p=pos(e);
 if(tool==='shape'){ctx.putImageData(snap,0,0);drawShape($('#shape').value,start,p,$('#fillShape').checked)}else{stroke(last,p);last=p}});
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,()=>{if(drawing){drawing=false;commit()}}));
commit();
