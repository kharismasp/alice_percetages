const QUESTS = ["fdp","hundred","fraction","decimal","quantity","discountStory","percentStory","remainingStory","teaCrowdStory","fractionCakeStory","decimalEmptyStory","budgetStory","reverseStory"];
const STORY_QUESTS = ["discountStory","percentStory","remainingStory","teaCrowdStory","fractionCakeStory","decimalEmptyStory","budgetStory","reverseStory"];
const REQ = { fdp:2, hundred:2, fraction:3, decimal:2, quantity:3 };
const SIMPLE_QUESTS = ["fdp","hundred","fraction","decimal","quantity"];
const $ = id => document.getElementById(id);
const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const shuffle = arr => [...arr].sort(()=>Math.random()-.5);
const praise = ["Exactly! ✨","Nice thinking! 🌟","Perfect! Keep going! ♡","That was clever! 🐇","Math magic! ✨"];

const state = {
  active:"intro", highestUnlocked:0,
  solved:{fdp:0,hundred:0,fraction:0,decimal:0,quantity:0},
  completed:{fdp:false,hundred:false,fraction:false,decimal:false,quantity:false,discountStory:false,percentStory:false,remainingStory:false,teaCrowdStory:false,fractionCakeStory:false,decimalEmptyStory:false,budgetStory:false,reverseStory:false},
  current:{},
  simpleWrong:{fdp:0,hundred:0,fraction:0,decimal:0,quantity:0},
  simpleHintLevel:{fdp:0,hundred:0,fraction:0,decimal:0,quantity:0},
  storyWrong:{discountStory:0,percentStory:0,remainingStory:0,teaCrowdStory:0,fractionCakeStory:0,decimalEmptyStory:0,budgetStory:0,reverseStory:0},
  storyHintLevel:{discountStory:0,percentStory:0,remainingStory:0,teaCrowdStory:0,fractionCakeStory:0,decimalEmptyStory:0,budgetStory:0,reverseStory:0}
};

function rabbitSay(text, cheer=false){
  $("rabbitBubble").textContent=text;
  if(cheer){$("rabbit").classList.remove("cheer"); void $("rabbit").offsetWidth; $("rabbit").classList.add("cheer"); setTimeout(()=>$("rabbit").classList.remove("cheer"),800)}
}
let tx=innerWidth-160,ty=innerHeight-140,rx=tx,ry=ty;
addEventListener("mousemove",e=>{tx=Math.max(100,Math.min(innerWidth-75,e.clientX+105));ty=Math.max(110,Math.min(innerHeight-70,e.clientY+90))});
(function loop(){rx+=(tx-rx)*.08;ry+=(ty-ry)*.08;$("rabbit").style.left=rx+"px";$("rabbit").style.top=ry+"px";requestAnimationFrame(loop)})();

function showScene(id){
  document.querySelectorAll(".scene").forEach(s=>s.classList.toggle("active",s.id===id));
  state.active=id;
  const scene=$(id); if(scene){scene.scrollTop=0; rabbitSay(scene.dataset.rabbit||"Let's continue! 🐇")}
  updateMap();
  updateTeacherPass();
}

const TEACHER_NEXT = {
  intro:"fdp",
  fdp:"hundred",
  hundred:"fraction",
  fraction:"decimal",
  decimal:"quantity",
  quantity:"discountStory",
  discountStory:"percentStory",
  percentStory:"remainingStory",
  remainingStory:"finish",
  finish:"teaCrowdStory",
  teaCrowdStory:"fractionCakeStory",
  fractionCakeStory:"decimalEmptyStory",
  decimalEmptyStory:"budgetStory",
  budgetStory:"reverseStory",
  reverseStory:"finale"
};

function updateTeacherPass(){
  const btn=$("teacherPassBtn");
  if(!btn)return;
  const canPass=Object.prototype.hasOwnProperty.call(TEACHER_NEXT,state.active);
  btn.disabled=!canPass;
  btn.textContent=state.active==="intro"?"🗝 Teacher Start":state.active==="finish"?"🗝 Teacher: Chapter 3":"🗝 Teacher Pass";
}

function teacherPass(){
  const current=state.active;
  const next=TEACHER_NEXT[current];
  if(!next)return;

  const btn=$("teacherPassBtn");
  btn?.classList.remove("passing");
  if(btn){void btn.offsetWidth;btn.classList.add("passing");}

  if(QUESTS.includes(current) && !state.completed[current]){
    if(SIMPLE_QUESTS.includes(current)) state.solved[current]=REQ[current];
    unlockQuest(current);
  }

  rabbitSay(current==="intro"?"Teacher shortcut ready — let's inspect the quests! 🐇":"Teacher shortcut! Opening the next scene. 🗝✨",true);
  setTimeout(()=>showScene(next),180);
}
function updateMap(){
  const done=QUESTS.filter(q=>state.completed[q]).length;
  $("progressText").textContent=`${done} / ${QUESTS.length} quests`;
  $("progressBar").style.width=`${done/QUESTS.length*100}%`;
  document.querySelectorAll(".map-node").forEach((btn,i)=>{
    const q=btn.dataset.target;
    const unlocked=i<=state.highestUnlocked;
    btn.disabled=!unlocked; btn.classList.toggle("locked",!unlocked); btn.classList.toggle("complete",!!state.completed[q]); btn.classList.toggle("current",state.active===q);
  });
  $("fdpCount").textContent=`${state.solved.fdp} / ${REQ.fdp} solved`;
  $("hundredCount").textContent=`${state.solved.hundred} / ${REQ.hundred} solved`;
  $("fractionCount").textContent=`${state.solved.fraction} / ${REQ.fraction} solved`;
  $("decimalCount").textContent=`${state.solved.decimal} / ${REQ.decimal} solved`;
  $("quantityCount").textContent=`${state.solved.quantity} / ${REQ.quantity} solved`;
}
function feedback(id,text,type){const el=$(id);el.textContent=text;el.className=`feedback ${type}`}
function unlockQuest(q){
  state.completed[q]=true;
  const idx=QUESTS.indexOf(q); state.highestUnlocked=Math.max(state.highestUnlocked,Math.min(idx+1,QUESTS.length-1)); updateMap();
}
function numInput(id){const raw=$(id).value.trim(); if(raw==="")return null; const n=Number(raw); return Number.isFinite(n)?n:null}
function closeEnough(a,b){return Math.abs(a-b)<1e-9}
function fractionHTML(n,d,cls="fraction"){return `<span class="${cls}"><span>${n}</span><span>${d}</span></span>`}
function fmt(n){return Number.isInteger(n)?String(n):String(Number(n.toFixed(4)))}

// ---------- shared 3-wrong rescue for Quests 1–5 ----------
function setAttemptDots(id,count){
  $(id)?.querySelectorAll("span").forEach((dot,i)=>dot.classList.toggle("used",i<count));
}
function resetSimpleHelp(key){
  state.simpleWrong[key]=0;
  state.simpleHintLevel[key]=0;
  setAttemptDots(`${key}Attempts`,0);
  const box=$(`${key}HintBox`); if(box){box.classList.add("hidden");box.innerHTML="";}
}
function showSimpleHint(key){
  const s=state.current[key]; if(!s?.hints?.length)return;
  const level=Math.min(state.simpleHintLevel[key],s.hints.length-1);
  const box=$(`${key}HintBox`);
  box.innerHTML=`<div class="clue-heading">Clue ${level+1}</div>${s.hints[level]}`;
  box.classList.remove("hidden");
  state.simpleHintLevel[key]=Math.min(level+1,s.hints.length-1);
}
function simpleWrongAttempt(key,feedbackId){
  if(state.completed[key] || state.current[key]?.rescued)return;
  state.simpleWrong[key]++;
  setAttemptDots(`${key}Attempts`,state.simpleWrong[key]);
  if(state.simpleWrong[key]>=3){
    revealSimpleRescue(key,feedbackId);
  }else{
    feedback(feedbackId,state.simpleWrong[key]===1?"Not yet — try to notice the relationship between the numbers.":"Still tricky. Use the clue button and take one small step at a time.","bad");
    rabbitSay(state.simpleWrong[key]===1?"No rush. What do the numbers mean here? 💭":"One clue at a time. You do not need the whole solution yet. 🐇");
  }
}
function revealSimpleRescue(key,feedbackId){
  const s=state.current[key]; if(!s)return;
  s.rescued=true;
  const box=$(`${key}HintBox`);
  const willFinish=state.solved[key]+1>=REQ[key];
  box.innerHTML=`<div class="final-rescue"><strong>Let's solve this one together.</strong>${s.finalSolution}<div class="answer-reveal">Answer: <strong>${s.answerText}</strong></div><button class="rescue-continue" type="button">${willFinish?"I understand — complete this quest →":"I understand — next puzzle →"}</button></div>`;
  box.classList.remove("hidden");
  feedback(feedbackId,"Three tries used — read the worked path, then continue when you're ready. ♡","good");
  rabbitSay("This one was tricky. Read the path, then we'll try the next one together. 🐇♡",true);
  box.querySelector(".rescue-continue").addEventListener("click",()=>advanceSimpleProblem(key,true));
  disableSimpleCurrentControls(key,true);
}
function disableSimpleCurrentControls(key,disabled){
  const mapping={
    fdp:["fdpChoices","fdpHint","fdpNew"],
    hundred:["hundredInput","hundredCheck","hundredHint","hundredNew"],
    fraction:["fractionInput","fractionCheck","fractionHint","fractionNew"],
    decimal:["decimalInput","decimalCheck","decimalHint","decimalNew"],
    quantity:["quantityInput","quantityCheck","quantityHint","quantityNew"]
  };
  (mapping[key]||[]).forEach(id=>{
    const el=$(id); if(!el)return;
    if(el.matches?.("button,input"))el.disabled=disabled;
    else el.querySelectorAll("button,input").forEach(x=>x.disabled=disabled);
  });
}
function advanceSimpleProblem(key,assisted=false){
  if(state.completed[key])return;
  state.solved[key]++;
  if(key==="quantity")updateRoses();
  const done=state.solved[key]>=REQ[key];
  if(done){
    completeSimpleQuest(key,assisted);
  }else{
    const gen={fdp:genFdp,hundred:genHundred,fraction:genFraction,decimal:genDecimal,quantity:genQuantity}[key];
    gen();
    const fid={fdp:"fdpFeedback",hundred:"hundredFeedback",fraction:"fractionFeedback",decimal:"decimalFeedback",quantity:"quantityFeedback"}[key];
    feedback(fid,assisted?"Good — now try a fresh one with what you just learned. ♡":"Correct! Here comes the next puzzle. ✨","good");
  }
  updateMap();
}
function completeSimpleQuest(key,assisted=false){
  unlockQuest(key);
  const cfg={
    fdp:{feedback:"fdpFeedback",next:"fdpNext",msg:"Both magic doors match! The Percent Garden is open. ✨",visual:"fdpDoorAnimation"},
    hundred:{feedback:"hundredFeedback",next:"hundredNext",msg:"Exactly! Percent really is 'out of 100'. 🌷"},
    fraction:{feedback:"fractionFeedback",next:"fractionNext",msg:"All 3 tea labels are correct! 🫖✨"},
    decimal:{feedback:"decimalFeedback",next:"decimalNext",msg:"Potion complete! Decimal → percent mastered. 🧪✨"},
    quantity:{feedback:"quantityFeedback",next:"quantityNext",msg:"Three roses bloomed! The market path is open. 🌹✨"}
  }[key];
  if(cfg.visual)$(cfg.visual).classList.add("complete");
  $(cfg.next).disabled=false;$(cfg.next).classList.remove("locked");
  feedback(cfg.feedback,assisted?"You learned the path and completed this quest. Ready for the next one! ♡":cfg.msg,"good");
  rabbitSay(assisted?"Nice recovery! Understanding the path matters more than guessing. 🌟":praise[rand(0,praise.length-1)],true);
}

// Quest 1 FDP
const FDP_SET=[
  {n:1,d:2,dec:"0.5",pct:50},{n:1,d:4,dec:"0.25",pct:25},{n:3,d:4,dec:"0.75",pct:75},
  {n:1,d:5,dec:"0.2",pct:20},{n:2,d:5,dec:"0.4",pct:40},{n:3,d:5,dec:"0.6",pct:60},{n:4,d:5,dec:"0.8",pct:80},
  {n:1,d:10,dec:"0.1",pct:10},{n:3,d:10,dec:"0.3",pct:30},{n:7,d:10,dec:"0.7",pct:70},{n:9,d:10,dec:"0.9",pct:90}
];
function renderForm(v,type){if(type==="fraction")return fractionHTML(v.n,v.d,"large-fraction");if(type==="decimal")return v.dec;return `${v.pct}%`}
function pairLabel(v,types){return types.map(t=>t==="fraction"?fractionHTML(v.n,v.d):t==="decimal"?v.dec:`${v.pct}%`).join(" &nbsp; = &nbsp; ")}
function genFdp(){
  disableSimpleCurrentControls("fdp",false);
  const v=FDP_SET[rand(0,FDP_SET.length-1)],types=shuffle(["fraction","decimal","percent"]),promptType=types[0],pairTypes=types.slice(1);
  const promptName=promptType==="fraction"?"fraction":promptType==="decimal"?"decimal":"percentage";
  state.current.fdp={v,promptType,pairTypes,rescued:false,
    hints:[
      `Start by asking: <strong>what part of one whole</strong> does this ${promptName} describe? Which answer card seems to show the same size?`,
      promptType==="fraction"?`Think of a familiar benchmark such as <strong>½ = 0.5 = 50%</strong>. Is this fraction smaller, equal, or larger than that benchmark?`:promptType==="decimal"?`A decimal like <strong>0.7</strong> means 7 tenths. How many hundredths would represent the same amount?`:`A percentage tells you an amount <strong>out of 100</strong>. What decimal or fraction would describe the same part of one whole?`
    ],
    finalSolution:`<p>The three forms are just different names for the same value.</p><p>${fractionHTML(v.n,v.d)} = <strong>${v.dec}</strong> = <strong>${v.pct}%</strong>.</p>`,
    answerText:pairLabel(v,pairTypes)
  };
  $("fdpPrompt").innerHTML=renderForm(v,promptType);
  const wrongs=shuffle(FDP_SET.filter(x=>x.pct!==v.pct)).slice(0,3),opts=shuffle([v,...wrongs]);
  $("fdpChoices").innerHTML=opts.map(o=>`<button class="choice-card" type="button" data-pct="${o.pct}">${pairLabel(o,pairTypes)}</button>`).join("");
  $("fdpChoices").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>checkFdp(b)));
  $("fdpFeedback").textContent="";resetSimpleHelp("fdp");
}
function checkFdp(btn){
  if(state.completed.fdp||state.current.fdp.rescued)return;
  const ok=Number(btn.dataset.pct)===state.current.fdp.v.pct;
  if(ok){btn.classList.add("correct");rabbitSay(praise[rand(0,praise.length-1)],true);advanceSimpleProblem("fdp");}
  else{btn.classList.add("wrong");btn.disabled=true;simpleWrongAttempt("fdp","fdpFeedback");}
}

// Quest 2 hundred grid
const GRID_PCTS=[10,15,20,25,30,35,40,45,50,60,65,70,75,80,90];
function genHundred(){
  disableSimpleCurrentControls("hundred",false);
  const pct=GRID_PCTS[rand(0,GRID_PCTS.length-1)];
  state.current.hundred={pct,rescued:false,
    hints:[
      `Look at the whole grid first. It has <strong>100 equal squares</strong>. What does one tiny square represent as a share of the whole?`,
      `The symbol <strong>%</strong> means “per 100”. You already know how many squares are glowing — connect that count to “out of 100”.`
    ],
    finalSolution:`<p>There are <strong>${pct}</strong> glowing squares out of <strong>100</strong>.</p><p>So the share is ${fractionHTML(pct,100)} = <strong>${pct}%</strong>.</p>`,
    answerText:`${pct}%`
  };
  $("shadedCount").textContent=pct;$("hundredGrid").innerHTML=Array.from({length:100},(_,i)=>`<span class="hundred-cell ${i<pct?"shaded":""}"></span>`).join("");$("hundredInput").value="";$("hundredFeedback").textContent="";resetSimpleHelp("hundred");
}
function checkHundred(){
  if(state.completed.hundred||state.current.hundred.rescued)return;
  const v=numInput("hundredInput");if(v===null)return feedback("hundredFeedback","Type a percentage first 😊","bad");
  if(closeEnough(v,state.current.hundred.pct)){rabbitSay(praise[rand(0,praise.length-1)],true);advanceSimpleProblem("hundred");}
  else simpleWrongAttempt("hundred","hundredFeedback");
}

// Quest 3 fraction to percent
const EASY_FRACS=[{n:1,d:2},{n:1,d:4},{n:3,d:4},{n:1,d:5},{n:2,d:5},{n:3,d:5},{n:4,d:5},{n:3,d:10},{n:7,d:10},{n:3,d:20},{n:7,d:20},{n:9,d:20},{n:13,d:20},{n:17,d:20},{n:7,d:25},{n:13,d:25}];
const HARD_FRACS=[{n:1,d:8},{n:3,d:8},{n:5,d:8},{n:7,d:8}];
function genFraction(){
  disableSimpleCurrentControls("fraction",false);
  const pool=state.solved.fraction<2?EASY_FRACS:[...EASY_FRACS,...HARD_FRACS],f=pool[rand(0,pool.length-1)],ans=f.n/f.d*100;
  const neat=100%f.d===0;
  state.current.fraction={...f,ans,rescued:false,
    hints:[
      `A percentage is a fraction whose whole is imagined as <strong>100 equal parts</strong>. What could you do to make this fraction easier to compare with 100?`,
      neat?`The denominator <strong>${f.d}</strong> can reach 100 using the same multiplication on top and bottom. What number would take ${f.d} to 100?`:`This denominator does not reach 100 with a whole-number multiplier. Another route is to ask: <strong>what decimal value is ${f.n} ÷ ${f.d}</strong>?`
    ],
    finalSolution:neat?(()=>{const k=100/f.d;return `<p>Multiply numerator and denominator by the same number so the value stays equal.</p><p>${fractionHTML(f.n,f.d)} × ${fractionHTML(k,k)} = ${fractionHTML(f.n*k,100)} = <strong>${fmt(ans)}%</strong>.</p>`})():`<p>Use the decimal route: <strong>${f.n} ÷ ${f.d} = ${fmt(f.n/f.d)}</strong>.</p><p>That decimal is the same as <strong>${fmt(ans)}%</strong>.</p>`,
    answerText:`${fmt(ans)}%`
  };
  $("fractionPrompt").innerHTML=fractionHTML(f.n,f.d,"large-fraction");$("fractionInput").value="";$("fractionFeedback").textContent="";$("teaLiquid").style.height=`${Math.min(100,ans)}%`;resetSimpleHelp("fraction");
}
function checkFraction(){
  if(state.completed.fraction||state.current.fraction.rescued)return;
  const v=numInput("fractionInput");if(v===null)return feedback("fractionFeedback","Write the percentage label first.","bad");
  if(closeEnough(v,state.current.fraction.ans)){rabbitSay(praise[rand(0,praise.length-1)],true);advanceSimpleProblem("fraction");}
  else simpleWrongAttempt("fraction","fractionFeedback");
}

// Quest 4 decimal to percent
function genDecimal(){
  disableSimpleCurrentControls("decimal",false);
  let hundredths=rand(5,95);if(hundredths%10===0)hundredths+=rand(1,8);hundredths=Math.min(hundredths,99);const dec=hundredths/100;
  state.current.decimal={dec,pct:hundredths,rescued:false,
    hints:[
      `The decimal tells you a part of <strong>1 whole</strong>. A percentage tells you the same part if the whole were split into <strong>100</strong>.`,
      `Look at place value: tenths and hundredths can be rewritten as an amount out of 100. For example, 0.42 means 42 hundredths.`
    ],
    finalSolution:`<p><strong>${fmt(dec)}</strong> means <strong>${hundredths} hundredths</strong>.</p><p>So it is ${fractionHTML(hundredths,100)} = <strong>${hundredths}%</strong>.</p>`,
    answerText:`${hundredths}%`
  };
  $("decimalPrompt").textContent=dec.toFixed(2).replace(/0+$/,'').replace(/\.$/,'');$("decimalInput").value="";$("potionFill").style.height=`${hundredths}%`;$("decimalFeedback").textContent="";resetSimpleHelp("decimal");
}
function checkDecimal(){
  if(state.completed.decimal||state.current.decimal.rescued)return;
  const v=numInput("decimalInput");if(v===null)return feedback("decimalFeedback","Write the percentage first.","bad");
  if(closeEnough(v,state.current.decimal.pct)){rabbitSay(praise[rand(0,praise.length-1)],true);advanceSimpleProblem("decimal");}
  else simpleWrongAttempt("decimal","decimalFeedback");
}

// Quest 5 percentage OF a quantity — OF = ×
const STRATS=[10,50,25,20,5,30,15];
function percentForms(p){
  const dec=p/100;
  const gcd=(a,b)=>b?gcd(b,a%b):a;
  const g=gcd(p,100),n=p/g,d=100/g;
  return {dec,n,d};
}
function genQuantity(){
  disableSimpleCurrentControls("quantity",false);
  const p=state.solved.quantity===0?[10,25,50][rand(0,2)]:STRATS[rand(0,STRATS.length-1)];
  let total;if(p===25)total=rand(6,30)*4;else if([5,15].includes(p))total=rand(3,12)*20;else total=rand(4,20)*10;
  const ans=p/100*total,{dec,n,d}=percentForms(p);
  const contexts=[`The Queen has <strong>${total} roses</strong>. She wants <strong>${p}%</strong> of them to be red.`,`There are <strong>${total} flower cards</strong>. <strong>${p}%</strong> of them go into the royal bouquet.`,`A garden bed contains <strong>${total} flowers</strong>. <strong>${p}%</strong> of them are magical.`];
  state.current.quantity={p,total,ans,rescued:false,
    hints:[
      `Look at the word <strong>of</strong>. In maths, <strong>of means ×</strong>. Rewrite the phrase as <strong>${p}% × ${total}</strong>. What form of ${p}% would be easiest to use?`,
      `Before multiplying, choose a useful form for ${p}%: <strong>${p}% = ${fmt(dec)} = ${fractionHTML(n,d)}</strong>. Which form feels easiest to multiply by ${total}?`
    ],
    finalSolution:`<p>Start by translating the language: <strong>of = ×</strong>.</p><p>${p}% of ${total} = ${p}% × ${total}.</p><p>Convert the percentage: <strong>${p}% = ${fmt(dec)}</strong>.</p><p>Then multiply: <strong>${fmt(dec)} × ${total} = ${fmt(ans)}</strong>.</p>`,
    answerText:fmt(ans)
  };
  $("quantityStory").innerHTML=contexts[rand(0,contexts.length-1)];$("quantityMath").innerHTML=`${p}% <span class="of-word">of</span> ${total} = ?`;
  $("quantityInput").value="";$("quantityFeedback").textContent="";resetSimpleHelp("quantity");
}
function updateRoses(){$("roseRewards").querySelectorAll("span").forEach((s,i)=>{s.textContent=i<state.solved.quantity?"🌹":"○";s.classList.toggle("bloom",i<state.solved.quantity)})}
function checkQuantity(){
  if(state.completed.quantity||state.current.quantity.rescued)return;
  const v=numInput("quantityInput");if(v===null)return feedback("quantityFeedback","Write the number first.","bad");
  if(closeEnough(v,state.current.quantity.ans)){updateRoses();rabbitSay(praise[rand(0,praise.length-1)],true);advanceSimpleProblem("quantity");}
  else simpleWrongAttempt("quantity","quantityFeedback");
}

// Story quests 6–8: one problem per quest with progressive hints and 3-wrong rescue
function resetStoryHelp(key,attemptId,hintBoxId,feedbackId){
  state.storyWrong[key]=0;state.storyHintLevel[key]=0;setAttemptDots(attemptId,0);$(hintBoxId).classList.add("hidden");$(hintBoxId).innerHTML="";$(feedbackId).textContent="";
}
function showStoryHint(key,hintBoxId){
  if(state.completed[key])return;
  const s=state.current[key];if(!s)return;const level=Math.min(state.storyHintLevel[key],s.hints.length-1);
  $(hintBoxId).innerHTML=`<div class="clue-heading">Clue ${level+1}</div>${s.hints[level]}`;$(hintBoxId).classList.remove("hidden");state.storyHintLevel[key]=Math.min(level+1,s.hints.length-1);
}
function finishStoryQuest(key,feedbackId,nextId,visualId,message,assisted=false){
  if(state.completed[key])return;unlockQuest(key);$(nextId).disabled=false;$(nextId).classList.remove("locked");$(visualId).classList.add("complete");
  const storyControlIds={
    discountStory:["discountNew","discountHint","discountCheck","discountInput"],
    percentStory:["percentStoryNew","percentStoryHint","percentStoryCheck","percentStoryInput"],
    remainingStory:["remainingNew","remainingHint","remainingCheck","remainingInput"],
    teaCrowdStory:["teaCrowdNew","teaCrowdHint","teaCrowdCheck","teaCrowdInput"],
    fractionCakeStory:["fractionCakeNew","fractionCakeHint","fractionCakeCheck","fractionCakeInput"],
    decimalEmptyStory:["decimalEmptyNew","decimalEmptyHint","decimalEmptyCheck","decimalEmptyInput"],
    budgetStory:["budgetNew","budgetHint","budgetCheck","budgetInput"],
    reverseStory:["reverseNew","reverseHint","reverseCheck","reverseInput"]
  }[key]||[];
  storyControlIds.forEach(id=>{if($(id))$(id).disabled=true;});
  feedback(feedbackId,assisted?"We solved it together. Read the worked answer, then continue when you're ready. ♡":message,"good");
  rabbitSay(assisted?"Tricky one! Now you know a path through it. Let's keep going. 🐇♡":praise[rand(0,praise.length-1)],true);
}
function storyWrongAttempt(key,attemptId,hintBoxId,feedbackId,nextId,visualId,successMessage){
  if(state.completed[key])return;state.storyWrong[key]++;setAttemptDots(attemptId,state.storyWrong[key]);const s=state.current[key];
  if(state.storyWrong[key]>=3){
    $(hintBoxId).innerHTML=`<div class="final-rescue"><strong>Let's solve this one together.</strong>${s.finalSolution}<div class="answer-reveal">Answer: <strong>${s.answer} ${s.unit}</strong></div></div>`;$(hintBoxId).classList.remove("hidden");s.onReveal?.();finishStoryQuest(key,feedbackId,nextId,visualId,successMessage,true);
  }else{
    feedback(feedbackId,state.storyWrong[key]===1?"Not yet — check what the question is actually asking you to find.":"Still tricky. Try the clue button and focus on the relationship between the numbers.","bad");
    rabbitSay(state.storyWrong[key]===1?"No rush. What is the story actually asking you to find? 💭":"Use one clue at a time — you don't need the whole solution yet. 🐇");
  }
}

function genDiscountStory(){
  const pct=[10,20,25,50][rand(0,3)],price=pct===25?rand(4,15)*20:rand(4,15)*10,discount=price*pct/100,answer=price-discount,dec=pct/100;
  state.current.discountStory={answer,unit:"coins",hints:[
    `First identify the target. <strong>${pct}% off</strong> tells you the amount removed, but the question asks for the <strong>sale price</strong>. Which quantity must you find before you can subtract?`,
    `For the discount itself, read <strong>of as ×</strong>: <strong>${pct}% of ${price} → ${pct}% × ${price}</strong>. What decimal or fraction is equal to ${pct}%?`
  ],finalSolution:`<p>Translate <strong>of = ×</strong>: the discount is ${pct}% × ${price}.</p><p>${pct}% = ${fmt(dec)}, so <strong>${fmt(dec)} × ${price} = ${discount}</strong> coins are removed.</p><p>Then the sale price is <strong>${price} − ${discount} = ${answer}</strong> coins.</p>`,onReveal:()=>{$("discountSaleVisual").textContent=answer;$("discountBurst").textContent=`−${pct}%`;}};
  $("discountPrompt").innerHTML=`At the Mad Hatter's shop, a hat costs <strong>${price} coins</strong>. It is <strong>${pct}% off</strong>. What is the <strong>sale price</strong>?`;
  $("discountOriginalVisual").textContent=price;$("discountSaleVisual").textContent="?";$("discountBurst").textContent=`−${pct}%`;$("discountInput").value="";$("discountVisual").classList.remove("complete");$("discountNew").disabled=false;resetStoryHelp("discountStory","discountAttempts","discountHintBox","discountFeedback");
}
function checkDiscountStory(){
  if(state.completed.discountStory)return;const v=numInput("discountInput");if(v===null)return feedback("discountFeedback","Write a sale price first.","bad");const s=state.current.discountStory;
  if(closeEnough(v,s.answer)){$("discountSaleVisual").textContent=s.answer;finishStoryQuest("discountStory","discountFeedback","discountNext","discountVisual","Exactly — you found the price Alice actually pays! 🎩✨");$("discountNew").disabled=true;}else storyWrongAttempt("discountStory","discountAttempts","discountHintBox","discountFeedback","discountNext","discountVisual","Hat bought!");
}

function genPercentStory(){
  let pct,total,part;do{pct=[20,25,40,50,60,75,80][rand(0,6)];total=[20,40,50,80,100][rand(0,4)];part=total*pct/100;}while(!Number.isInteger(part));
  state.current.percentStory={answer:pct,unit:"%",hints:[
    `For <strong>percentage of the whole</strong>, use the relationship <strong>part amount ÷ whole amount × 100%</strong>. Here, place <strong>${part}</strong> as the part and <strong>${total}</strong> as the whole.`,
    `Set it up as <strong>${part} ÷ ${total} × 100%</strong>. Work through that calculation to find the percentage.`
  ],finalSolution:`<p>Use the percentage-of-the-whole guide:</p><p><strong>part amount ÷ whole amount × 100%</strong></p><p>So, <strong>${part} ÷ ${total} × 100% = ${pct}%</strong>.</p>`,onReveal:()=>{$("keyPercentVisual").textContent=`${pct}%`;}};
  $("percentPrompt").innerHTML=`The White Rabbit collected <strong>${part} golden keys</strong> out of <strong>${total} keys</strong>. What percentage of the keys are golden?`;
  $("keyPartVisual").textContent=part;$("keyWholeVisual").textContent=total;$("keyPercentVisual").textContent="?%";$("percentStoryInput").value="";$("percentVisual").classList.remove("complete");$("percentStoryNew").disabled=false;resetStoryHelp("percentStory","percentStoryAttempts","percentStoryHintBox","percentStoryFeedback");
}
function checkPercentStory(){
  if(state.completed.percentStory)return;const v=numInput("percentStoryInput");if(v===null)return feedback("percentStoryFeedback","Write a percentage first.","bad");const s=state.current.percentStory;
  if(closeEnough(v,s.answer)){$("keyPercentVisual").textContent=`${s.answer}%`;finishStoryQuest("percentStory","percentStoryFeedback","percentStoryNext","percentVisual","Yes! You described the part as a percentage of the whole. 🔑✨");$("percentStoryNew").disabled=true;}else storyWrongAttempt("percentStory","percentStoryAttempts","percentStoryHintBox","percentStoryFeedback","percentStoryNext","percentVisual","Keys sorted!");
}

function genRemainingStory(){
  const pct=[20,25,30,40][rand(0,3)],total=rand(5,15)*20,used=total*pct/100,answer=total-used,remainingPct=100-pct,dec=pct/100;
  state.current.remainingStory={answer,unit:"mL",hints:[
    `Alice uses <strong>${pct}%</strong>. Ask what <strong>left</strong> means here: should the final amount be smaller or larger than ${total} mL?`,
    `To find how much was used, translate <strong>of = ×</strong>: <strong>${pct}% of ${total} → ${pct}% × ${total}</strong>. What decimal or fraction could replace ${pct}%?`
  ],finalSolution:`<p>First find the used amount with <strong>of = ×</strong>.</p><p>${pct}% = ${fmt(dec)}, so <strong>${fmt(dec)} × ${total} = ${used}</strong> mL were used.</p><p>Then subtract from the starting amount: <strong>${total} − ${used} = ${answer}</strong> mL left.</p>`,onReveal:()=>{$("remainingVisualAnswer").textContent=`${answer} mL left`;$("remainingPotionFill").style.height=`${remainingPct}%`;}};
  $("remainingPrompt").innerHTML=`A potion bottle holds <strong>${total} mL</strong>. Alice uses <strong>${pct}%</strong> of it. How many mL are <strong>left</strong>?`;
  $("usedTag").textContent=`used ${pct}%`;$("remainingVisualAnswer").textContent="How much is left?";$("remainingPotionFill").style.height="100%";$("remainingInput").value="";$("remainingVisual").classList.remove("complete");$("remainingNew").disabled=false;resetStoryHelp("remainingStory","remainingAttempts","remainingHintBox","remainingFeedback");
}
function checkRemainingStory(){
  if(state.completed.remainingStory)return;const v=numInput("remainingInput");if(v===null)return feedback("remainingFeedback","Write the amount left first.","bad");const s=state.current.remainingStory;
  if(closeEnough(v,s.answer)){s.onReveal();finishStoryQuest("remainingStory","remainingFeedback","remainingNext","remainingVisual","Exactly — you found what remains, not what was used. 🧪✨");$("remainingNew").disabled=true;}else storyWrongAttempt("remainingStory","remainingAttempts","remainingHintBox","remainingFeedback","remainingNext","remainingVisual","Potion saved!");
}


// ---------- CHAPTER 3: gentle advanced story practice ----------
function genTeaCrowdStory(){
  const pct=[15,20,25,30,35,40,45,50,60,75][rand(0,9)];
  const total=rand(2,8)*20;
  const answer=pct/100*total;
  const dec=pct/100;
  state.current.teaCrowdStory={answer,unit:"guests",hints:[
    `Find the phrase that connects the percentage to the total. In <strong>${pct}% of ${total}</strong>, what mathematical operation does <strong>of</strong> represent?`,
    `You can rewrite ${pct}% as <strong>${fmt(dec)}</strong>. Now the story becomes <strong>${fmt(dec)} × ${total}</strong>. What total does that describe?`
  ],finalSolution:`<p>The story asks for ${pct}% <strong>of</strong> ${total}, and <strong>of = ×</strong>.</p><p>${pct}% = ${fmt(dec)}, so <strong>${fmt(dec)} × ${total} = ${fmt(answer)}</strong>.</p>`,onReveal:()=>{$("crowdAnswerVisual").textContent=fmt(answer);}};
  $("teaCrowdPrompt").innerHTML=`There are <strong>${total} guests</strong> at the tea party. <strong>${pct}%</strong> of them choose the special rose tea. How many guests choose the special tea?`;
  $("crowdPercentVisual").textContent=`${pct}%`;
  $("crowdAnswerVisual").textContent="?";
  $("teaCrowdInput").value="";
  $("teaCrowdVisual").classList.remove("complete");
  $("teaCrowdNew").disabled=false;
  resetStoryHelp("teaCrowdStory","teaCrowdAttempts","teaCrowdHintBox","teaCrowdFeedback");
}
function checkTeaCrowdStory(){
  if(state.completed.teaCrowdStory)return;
  const v=numInput("teaCrowdInput");if(v===null)return feedback("teaCrowdFeedback","Write the number of guests first.","bad");
  const st=state.current.teaCrowdStory;
  if(closeEnough(v,st.answer)){st.onReveal();finishStoryQuest("teaCrowdStory","teaCrowdFeedback","teaCrowdNext","teaCrowdVisual","Exactly! You translated ‘of’ into multiplication. 🫖✨");}
  else storyWrongAttempt("teaCrowdStory","teaCrowdAttempts","teaCrowdHintBox","teaCrowdFeedback","teaCrowdNext","teaCrowdVisual","Tea served!");
}

const CAKE_FRACS=[{n:1,d:2},{n:1,d:4},{n:3,d:4},{n:1,d:5},{n:2,d:5},{n:3,d:5},{n:4,d:5},{n:3,d:10},{n:7,d:10}];
function genFractionCakeStory(){
  const f=CAKE_FRACS[rand(0,CAKE_FRACS.length-1)],answer=f.n/f.d*100,k=100/f.d;
  state.current.fractionCakeStory={answer,unit:"%",hints:[
    `The story gives the share as ${fractionHTML(f.n,f.d)}. A percentage describes the same share <strong>out of 100</strong>. What could happen to the denominator ${f.d}?`,
    `To keep an equivalent fraction, whatever multiplies the denominator must also multiply the numerator. Which number changes <strong>${f.d} → 100</strong>?`
  ],finalSolution:`<p>Make an equivalent fraction with denominator 100.</p><p>${fractionHTML(f.n,f.d)} × ${fractionHTML(k,k)} = ${fractionHTML(f.n*k,100)}.</p><p>So the cake share is <strong>${fmt(answer)}%</strong>.</p>`,onReveal:()=>{$("cakePercentVisual").textContent=`${fmt(answer)}%`;}};
  $("fractionCakePrompt").innerHTML=`At the Mad Hatter's cake stand, ${fractionHTML(f.n,f.d)} of all the cupcakes are rose-flavoured. What <strong>percentage</strong> of the cupcakes are rose-flavoured?`;
  $("cakeFractionVisual").innerHTML=fractionHTML(f.n,f.d);
  $("cakePercentVisual").textContent="?%";$("fractionCakeInput").value="";$("fractionCakeVisual").classList.remove("complete");$("fractionCakeNew").disabled=false;
  resetStoryHelp("fractionCakeStory","fractionCakeAttempts","fractionCakeHintBox","fractionCakeFeedback");
}
function checkFractionCakeStory(){
  if(state.completed.fractionCakeStory)return;const v=numInput("fractionCakeInput");if(v===null)return feedback("fractionCakeFeedback","Write the percentage first.","bad");const st=state.current.fractionCakeStory;
  if(closeEnough(v,st.answer)){st.onReveal();finishStoryQuest("fractionCakeStory","fractionCakeFeedback","fractionCakeNext","fractionCakeVisual","Perfect translation — same share, new form! 🧁✨");}
  else storyWrongAttempt("fractionCakeStory","fractionCakeAttempts","fractionCakeHintBox","fractionCakeFeedback","fractionCakeNext","fractionCakeVisual","Cake label fixed!");
}

function genDecimalEmptyStory(){
  const filledPct=[25,35,40,45,55,60,65,70,75,80,85][rand(0,10)],dec=filledPct/100,answer=100-filledPct;
  state.current.decimalEmptyStory={answer,unit:"% empty",hints:[
    `The decimal <strong>${fmt(dec)}</strong> tells how much of one whole is <strong>filled</strong>. What percentage represents that same filled amount?`,
    `A complete bottle is <strong>100%</strong>. Once you know the filled percentage, how are <strong>filled</strong> and <strong>empty</strong> connected?`
  ],finalSolution:`<p>${fmt(dec)} = <strong>${filledPct}% filled</strong>.</p><p>The whole bottle is 100%, so the empty part is <strong>100% − ${filledPct}% = ${answer}%</strong>.</p>`,onReveal:()=>{$("decimalEmptyAnswerVisual").textContent=`${answer}% empty`;}};
  $("decimalEmptyPrompt").innerHTML=`A potion bottle is <strong>${fmt(dec)}</strong> full. What <strong>percentage of the bottle is empty</strong>?`;
  $("decimalFullBadge").textContent=`${fmt(dec)} full`;$("advancedBottleFill").style.height=`${filledPct}%`;$("decimalEmptyAnswerVisual").textContent="?% empty";$("decimalEmptyInput").value="";$("decimalEmptyVisual").classList.remove("complete");$("decimalEmptyNew").disabled=false;
  resetStoryHelp("decimalEmptyStory","decimalEmptyAttempts","decimalEmptyHintBox","decimalEmptyFeedback");
}
function checkDecimalEmptyStory(){
  if(state.completed.decimalEmptyStory)return;const v=numInput("decimalEmptyInput");if(v===null)return feedback("decimalEmptyFeedback","Write the empty percentage first.","bad");const st=state.current.decimalEmptyStory;
  if(closeEnough(v,st.answer)){st.onReveal();finishStoryQuest("decimalEmptyStory","decimalEmptyFeedback","decimalEmptyNext","decimalEmptyVisual","Exactly — filled and empty complete the whole bottle! 🧪✨");}
  else storyWrongAttempt("decimalEmptyStory","decimalEmptyAttempts","decimalEmptyHintBox","decimalEmptyFeedback","decimalEmptyNext","decimalEmptyVisual","Potion decoded!");
}

function genBudgetStory(){
  const pct=[10,20,25,50][rand(0,3)];
  let price;
  if(pct===25)price=rand(4,10)*20;else price=rand(6,16)*10;
  const discount=price*pct/100,sale=price-discount,budget=sale+rand(2,6)*10,answer=budget-sale,dec=pct/100;
  state.current.budgetStory={answer,unit:"coins left",hints:[
    `The final question asks how many coins are <strong>left</strong>. Which price do you need before you can compare the purchase with Alice's ${budget}-coin budget?`,
    `Find the discount using <strong>of = ×</strong>: ${pct}% of ${price}. Then the sale price is the original price minus that discount.`
  ],finalSolution:`<p>The discount is ${pct}% of ${price}: <strong>${fmt(dec)} × ${price} = ${fmt(discount)}</strong> coins.</p><p>Sale price: <strong>${price} − ${fmt(discount)} = ${fmt(sale)}</strong>.</p><p>Alice has ${budget}, so she has <strong>${budget} − ${fmt(sale)} = ${fmt(answer)}</strong> coins left.</p>`,onReveal:()=>{$("budgetSaleVisual").textContent=fmt(sale);$("budgetLeftVisual").textContent=fmt(answer);}};
  $("budgetPrompt").innerHTML=`A Wonderland hat costs <strong>${price} coins</strong> and is <strong>${pct}% off</strong>. Alice has <strong>${budget} coins</strong>. After buying the hat, how many coins does she have <strong>left</strong>?`;
  $("budgetStartVisual").textContent=budget;$("budgetSaleVisual").textContent="?";$("budgetLeftVisual").textContent="?";$("budgetInput").value="";$("budgetVisual").classList.remove("complete");$("budgetNew").disabled=false;
  resetStoryHelp("budgetStory","budgetAttempts","budgetHintBox","budgetFeedback");
}
function checkBudgetStory(){
  if(state.completed.budgetStory)return;const v=numInput("budgetInput");if(v===null)return feedback("budgetFeedback","Write the coins left first.","bad");const st=state.current.budgetStory;
  if(closeEnough(v,st.answer)){st.onReveal();finishStoryQuest("budgetStory","budgetFeedback","budgetNext","budgetVisual","Yes! You connected both steps without losing the question. 🪙✨");}
  else storyWrongAttempt("budgetStory","budgetAttempts","budgetHintBox","budgetFeedback","budgetNext","budgetVisual","Budget balanced!");
}

function genReverseStory(){
  const pct=[20,25,50][rand(0,2)],chunks=100/pct,known=rand(3,10)*3,answer=known*chunks;
  state.current.reverseStory={answer,unit:"roses",hints:[
    `<strong>${pct}%</strong> of the garden equals <strong>${known} roses</strong>. Think of ${pct}% as one equal chunk. How many ${pct}% chunks fit into 100%?`,
    `Every equal percentage chunk represents the same number of roses. If one chunk has ${known} roses, what happens when you join all <strong>${chunks}</strong> chunks?`
  ],finalSolution:`<p>100% contains <strong>${chunks}</strong> equal chunks of ${pct}%.</p><p>Each chunk has ${known} roses, so the whole garden has <strong>${known} × ${chunks} = ${answer}</strong> roses.</p>`,onReveal:()=>{renderRoseChunks(pct,chunks,known,true);$("reverseAnswerVisual").textContent=answer;}};
  $("reversePrompt").innerHTML=`The Queen says <strong>${pct}%</strong> of her roses are red. There are <strong>${known} red roses</strong>. How many roses are in the <strong>whole garden</strong>?`;
  renderRoseChunks(pct,chunks,known,false);$("reverseAnswerVisual").textContent="?";$("reverseInput").value="";$("reverseVisual").classList.remove("complete");$("reverseNew").disabled=false;
  resetStoryHelp("reverseStory","reverseAttempts","reverseHintBox","reverseFeedback");
}
function renderRoseChunks(pct,chunks,known,reveal){
  $("roseChunks").innerHTML=Array.from({length:chunks},(_,i)=>`<div class="rose-chunk ${i===0?"known":""}"><span>🌹</span><strong>${pct}%</strong><small>${i===0||reveal?known:"?"} roses</small></div>`).join("");
}
function checkReverseStory(){
  if(state.completed.reverseStory)return;const v=numInput("reverseInput");if(v===null)return feedback("reverseFeedback","Write the whole number of roses first.","bad");const st=state.current.reverseStory;
  if(closeEnough(v,st.answer)){st.onReveal();finishStoryQuest("reverseStory","reverseFeedback","reverseNext","reverseVisual","You rebuilt 100% from one known piece — final mystery solved! 🌹✨");}
  else storyWrongAttempt("reverseStory","reverseAttempts","reverseHintBox","reverseFeedback","reverseNext","reverseVisual","Garden revealed!");
}

function reset(){
  Object.keys(state.solved).forEach(k=>state.solved[k]=0);
  Object.keys(state.completed).forEach(k=>state.completed[k]=false);
  SIMPLE_QUESTS.forEach(k=>{state.simpleWrong[k]=0;state.simpleHintLevel[k]=0;});
  STORY_QUESTS.forEach(k=>{state.storyWrong[k]=0;state.storyHintLevel[k]=0;});
  state.highestUnlocked=0;
  ["fdpNext","hundredNext","fractionNext","decimalNext","quantityNext","discountNext","percentStoryNext","remainingNext","teaCrowdNext","fractionCakeNext","decimalEmptyNext","budgetNext","reverseNext"].forEach(id=>{$(id).disabled=true;$(id).classList.add("locked")});
  $("fdpDoorAnimation").classList.remove("complete");
  updateRoses();
  genFdp();genHundred();genFraction();genDecimal();genQuantity();genDiscountStory();genPercentStory();genRemainingStory();
  genTeaCrowdStory();genFractionCakeStory();genDecimalEmptyStory();genBudgetStory();genReverseStory();
  showScene("intro");updateMap();
}

$("startBtn").addEventListener("click",()=>showScene("fdp"));
$("teacherPassBtn").addEventListener("click",teacherPass);
$("restartBtn").addEventListener("click",reset);
$("againBtn").addEventListener("click",reset);
$("chapter3Btn").addEventListener("click",()=>showScene("teaCrowdStory"));
document.querySelectorAll(".map-node").forEach((b,i)=>b.addEventListener("click",()=>{if(i<=state.highestUnlocked)showScene(b.dataset.target)}));

$("fdpHint").addEventListener("click",()=>showSimpleHint("fdp"));$("fdpNew").addEventListener("click",genFdp);$("fdpNext").addEventListener("click",()=>showScene("hundred"));
$("hundredCheck").addEventListener("click",checkHundred);$("hundredHint").addEventListener("click",()=>showSimpleHint("hundred"));$("hundredNew").addEventListener("click",genHundred);$("hundredNext").addEventListener("click",()=>showScene("fraction"));
$("fractionCheck").addEventListener("click",checkFraction);$("fractionHint").addEventListener("click",()=>showSimpleHint("fraction"));$("fractionNew").addEventListener("click",genFraction);$("fractionNext").addEventListener("click",()=>showScene("decimal"));
$("decimalCheck").addEventListener("click",checkDecimal);$("decimalHint").addEventListener("click",()=>showSimpleHint("decimal"));$("decimalNew").addEventListener("click",genDecimal);$("decimalNext").addEventListener("click",()=>showScene("quantity"));
$("quantityCheck").addEventListener("click",checkQuantity);$("quantityHint").addEventListener("click",()=>showSimpleHint("quantity"));$("quantityNew").addEventListener("click",genQuantity);$("quantityNext").addEventListener("click",()=>showScene("discountStory"));
$("discountCheck").addEventListener("click",checkDiscountStory);$("discountHint").addEventListener("click",()=>showStoryHint("discountStory","discountHintBox"));$("discountNew").addEventListener("click",genDiscountStory);$("discountNext").addEventListener("click",()=>showScene("percentStory"));
$("percentStoryCheck").addEventListener("click",checkPercentStory);$("percentStoryHint").addEventListener("click",()=>showStoryHint("percentStory","percentStoryHintBox"));$("percentStoryNew").addEventListener("click",genPercentStory);$("percentStoryNext").addEventListener("click",()=>showScene("remainingStory"));
$("remainingCheck").addEventListener("click",checkRemainingStory);$("remainingHint").addEventListener("click",()=>showStoryHint("remainingStory","remainingHintBox"));$("remainingNew").addEventListener("click",genRemainingStory);$("remainingNext").addEventListener("click",()=>showScene("finish"));

$("teaCrowdCheck").addEventListener("click",checkTeaCrowdStory);$("teaCrowdHint").addEventListener("click",()=>showStoryHint("teaCrowdStory","teaCrowdHintBox"));$("teaCrowdNew").addEventListener("click",genTeaCrowdStory);$("teaCrowdNext").addEventListener("click",()=>showScene("fractionCakeStory"));
$("fractionCakeCheck").addEventListener("click",checkFractionCakeStory);$("fractionCakeHint").addEventListener("click",()=>showStoryHint("fractionCakeStory","fractionCakeHintBox"));$("fractionCakeNew").addEventListener("click",genFractionCakeStory);$("fractionCakeNext").addEventListener("click",()=>showScene("decimalEmptyStory"));
$("decimalEmptyCheck").addEventListener("click",checkDecimalEmptyStory);$("decimalEmptyHint").addEventListener("click",()=>showStoryHint("decimalEmptyStory","decimalEmptyHintBox"));$("decimalEmptyNew").addEventListener("click",genDecimalEmptyStory);$("decimalEmptyNext").addEventListener("click",()=>showScene("budgetStory"));
$("budgetCheck").addEventListener("click",checkBudgetStory);$("budgetHint").addEventListener("click",()=>showStoryHint("budgetStory","budgetHintBox"));$("budgetNew").addEventListener("click",genBudgetStory);$("budgetNext").addEventListener("click",()=>showScene("reverseStory"));
$("reverseCheck").addEventListener("click",checkReverseStory);$("reverseHint").addEventListener("click",()=>showStoryHint("reverseStory","reverseHintBox"));$("reverseNew").addEventListener("click",genReverseStory);$("reverseNext").addEventListener("click",()=>showScene("finale"));

[["hundredInput",checkHundred],["fractionInput",checkFraction],["decimalInput",checkDecimal],["quantityInput",checkQuantity],["discountInput",checkDiscountStory],["percentStoryInput",checkPercentStory],["remainingInput",checkRemainingStory],["teaCrowdInput",checkTeaCrowdStory],["fractionCakeInput",checkFractionCakeStory],["decimalEmptyInput",checkDecimalEmptyStory],["budgetInput",checkBudgetStory],["reverseInput",checkReverseStory]].forEach(([id,fn])=>$(id).addEventListener("keydown",e=>{if(e.key==="Enter")fn()}));
reset();
