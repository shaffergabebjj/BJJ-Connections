// Pure fixed-step simulation. No DOM, storage, or rendering dependencies.
export const W=480,H=270,FLOOR=220,STEP=1/120;
export function random(seed){let v=seed>>>0;return()=>{v+=0x6D2B79F5;let t=Math.imul(v^v>>>15,1|v);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
export function difficulty(t){const p=Math.min(t/600,1);return {speed:108+125*Math.pow(p,.7),rest:2.2-1.26*Math.pow(p,.65),tier:t<25?0:t<65?1:t<130?2:t<210?3:t<360?4:5};}
export const TYPES={bag:{w:25,h:17,label:'Gym bag'},cone:{w:14,h:23,label:'Training cone'},roller:{w:22,h:16,label:'Foam roller'},bench:{w:46,h:25,label:'Bench'},mats:{w:32,h:38,label:'Stacked mats'},podium:{w:34,h:66,label:'High podium'},table:{w:58,h:20,overhead:true,label:'Equipment table'},barrier:{w:45,h:25,overhead:true,label:'Raised barrier'}};
export class Runner{
constructor({seed=Date.now(),jump=0,luck=0,chapter=null}={}){this.rng=random(seed);this.jumpLevel=jump;this.luckLevel=luck;this.chapter=chapter;this.time=0;this.world=0;this.speed=108;this.distance=0;this.coins=0;this.medals=0;this.xp=0;this.clean=0;this.precision=0;this.groupType=null;this.groupRepeat=0;this.rollClears=0;this.doubleJumps=0;this.environment=chapter?.environment||0;this.next=520;this.objects=[];this.terrain=[];this.events=[];this.dead=false;this.complete=false;this.reason='';this.effects={magnet:0,focus:0};this.p={x:88,y:FLOOR,vy:0,jumps:0,grounded:true,coyote:.09,buffer:0,roll:0,rollHeld:false,shrimp:false,spin:0,land:0};this.generate();}
gain(amount){this.xp+=amount*(this.effects.focus>0?2:1);}
emit(type,data={}){this.events.push({type,...data});}drain(){return this.events.splice(0)}
action(name,held=true){if(this.dead||this.complete)return;if(name==='jump'&&held)this.p.buffer=.13;if(name==='roll'||name==='shrimp'){this.p.rollHeld=held;this.p.shrimp=name==='shrimp'&&held;if(held){this.p.roll=.58;if(!this.p.grounded)this.p.vy=Math.max(this.p.vy,270);this.emit('roll');}}}
floorAt(x){for(const t of this.terrain){if(x>=t.x&&x<=t.x+t.w){if(t.type==='gap')return null;const d=Math.min(x-t.x,t.x+t.w-x);return FLOOR-t.h*Math.min(1,d/38);}}return FLOOR;}
box(){const p=this.p;return {x:this.world+p.x-(p.roll>0&&p.grounded?12:8),y:p.y-(p.roll>0&&p.grounded?15:46),w:p.roll>0&&p.grounded?25:17,h:p.roll>0&&p.grounded?14:44};}
add(type,x){const d=TYPES[type];this.objects.push({kind:'obstacle',type,x,y:d.overhead?FLOOR-45:FLOOR-d.h,...d,passed:false});}
collect(type,x,y){this.objects.push({kind:'pickup',type,x,y,w:8,h:10});}
generate(){while(this.next<this.world+W+400){const future=this.time+(this.next-this.world-88)/this.speed;const d=difficulty(future+(this.chapter?.difficulty||0));const r=this.rng();let type='single';if(d.tier>=1&&r<.2)type='overhead';if(d.tier>=2&&r>=.2&&r<.34)type='gap';if(d.tier>=2&&r>=.34&&r<.43)type='deck';if(d.tier>=3&&r>=.43&&r<.63)type='pair';if(d.tier>=3&&r>=.63&&r<.76)type='high';if(d.tier>=4&&r>=.76&&r<.86)type='overhead';
if(d.tier>=5&&r>=.86&&r<.96)type='linked';
if(type===this.groupType&&this.groupRepeat>=2)type=type==='single'&&d.tier>=1?'overhead':'single';
this.groupRepeat=type===this.groupType?this.groupRepeat+1:1;this.groupType=type;
const x=this.next;let width=30;
if(type==='linked'){this.add('barrier',x);const second=x+TYPES.barrier.w+d.speed*1.05;this.add('mats',second);width=second-x+TYPES.mats.w;this.collect('coin',x+20,FLOOR-10);this.collect('medal',second+16,FLOOR-72);}
else if(type==='overhead'){const name=d.tier>=4?'barrier':'table';this.add(name,x);width=TYPES[name].w;for(let j=0;j<3;j++)this.collect('coin',x+j*14,FLOOR-10);}
else if(type==='gap'){width=Math.min(95,d.speed*.38);this.terrain.push({type:'gap',x,w:width});for(let j=0;j<4;j++)this.collect(j===2?'medal':'coin',x+j*width/3,FLOOR-40-Math.sin(j/3*Math.PI)*18);}
else if(type==='deck'){width=200;this.terrain.push({type:'deck',x,w:width,h:14});for(let j=0;j<5;j++)this.collect('coin',x+40+j*27,FLOOR-34);}
else if(type==='pair'){this.add('roller',x);this.add('cone',x+43);width=57;for(let j=0;j<3;j++)this.collect('coin',x+5+j*23,FLOOR-55);}
else {const names=d.tier===0?['bag','cone','roller']:['bag','bench','mats'];const name=type==='high'?'podium':names[Math.floor(this.rng()*names.length)];this.add(name,x);width=TYPES[name].w;this.collect('medal',x+width/2,FLOOR-(type==='high'?100:65));this.collect('coin',x-20,FLOOR-35);this.collect('coin',x+width+20,FLOOR-35);}
// Each group has a recovery interval after its trailing edge. No mixed gap/ceiling traps.
const rest=d.speed*(d.rest+this.rng()*.35);this.next=x+width+rest;
if(this.rng()<.09+this.luckLevel*.025)this.collect(this.rng()<.5?'magnet':'focus',x+width+rest*.5,FLOOR-26);
if(this.rng()<this.luckLevel*.1)this.collect('medal',x+width+rest*.65,FLOOR-25);
}}
step(dt){if(this.dead||this.complete)return;const p=this.p;const df=difficulty(this.time+(this.chapter?.difficulty||0));this.speed=df.speed;this.time+=dt;this.world+=this.speed*dt;this.distance=this.world/10;this.gain(dt*1.6);const prevEnv=this.environment;this.environment=this.chapter?.environment??Math.min(5,Math.floor(this.time/60));if(prevEnv!==this.environment){this.gain(40);this.emit('environment',{index:this.environment});}for(const k of Object.keys(this.effects))this.effects[k]=Math.max(0,this.effects[k]-dt);
p.buffer=Math.max(0,p.buffer-dt);p.coyote=Math.max(0,p.coyote-dt);p.roll=Math.max(0,p.roll-dt);p.land=Math.max(0,p.land-dt);p.spin=Math.max(0,p.spin-dt);p.x+=( (p.shrimp?66:88)-p.x)*Math.min(1,dt*12);if(p.rollHeld&&p.grounded)p.roll=.2;
if(p.buffer>0&&(p.grounded||p.coyote>0||p.jumps<2)){if(!p.grounded&&p.coyote===0&&p.jumps===0)p.jumps=1;const double=p.jumps>0&&!p.grounded&&p.coyote===0;p.vy=-(double?305:340)-this.jumpLevel*6;p.jumps=double?2:1;p.grounded=false;p.coyote=0;p.roll=0;p.buffer=0;if(double){this.doubleJumps++;p.spin=.35;}this.emit(double?'double':'jump');}
const oldY=p.y;p.vy+=1000*dt;p.y+=p.vy*dt;const ground=this.floorAt(this.world+p.x);if(ground!==null&&p.vy>=0&&oldY<=ground+5&&p.y>=ground){if(!p.grounded){this.emit('land');p.land=.13;}p.y=ground;p.vy=0;p.jumps=0;p.grounded=true;p.coyote=.09;}else if(p.grounded){p.grounded=false;p.coyote=.09;}
if(p.y>FLOOR+62){this.die('Mat gap — jump before the edge.');return;}
const b=this.box();for(const o of this.objects){if(o.gone)continue;if(o.kind==='obstacle'){if(b.x<o.x+o.w-2&&b.x+b.w>o.x+2&&b.y<o.y+o.h-1&&b.y+b.h>o.y+2){this.die(o.overhead?'Equipment overhead — hold ROLL to go underneath.':o.type==='podium'?'High podium — use your second jump.':['bench','mats'].includes(o.type)?o.label+' — use a second jump to clear the full width.':o.label+' — jump a little earlier.');return;}if(!o.overhead&&b.x<o.x+o.w-2&&b.x+b.w>o.x+2){const clearance=o.y-(b.y+b.h);if(clearance>=0&&clearance<=6)o.tight=true;}
if(!o.passed&&o.x+o.w<b.x){o.passed=true;this.clean++;if(o.tight){this.precision++;this.coins+=2;this.gain(5);this.emit('precision',{x:p.x,y:p.y-52});}this.gain(3);if(o.overhead&&p.roll>0){this.rollClears++;this.emit('rollClear');}if(this.clean%10===0){this.gain(15);this.emit('flow',{count:this.clean});}}}
else{if(this.effects.magnet>0&&Math.hypot(o.x-(this.world+p.x),o.y-(p.y-25))<105&&['coin','medal'].includes(o.type)){o.x+=((this.world+p.x)-o.x)*dt*10;o.y+=(p.y-25-o.y)*dt*10;}if(b.x<o.x+8&&b.x+b.w>o.x-4&&b.y<o.y+10&&b.y+b.h>o.y-4){o.gone=true;if(o.type==='coin'){this.coins++;this.gain(2);}else if(o.type==='medal'){this.medals++;this.coins+=5;this.gain(12);}else this.effects[o.type]=8;this.emit('pickup',{item:o.type,x:o.x-this.world,y:o.y});}}}
this.objects=this.objects.filter(o=>!o.gone&&o.x+o.w>this.world-50);this.terrain=this.terrain.filter(t=>t.x+t.w>this.world-50);this.generate();if(this.chapter&&this.time>=this.chapter.duration){this.complete=true;this.emit('complete');}}
die(reason){this.dead=true;this.reason=reason;this.emit('death');}
}
