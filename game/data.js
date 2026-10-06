export const VERSION=3;
export const BELTS=[['White','#eee9da'],['Blue','#4298ee'],['Purple','#a477e2'],['Brown','#ac7752'],['Black','#252d3b']];
export const RANK_XP=[0,180,420,720,1080,1500,2000,2580,3240,3980,4800,5700,6720,7860,9120,10500,12000,13700,15600,17700,20000];
export function rank(xp){let level=0;while(level<20&&xp>=RANK_XP[level+1])level++;return {level,belt:Math.floor(level/5),stripes:level===20?0:level%5,name:BELTS[Math.floor(level/5)][0],color:BELTS[Math.floor(level/5)][1],floor:RANK_XP[level],next:RANK_XP[level+1]??null};}
export const ENVIRONMENTS=[
{name:'First Light Dojo',tag:'01 / HOME MATS',sky:'#142532',wall:'#223e4a',deep:'#0b1925',mat:'#355c69',trim:'#70d3bf',kind:'dojo'},
{name:'Open Mat Academy',tag:'02 / OPEN MAT',sky:'#172137',wall:'#2e3d57',deep:'#101827',mat:'#475777',trim:'#7aa7ef',kind:'academy'},
{name:'Regional Open',tag:'03 / COMPETITION',sky:'#2c2034',wall:'#483247',deep:'#1c1728',mat:'#695164',trim:'#eaad7f',kind:'competition'},
{name:'Training Camp',tag:'04 / OPEN AIR',sky:'#34334b',wall:'#525168',deep:'#292c43',mat:'#626863',trim:'#d6b891',kind:'outdoor'},
{name:'Performance Lab',tag:'05 / TRAINING',sky:'#172e34',wall:'#2c4950',deep:'#0e212b',mat:'#3e6264',trim:'#7cddd2',kind:'facility'},
{name:'Championship Arena',tag:'06 / THE BIG STAGE',sky:'#141a32',wall:'#283359',deep:'#0a1025',mat:'#414b78',trim:'#c0a1ff',kind:'arena'}];
export const COSMETICS=[
{id:'gi-white',category:'gi',name:'Classic white',color:'#eeeadd',shade:'#c8c9bf',cost:0},
{id:'gi-blue',category:'gi',name:'Competition blue',color:'#477fc4',shade:'#2d528e',cost:120},
{id:'gi-black',category:'gi',name:'Midnight gi',color:'#323c50',shade:'#1b2333',cost:220},
{id:'gi-sand',category:'gi',name:'Camp canvas',color:'#c6ad83',shade:'#8d785d',unlock:'env4',hint:'Reach Training Camp'},
{id:'gi-gold',category:'gi',name:'Black belt edition',color:'#ddc487',shade:'#a28a57',unlock:'black',hint:'Reach black belt'},
{id:'hair-original',category:'hair',name:'Original curls',color:'#4b3629',cost:0},
{id:'hair-dark',category:'hair',name:'Dark curls',color:'#23252c',cost:50},
{id:'hair-light',category:'hair',name:'Sunlit curls',color:'#b98d4f',cost:65},
{id:'rash-dark',category:'rash',name:'Charcoal',color:'#252c3b',cost:0},
{id:'rash-red',category:'rash',name:'Red corner',color:'#b3444b',cost:60},
{id:'rash-teal',category:'rash',name:'Sea glass',color:'#45aa9b',cost:70},
{id:'patch-red',category:'patch',name:'Original red',color:'#bd4d4d',cost:0},
{id:'patch-gold',category:'patch',name:'Medal club',color:'#ecc563',unlock:'medals25',hint:'Collect 25 medals'},
{id:'patch-teal',category:'patch',name:'Academy crest',color:'#65cbbc',cost:60},
{id:'wrist-blue',category:'wrist',name:'Blue wrist tape',color:'#5a9ada',cost:0},
{id:'wrist-gold',category:'wrist',name:'Gold wrist tape',color:'#e7bf61',cost:80}];
export const ACHIEVEMENTS=[
{id:'precision20',name:'Thread the needle',description:'Earn 20 tight-clearance bonuses.',stat:'precision',target:20,coins:80,xp:160},
{id:'first',name:'First round',description:'Finish your first run.',stat:'runs',target:1,coins:20,xp:40},
{id:'distance500',name:'Finding your pace',description:'Reach 500 m in one run.',stat:'bestDistance',target:500,coins:30,xp:70},
{id:'minute',name:'Stay on the mats',description:'Survive 60 seconds.',stat:'bestTime',target:60,coins:35,xp:80},
{id:'medals25',name:'Medal club',description:'Collect 25 medals in total.',stat:'medals',target:25,coins:60,xp:150},
{id:'runs10',name:'Show up again',description:'Complete 10 runs.',stat:'runs',target:10,coins:60,xp:100},
{id:'coins500',name:'Mat money',description:'Collect 500 coins in runs.',stat:'coins',target:500,coins:80,xp:150},
{id:'clean30',name:'Flow state',description:'Clear 30 obstacles in a run.',stat:'bestClean',target:30,coins:80,xp:180},
{id:'roll20',name:'Low profile',description:'Roll under 20 tables or barriers.',stat:'rollClears',target:20,coins:65,xp:140},
{id:'env4',name:'Training camp',description:'Reach the fourth environment.',stat:'environmentCount',target:4,coins:100,xp:200},
{id:'blue',name:'A new belt',description:'Earn your blue belt.',stat:'rank',target:5,coins:100,xp:150},
{id:'upgrade',name:'Put in the reps',description:'Purchase three upgrade levels.',stat:'upgradeLevels',target:3,coins:60,xp:100},
{id:'five',name:'Deep waters',description:'Survive five minutes.',stat:'bestTime',target:300,coins:180,xp:350},
{id:'black',name:'Black belt',description:'Reach the final belt.',stat:'rank',target:20,coins:500,xp:0}];
export const CHAPTERS=[
{id:'first-open-mat',name:'The first open mat',environment:0,duration:45,difficulty:0,reward:80,xp:160,text:'The doors are open. Settle into your rhythm, clear the bags, and stay on the mats until the round ends.'},
{id:'early-arrival',name:'Before the brackets',environment:2,duration:65,difficulty:75,reward:120,xp:230,text:'You arrived before the first match. Navigate the equipment, roll under tables, and find your way to the competition mats.'},
{id:'camp',name:'One more round',environment:3,duration:80,difficulty:145,reward:160,xp:300,text:'An open-air training camp. Cross the mat gaps and keep your timing through the last round.'},
{id:'main-stage',name:'Under the lights',environment:5,duration:100,difficulty:230,reward:240,xp:450,text:'The arena is yours. Put your movement together for a final, clean run to center mat.'}];
export const UPGRADE_COSTS=[90,160,260,400];
export const STORY_XP=420;
export const fmtTime=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
