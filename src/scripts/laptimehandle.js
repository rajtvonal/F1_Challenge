/* =========================
   Köridőt alakít int-re
   1:23.531 => 83.531
========================= */
   function parseTime(t){
 let [m,s]=t.split(":");
 return m*60+parseFloat(s);
}


/* =========================
   int-et alakít köridőre
   83.531 => 1:23.531
========================= */
function fmt(s){
 let m=Math.floor(s/60);
 let sec=(s%60).toFixed(3).padStart(6,'0');
 return `${m}:${sec}`;
}
