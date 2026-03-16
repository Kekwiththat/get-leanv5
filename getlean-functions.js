// ======================= TAB NAVIGATION =======================
function tab(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ======================= GLOBAL VARIABLES =======================
let programStartDate=null;
let programDays=42;
let calorieGoal=1800;
let stepGoal=10000;

let caloriesData=[], waterData=[], stepsData=[], weightData=[];
let streakCount=0;

let workoutTimer=null, workoutSeconds=0;

let caloriesChart, waterChart, stepsChart, weightChart;

// ======================= DASHBOARD MOTIVATION =======================
const motivations=["Keep pushing!","Stay consistent!","Every step counts!","Fuel your body right!","Consistency is key!"];
function setMotivation(){
  document.getElementById('motivation').innerText=motivations[Math.floor(Math.random()*motivations.length)];
}

// ======================= PROGRAM TIMER =======================
function startProgram(){
  const dateInput=document.getElementById('startDate').value;
  if(!dateInput){alert("Please select a start date"); return;}
  programStartDate=new Date(dateInput);
  programDays=42;
  initializeArrays(programDays);
  updateDashboardRings();
  updateCharts();
  displayProgramDay();
}

function displayProgramDay(){
  if(!programStartDate) return;
  const today=new Date();
  const diff=Math.floor((today-programStartDate)/(1000*60*60*24))+1;
  document.getElementById('dayDisplay').innerText=`Day ${diff} of ${programDays}`;
  if(diff<=programDays) setTimeout(displayProgramDay,60000);
}

// ======================= INITIALIZE DATA ARRAYS =======================
function initializeArrays(days){
  caloriesData=new Array(days).fill(0);
  waterData=new Array(days).fill(0);
  stepsData=new Array(days).fill(0);
  weightData=new Array(days).fill(0);
}

// ======================= MEAL TRACKER =======================
function addMeal(){
  const chicken=Number(document.getElementById('chicken').value)||0;
  const rice=Number(document.getElementById('brownRice').value)||0;
  const broccoli=Number(document.getElementById('broccoli').value)||0;
  const juice=Number(document.getElementById('juice').value)||0;
  const custom=Number(document.getElementById('custom').value)||0;
  const total=Math.round(chicken*50 + rice*200 + broccoli*50 + juice + custom);
  const todayIndex=getTodayIndex();
  if(todayIndex!==-1){caloriesData[todayIndex]=total;}
  document.getElementById('calories').innerHTML=`<span style="color:${total<=calorieGoal?'green':'red'}">Calories: ${total}</span>`;
  updateDashboardRings();
  updateCharts();
  notifyUser(`Meal added: ${total} kcal`);
}

// ======================= WATER TRACKER =======================
function addWater(){modifyWater(1);}
function removeWater(){modifyWater(-1);}
function resetWater(){
  const idx=getTodayIndex();
  if(idx!==-1) waterData[idx]=0;
  updateDashboardRings();
  updateCharts();
}
function modifyWater(amount){
  const idx=getTodayIndex();
  if(idx===-1) return;
  waterData[idx]+=amount;
  if(waterData[idx]<0) waterData[idx]=0;
  if(waterData[idx]>16) waterData[idx]=16;
  document.getElementById('water').innerText=waterData[idx];
  updateDashboardRings();
  updateCharts();
  notifyUser(`Water: ${waterData[idx]}/16 glasses`);
}

// ======================= STEP TRACKER =======================
function updateSteps(){
  const val=Number(document.getElementById('steps').value)||0;
  const idx=getTodayIndex();
  if(idx!==-1) stepsData[idx]=val;
  document.getElementById('stepsDisplay').innerText=`Steps Today: ${val}`;
  updateDashboardRings();
  updateCharts();
  notifyUser(`Steps updated: ${val}`);
}

// ======================= WEIGHT TRACKER =======================
function addWeight(){
  const val=Number(document.getElementById('weightInput').value)||0;
  const idx=getTodayIndex();
  if(idx!==-1) weightData[idx]=val;
  updateCharts();
  notifyUser(`Weight added: ${val}`);
}

// ======================= BMI & BODY FAT =======================
function calcBMI(){
  const height=Number(document.getElementById('height').value);
  const weight=Number(document.getElementById('bmiWeight').value);
  if(!height||!weight) return;
  const bmi=(weight/(height*height))*703;
  document.getElementById('bmi').innerText=`BMI: ${bmi.toFixed(1)}`;
}
function saveBodyFat(){
  const val=document.getElementById('bodyfat').value;
  document.getElementById('bfList').innerText=`${val}%`;
}

// ======================= MACROS & MEAL PLAN =======================
function calcMacros(){
  const cals=Number(document.getElementById('macroCalories').value)||0;
  const protein=Math.round(cals*0.3/4);
  const carbs=Math.round(cals*0.4/4);
  const fat=Math.round(cals*0.3/9);
  document.getElementById('macroResult').innerText=`Protein: ${protein}g, Carbs: ${carbs}g, Fat: ${fat}g`;
}
function mealPlan(){
  const cals=Number(document.getElementById('planCalories').value)||1750;
  const chicken=Math.round(cals*0.25/50);
  const rice=Math.round(cals*0.3/200);
  const broccoli=Math.round(cals*0.2/50);
  const juice=Math.round(cals*0.25/120);
  document.getElementById('plan').innerText=`Chicken: ${chicken}oz, Brown Rice: ${rice} cups, Broccoli: ${broccoli} cups, Juice: ${juice} kcal`;
}

// ======================= FAT LOSS SIMULATOR =======================
function simulate(){
  const cw=Number(document.getElementById('currentWeight').value)||0;
  const gw=Number(document.getElementById('goalWeight').value)||0;
  const pd=Number(document.getElementById('programDays').value)||42;
  if(!cw||!gw) return;
  const dailyDeficit=((cw-gw)*3500)/pd;
  let simWeight=[];
  for(let i=0;i<pd;i++){simWeight.push(cw-i*(dailyDeficit/3500));}
  const ctx=document.getElementById('weightSimChart').getContext('2d');
  new Chart(ctx,{
    type:'line',
    data:{
      labels:Array.from({length:pd},(_,i)=>`Day ${i+1}`),
      datasets:[
        {label:'Projected Weight',data:simWeight,borderColor:'purple',fill:false},
        {label:'Target',data:Array(pd).fill(gw),borderColor:'black',borderDash:[5,5],fill:false}
      ]
    },
    options:{responsive:true}
  });
  document.getElementById('result').innerText=`Daily Calorie Deficit Needed: ${Math.round(dailyDeficit)} kcal`;
}

// ======================= 10-MINUTE HOME WORKOUT =======================
function startWorkout(){
  if(workoutTimer) clearInterval(workoutTimer);
  workoutTimer=setInterval(()=>{
    workoutSeconds++;
    document.getElementById('workoutTimerBar').value=workoutSeconds;
    if(workoutSeconds>=600) clearInterval(workoutTimer);
  },1000);
}
function stopWorkout(){if(workoutTimer) clearInterval(workoutTimer);}
function resetWorkout(){if(workoutTimer) clearInterval(workoutTimer); workoutSeconds=0; document.getElementById('workoutTimerBar').value=0;}

// ======================= GYM WORKOUT PLAN =======================
const gymPlan={
  Monday:['Bench Press','Dumbbell Fly','Tricep Dips'],
  Tuesday:['Pull-ups','Row','Dumbbell Curls'],
  Wednesday:['Squats','Lunges','Leg Press'],
  Thursday:['Shoulder Press','Lateral Raise','Shrugs'],
  Friday:['Mix Chest/Back/Shoulders'],
  Saturday:['Full Body Lifts + Cardio']
};
function renderGymPlan(){
  const ul=document.getElementById('gymPlanList');
  ul.innerHTML='';
  for(const day in gymPlan){
    const li=document.createElement('li');
    li.innerText=`${day}: ${gymPlan[day].join(', ')}`;
    ul.appendChild(li);
  }
}

// ======================= DASHBOARD & RINGS =======================
function getTodayIndex(){
  if(!programStartDate) return -1;
  const today=new Date();
  const idx=Math.floor((today-programStartDate)/(1000*60*60*24));
  if(idx>=programDays) return -1;
  return idx;
}
function updateDashboardRings(){
  const idx=getTodayIndex();
  if(idx===-1) return;
  document.getElementById('calRing').innerText=caloriesData[idx]||0;
  document.getElementById('waterRing').innerText=waterData[idx]||0;
  document.getElementById('stepRing').innerText=stepsData[idx]||0;
}

// ======================= CHARTS =======================
function createLineChart(ctx,label,data,goal=null,color='green'){
  const datasets=[{label,data,borderColor:color,fill:false}];
  if(goal) datasets.push({label:'Goal',data:Array(data.length).fill(goal),borderColor:'black',borderDash:[5,5],fill:false});
  return new Chart(ctx,{type:'line',data:{labels:data.map((_,i)=>`Day ${i+1}`),datasets},options:{responsive:true}});
}
function updateCharts(){
  if(programDays===0) return;
  const labels=Array.from({length:programDays},(_,i)=>`Day ${i+1}`);
  // Calories
  const calCtx=document.getElementById('caloriesChart').getContext('2d');
  if(!caloriesChart) caloriesChart=createLineChart(calCtx,'Calories',caloriesData,calorieGoal,'green');
  else { caloriesChart.data.datasets[0].data=caloriesData; caloriesChart.update(); }
  // Water
  const waterCtx=document.getElementById('waterChart').getContext('2d');
  if(!waterChart) waterChart=createLineChart(waterCtx,'Water',waterData,16,'blue');
  else { waterChart.data.datasets[0].data=waterData; waterChart.update(); }
  // Steps
  const stepsCtx=document.getElementById('stepsChart').getContext('2d');
  if(!stepsChart) stepsChart=createLineChart(stepsCtx,'Steps',stepsData,stepGoal,'orange');
  else { stepsChart.data.datasets[0].data=stepsData; stepsChart.update(); }
  // Weight
  const weightCtx=document.getElementById('weightChart').getContext('2d');
  if(!weightChart) weightChart=createLineChart(weightCtx,'Weight',weightData,null,'purple');
  else { weightChart.data.datasets[0].data=weightData; weightChart.update(); }
}

// ======================= NOTIFICATIONS =======================
function enableNotifications(){
  if("Notification" in window){
    Notification.requestPermission().then(p=>{
      if(p==='granted'){
        alert('Notifications Enabled');
        notifyUser('Notifications are now active!');
      }
    });
  } else alert("Notifications not supported.");
}
function notifyUser(msg){
  if("Notification" in window && Notification.permission==='granted'){
    new Notification(msg);
  }
}

// ======================= STREAKS =======================
function completeDay(){
  streakCount++;
  document.getElementById('streaks').innerText=`${streakCount} days completed`;
  notifyUser(`Day ${streakCount} completed!`);
}

// ======================= INITIALIZATION AFTER DOM LOAD =======================
document.addEventListener('DOMContentLoaded',()=>{
  renderGymPlan();
  updateCharts();
  setMotivation();
});
