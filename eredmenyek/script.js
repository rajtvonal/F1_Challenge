let pointsMap = {};
let currentData = [];

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
  return fetch("../database/pontrendszer.csv")
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
  hideRaceButtons();

  fetch("../database/F1Challenge_results.csv")
  .then(r=>r.text())
  .then(t=>{
    let data = t.trim().split("\n").map(r=>{
      let cols = r.split(",");
      let name = cols[0];
      let team = cols[1];
      let results = cols.slice(2,14);
      let points = results.map(res=>{
        if(res === "" || res === undefined) return "";
        return pointsMap[res.trim()] ?? 0;
      });
      let total = 0;
      points.forEach(p=>{
        if(p === "") return;
        total += p;
      });

      return {name, team, results, points, total};
    });

    data.sort((a,b)=>b.total-a.total);

    data = calculateGains(data);

    currentData = data;
    renderTable(data,"main");
    //animateTable(()=>renderTable(data,"main"));
    updateHeader(["#","Név","Csapat","R1","R2","R3","R4","R5","R6","R7","R8","R9","R10","R11","R12","Pont","Gain"]);
  });
}

function renderTable(data, mode="main"){
  let tbody = document.getElementById("tbody");
  tbody.innerHTML="";

  data.forEach((d,i)=>{
    let tr = document.createElement("tr");
    tr.className="row";
    let rankClass = i<3 ? `rank-${i+1}` : "";

    if (mode === "main"){
      let races = "";
      for(let j=0;j<12;j++){
        races += `<td class="races race-${i+1} top-${i+1}">${d.results[j] || "-"}</td>`;
      }

      tr.innerHTML = `
      <td class="rank-${i+1} top-${i+1}">${i+1}</td>
      <td class="name top-${i+1}"><img src="https://flagcdn.com/w20/hu.png" style="vertical-align:middle;margin-right:6px;">${d.name}</td>
      <td class="team top-${i+1}">${d.team}</td>
      ${races}
      <td class="total top-${i+1}">${d.total}</td>
      <td class="gain top-${i+1}" style="color:${d.gain>0?'#4ade80':d.gain<0?'#ef4444':'#888'}">${d.gain>0?`+${d.gain}`:d.gain}</td>
      `;
    }

    if(mode === "individual"){
      tr.innerHTML = `
      <td class="rank-${i+1} top-${i+1}">${i+1}</td>
      <td class="name top-${i+1}"><img src="https://flagcdn.com/w20/hu.png" style="margin-right:6px;">${d.name}</td>
      <td class="team top-${i+1}">${d.team}</td>
      <td class="total top-${i+1}">${d.total}</td>
      <td class="gain top-${i+1}" style="color:${d.gain>0?'#4ade80':d.gain<0?'#ef4444':'#888'}">${d.gain>0?`+${d.gain}`:d.gain}</td>
      `;
    }

    tbody.appendChild(tr);
  });
}

function calculateGains(data){
  let lastRace = -1;  // utolsó nem üres futam index

  for(let i = 11; i >= 0; i--){
    if(data.some(d=>d.results[i])) {
      lastRace = i;
      break;
    }
  }

  if(lastRace === -1){
    return data.map(d=>({...d, gain:0}));
  }

  // =========================
  // ELŐZŐ PONTOK (lastRace-1-ig)
  // =========================
  let prev = data.map(d => {
    let prevTotal = 0;

    for(let i = 0; i < lastRace; i++){
      let p = d.points[i];
      if(p !== "" && p !== undefined){
        prevTotal += p;
      }
    }
    return {
      name: d.name,
      total: prevTotal
    };
  });

  // rangsor előző állapot
  prev.sort((a,b) => b.total - a.total);
  let prevRank = {};
  prev.forEach((p,i) => prevRank[p.name] = i+1);

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
  renderTable(sorted,"individual");
  //animateTable(()=>renderTable(sorted,"individual"));

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
    tr.className="row";

    tr.innerHTML=`
    <td class="rank-${i+1} top-${i+1}">${i+1}</td>
    <td class="team top-${i+1}">${t.team}</td>
    <td class="drivers top-${i+1}" style="text-align:left">${t.players.join("<br>")}</td>
    <td class="total top-${i+1}">${t.total}</td>
    `;

    tbody.appendChild(tr);
 });

 updateHeader(["#","Csapat","Pilóták","Pont"]);
}

function showRaces(btn){
  setActive(btn);
  showRaceButtons();
}

async function showRaceButtons() {
  let div = document.getElementById("raceButtons");
  div.style.display = "block";
  div.innerHTML = "";

  let buttons = [];

  for (let i = 1; i <= 12; i++) {
     try {
      let res = await fetch(`../database/R${i}.csv`, { method: "HEAD" });
      if (!res.ok) continue; // nincs ilyen fájl
    
      let b = document.createElement("button");
      b.innerText = "R" + i;

      b.onclick = () => {
        buttons.forEach(btn => btn.classList.remove("active"));
        b.classList.add("active");

        let file = `../database/R${i}.csv?v=${Date.now()}`;
        fetch(file)
        .then(r => r.text())
        .then(text => {
          let data = text.trim().split("\n").map(line => {
            let [pos, name, total, best, pits] = line.split(",");
            return {
              pos: parseInt(pos),
              name: name,
              time: parseTime(total),
              best: best,
              pits: parseInt(pits)
            };
          });
          data.sort((a,b) => a.pos - b.pos);

          // leader racetime
          let leaderTime = data[0]?.time || 0;

          let tbody = document.getElementById("tbody");
          tbody.innerHTML = "";

          data.forEach((d, i) => {
            let tr = document.createElement("tr");
            tr.className="row";

            let timeDisplay;
            if (i === 0){
              timeDisplay = fmt(d.time); // első
            } else {
              let diff = d.time - leaderTime;
              let laptime = parseTime(d.best);
              if (diff > laptime) {
                let laps = (diff / laptime).toFixed(0);
                timeDisplay = `+ ${laps} Kör`;
              } else {
                timeDisplay = `+ ${diff.toFixed(3)}`
              }
            }

            tr.innerHTML = `
            <td class="rank-${i+1} top-${i+1}">${d.pos || "-"}</td>
            <td class="name top-${i+1}">
            <img src="https://flagcdn.com/w20/hu.png" style="vertical-align:middle;margin-right:6px;">${d.name}</td>
            <td class="time top-${i+1}">${timeDisplay}</td>
            <td class="time top-${i+1}">${d.best}</td>
            <td class="time top-${i+1}">${d.pits}</td>
            `;
            tbody.appendChild(tr);
          });

          updateHeader(["#", "Név", "Idő", "Leggyorsabb Kör", "Box"]);
        });
      };    

      buttons.push(b);
      div.appendChild(b);
    } catch(exception) {
      // ha fetch error - ignore
    }
  }

  // DEFAULT R1
  if (buttons.length > 0) {
    buttons[0].click();
  }
}



/*
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
*/

window.onload = async ()=>{
  await loadPoints();
  loadResults(document.getElementById("defaultBtn"));
};
