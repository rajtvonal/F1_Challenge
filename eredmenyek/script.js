let pointsMap = {};
let currentData = [];

function goBack(){ window.location.href = "../"; }

const toggleBtn = document.querySelector(".theme-toggle");

// BETÖLTÉS
(function initTheme(){
  const saved = localStorage.getItem("theme");

  if(saved === "light"){
    document.body.classList.add("light");
    toggleBtn.textContent = "☀️";
  } else {
    toggleBtn.textContent = "🌙";
  }
})();

// TOGGLE
function toggleTheme(){
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");

  if(isLight){
    localStorage.setItem("theme", "light");
    toggleBtn.textContent = "☀️";
  } else {
    localStorage.setItem("theme", "dark");
    toggleBtn.textContent = "🌙";
  }
}


function setActive(btn){
 document.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
 btn.classList.add("active");
}

function hideRaceButtons(){
 document.getElementById("raceButtons").style.display="none";
}

function updateHeader(cols){
 let tr=document.querySelector("thead tr");
 tr.innerHTML = cols.map(c=>`<th>${c}</th>`).join("");
}

function loadPoints(){
 return fetch("pontrendszer.csv")
  .then(r=>r.text())
  .then(t=>{
    t.trim().split("\n").forEach(line=>{
      let [pos, pts] = line.split(",");
      pointsMap[pos.trim()] = parseInt(pts);
    });
  });
}

function loadResults(btn){
 setActive(btn);

 fetch("F1Challenge_results.csv")
 .then(r=>r.text())
 .then(t=>{
   let data = t.trim().split("\n").map(r=>{
     let cols = r.split(",");
     let name = cols[0];
     let team = cols[1];
     let results = cols.slice(2,14);

     let total = 0;

     results.forEach(res=>{
       if(res === "" || res === undefined) return;
       total += pointsMap[res?.trim()] ?? 0;
     });

     return {name, team, results, total};
   });

   data.sort((a,b)=>b.total-a.total);

   data = calculateGains(data);

   currentData = data;
   // renderTable(data,"main");
   animateTable(()=>renderTable(data,"main"));
   hideRaceButtons();
   updateHeader(["#","Név","Csapat","R1","R2","R3","R4","R5","R6","R7","R8","R9","R10","R11","R12","Pont","Gain"]);
 });
}

function renderTable(data, mode="main"){
 let tbody = document.getElementById("tbody");
 tbody.innerHTML="";

 data.forEach((d,i)=>{
   let tr = document.createElement("tr");
   /* tr.className="row"; */
   let rankClass = i<3 ? `rank-${i+1}` : "";

   if (mode === "main"){
    let races = "";
    for(let j=0;j<12;j++){
      races += `<td>${d.results[j] || "-"}</td>`;
    }

    tr.innerHTML = `
    <td class="${rankClass}">${i+1}</td>
    <td class="name"><img src="https://flagcdn.com/w20/hu.png" style="vertical-align:middle;margin-right:6px;">${d.name}</td>
    <td>${d.team}</td>
    ${races}
    <td>${d.total}</td>
    <td style="color:${d.gain>0?'#4ade80':d.gain<0?'#ef4444':'#888'}">
     ${d.gain>0?`+${d.gain}`:d.gain}
    </td>
    `;
  }

  if(mode === "individual"){
     tr.innerHTML = `
     <td class="${rankClass}">${i+1}</td>
     <td class="name"><img src="https://flagcdn.com/w20/hu.png" style="margin-right:6px;">${d.name}</td>
     <td>${d.team}</td>
     <td>${d.total}</td>
     <td>0</td>`;
   }

    tbody.appendChild(tr);
 });
}

function calculateGains(data){
 // utolsó nem üres futam index
 let lastRace = -1;

 for(let i=11;i>=0;i--){
   if(data.some(d=>d.results[i])) {
     lastRace = i;
     break;
   }
 }

 if(lastRace === -1) return data.map(d=>({...d, gain:0}));

 // ranglista az utolsó futam alapján
 let prev = [...data].map(d=>{
   let pos = d.results[lastRace];
   return {
     name:d.name,
     pos: pos ? parseInt(pos) : 999
   };
 });

 prev.sort((a,b)=>a.pos-b.pos);

 let prevRank = {};
 prev.forEach((p,i)=> prevRank[p.name]=i+1);

 // jelenlegi rang
 let current = [...data].sort((a,b)=>b.total-a.total);
 let currentRank = {};
 current.forEach((p,i)=> currentRank[p.name]=i+1);

 // gain számítás
 return data.map(d=>{
   let oldR = prevRank[d.name] || currentRank[d.name];
   let newR = currentRank[d.name];
   return {
     ...d,
     gain: oldR - newR
   };
 });
}

function showIndividual(btn){
 setActive(btn);
 hideRaceButtons();

 let sorted = [...currentData].sort((a,b)=>b.total-a.total);
 //renderTable(sorted,"individual");
 animateTable(()=>renderTable(sorted,"individual"));

 updateHeader(["#","Név","Csapat","Pont","Gain"]);
}

function showTeams(btn){
 setActive(btn);

 hideRaceButtons();

 let teams = {};

 currentData.forEach(d=>{
   if(!teams[d.team]){
     teams[d.team] = {players:[], total:0};
   }
   teams[d.team].players.push(d.name);
   teams[d.team].total += d.total;
 });

 let arr = Object.entries(teams).map(([team,data])=>({
   team,
   players:data.players,
   total:data.total
 }));

 arr.sort((a,b)=>b.total-a.total);

 let tbody = document.getElementById("tbody");
 tbody.innerHTML="";

 arr.forEach((t,i)=>{
   let tr=document.createElement("tr");

   tr.innerHTML=`
   <td>${i+1}</td>
   <td>${t.team}</td>
   <td style="text-align:left">${t.players.join("<br>")}</td>
   <td>${t.total}</td>
   `;

   tbody.appendChild(tr);
 });

 updateHeader(["#","Csapat","Pilóták","Pont"]);
}

function showRaces(btn){
 setActive(btn);
 showRaceButtons();
}

function showRaceButtons(){
 let div=document.getElementById("raceButtons");
 div.style.display="block";
 div.innerHTML="";

 for(let i=0;i<12;i++){
   let b=document.createElement("button");
   b.innerText="R"+(i+1);

   b.onclick=()=>{
     let data=[...currentData].map(d=>{
       return {
         name:d.name,
         team:d.team,
         pos:d.results[i]
       };
     });

     data.sort((a,b)=>{
       if(!a.pos) return 1;
       if(!b.pos) return -1;
       return a.pos-b.pos;
     });

     let tbody=document.getElementById("tbody");
     tbody.innerHTML="";

     data.forEach((d,i)=>{
       let tr=document.createElement("tr");
       tr.innerHTML=`
       <td>${i+1}</td>
       <td class="name">${d.name}</td>
       <td>${d.team}</td>
       <td>${d.pos || "-"}</td>
       `;
       tbody.appendChild(tr);
     });

     updateHeader(["#","Név","Csapat","Pozíció"]);
   };

   div.appendChild(b);
 }
}

function animateTable(callback){
 let tbody = document.getElementById("tbody");

 tbody.classList.remove("fade-in");
 tbody.classList.add("fade-out");

 setTimeout(()=>{
   callback();
   tbody.classList.remove("fade-out");
   tbody.classList.add("fade-in");
 },200);
}

window.onload = async ()=>{
 await loadPoints();
 loadResults(document.getElementById("defaultBtn"));
};
