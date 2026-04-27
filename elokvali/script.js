function parseTime(t){
 let [m,s]=t.split(":");
 return m*60+parseFloat(s);
}

function fmt(s){
 let m=Math.floor(s/60);
 let sec=(s%60).toFixed(3).padStart(6,'0');
 return `${m}:${sec}`;
}

function loadData(file,btn){
 document.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
 btn.classList.add("active");

 fetch(file+"?v="+Date.now())
 .then(r=>r.text())
 .then(t=>{
  let data=t.trim().split("\n").map(r=>{
   let [n,a,b,c]=r.split(",");
   a=parseTime(a);b=parseTime(b);c=parseTime(c);
   return {n,a,b,c,total:a+b+c};
  });

  data.sort((x,y)=>x.total-y.total);

  /* renderTop3(data); */
  renderTable(data);
 });
}

function renderTop3(d){
 let c=document.getElementById("top3");
 c.innerHTML="";
 ["gold","silver","bronze"].forEach((cls,i)=>{
  if(!d[i]) return;
  let el=document.createElement("div");
  el.className="card "+cls;
  el.innerHTML=`<h2>#${i+1}</h2>
  <div class="name">${d[i].n}</div>
  <div class="time">${fmt(d[i].total)}</div>`;
  c.appendChild(el);
 });
}

function renderTable(d){
 let t=document.getElementById("tbody");
 t.innerHTML="";
 let best=d[0]?.total||0;

 d.forEach((x,i)=>{
  let tr=document.createElement("tr");
  tr.className="row";
  let delta=i?`<div class="delta">(+${(x.total-best).toFixed(3)}s)</div>`:"";
  tr.innerHTML=`
  <td class="rank-${i+1}">${i+1}</td>
  <td class="name"><img src="https://flagcdn.com/w20/hu.png" style="vertical-align:middle;margin-right:6px;">${x.n}</td>  <td class="time">${fmt(x.a)}</td>
  <td class="time">${fmt(x.b)}</td>
  <td class="time">${fmt(x.c)}</td>
  <td class="total">${fmt(x.total)}${delta}</td>`;
  t.appendChild(tr);
 });
}

function goBack(){
  window.location.href = "../";
}

window.onload=()=>{
 loadData('f1challenge.csv',document.getElementById("defaultBtn"));
};
