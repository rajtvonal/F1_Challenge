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

    renderTable(data);
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
    <td class="rank-${i+1} top-${i+1}">${i+1}</td>
    <td class="name top-${i+1}"><img src="https://flagcdn.com/w20/hu.png" style="vertical-align:middle;margin-right:6px;">${x.n}</td>
    <td class="time top-${i+1}">${fmt(x.a)}</td>
    <td class="time top-${i+1}">${fmt(x.b)}</td>
    <td class="time top-${i+1}">${fmt(x.c)}</td>
    <td class="total top-${i+1}">${fmt(x.total)}${delta}</td>`;
    t.appendChild(tr);
  });
}

window.onload=()=>{
  loadData('../database/F1/elokvali.csv',document.getElementById("defaultBtn"));
};
