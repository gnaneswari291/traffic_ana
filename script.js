const $ = (id) => document.getElementById(id);
let counts = {ped:125, cyclist:38, car:210};
let eventLog = [
  {type:"Pedestrian", time:"10:24:18", confidence:97, direction:"↑ Northbound"},
  {type:"Cyclist", time:"10:24:05", confidence:91, direction:"→ Eastbound"},
  {type:"Car", time:"10:23:52", confidence:96, direction:"↓ Southbound"},
  {type:"Pedestrian", time:"10:23:39", confidence:94, direction:"↑ Northbound"}
];
let toastTimer;
function showToast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2600)}
function updateMetrics(){
  const total=counts.ped+counts.cyclist+counts.car;
  $("pedCount").textContent=counts.ped.toLocaleString();$("cyclistCount").textContent=counts.cyclist.toLocaleString();$("carCount").textContent=counts.car.toLocaleString();$("totalCount").textContent=total.toLocaleString();$("donutTotal").textContent=total.toLocaleString();
  const p=(counts.ped/total*100),c=(counts.cyclist/total*100),v=(counts.car/total*100);
  $("pedPercent").textContent=`${p.toFixed(1)}% · ${counts.ped}`;$("cyclistPercent").textContent=`${c.toFixed(1)}% · ${counts.cyclist}`;$("carPercent").textContent=`${v.toFixed(1)}% · ${counts.car}`;
  $("donutChart").style.background=`conic-gradient(var(--green) 0 ${p}%,var(--purple) ${p}% ${p+c}%,var(--blue) ${p+c}% 100%)`;
}
function drawChart(){
 const canvas=$("trafficChart"), rect=canvas.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
 canvas.width=Math.max(1,rect.width*dpr);canvas.height=Math.max(1,rect.height*dpr);
 const ctx=canvas.getContext("2d");ctx.scale(dpr,dpr);
 const w=rect.width,h=rect.height,pad={l:30,r:8,t:10,b:18},cw=w-pad.l-pad.r,ch=h-pad.t-pad.b;
 ctx.clearRect(0,0,w,h);
 ctx.font="10px Inter, sans-serif";ctx.textAlign="right";ctx.textBaseline="middle";
 for(let n=0;n<=4;n++){let y=pad.t+ch*n/4;ctx.strokeStyle="#1a3552";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();ctx.fillStyle="#7891b1";ctx.fillText(String(250-n*50),pad.l-8,y)}
 const series=[
  {color:"#28d78b",data:[42,57,49,65,72,54,58,52,61,59,74,70,76,63,72,91,83,89,94,78,91,98,93,88,105,110]},
  {color:"#a36bff",data:[12,15,11,16,19,10,14,12,17,18,24,22,25,19,21,29,26,31,28,22,34,38,35,32,42,46]},
  {color:"#3898ff",data:[78,96,115,112,132,107,114,103,129,136,157,145,132,119,137,159,147,154,162,135,150,163,176,169,182,205]}
 ];
 series.forEach(s=>{ctx.beginPath();s.data.forEach((v,i)=>{const x=pad.l+i*cw/(s.data.length-1),y=pad.t+ch-(v/250)*ch;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=s.color;ctx.lineWidth=2.1;ctx.lineJoin="round";ctx.lineCap="round";ctx.stroke();s.data.forEach((v,i)=>{const x=pad.l+i*cw/(s.data.length-1),y=pad.t+ch-(v/250)*ch;ctx.beginPath();ctx.arc(x,y,2.2,0,Math.PI*2);ctx.fillStyle=s.color;ctx.fill()})});
}
function renderEvents(){
 const tbody=$("eventRows");tbody.innerHTML="";
 const cls={Pedestrian:"person-color",Cyclist:"cyclist-color",Car:"car-color"},icon={Pedestrian:"♟",Cyclist:"♧",Car:"▰"};
 eventLog.slice(0,6).forEach(e=>{const tr=document.createElement("tr");tr.innerHTML=`<td><span class="object-icon ${cls[e.type]}">${icon[e.type]}</span>${e.type}</td><td>${e.time}</td><td><span class="confidence">${e.confidence}%</span></td><td><span class="direction">${e.direction}</span></td>`;tbody.appendChild(tr)});
}
function clockTime(){return new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
function simulateCrossing(){
 const types=["Pedestrian","Cyclist","Car"],type=types[Math.floor(Math.random()*types.length)];
 const key=type==="Pedestrian"?"ped":type==="Cyclist"?"cyclist":"car";counts[key]++;
 const directions={"Pedestrian":["↑ Northbound","↓ Southbound"],"Cyclist":["→ Eastbound","← Westbound"],"Car":["↓ Southbound","↑ Northbound"]};
 eventLog.unshift({type,time:clockTime(),confidence:Math.floor(90+Math.random()*10),direction:directions[type][Math.floor(Math.random()*2)]});
 updateMetrics();renderEvents();$("lastUpdated").textContent="Updated "+clockTime();showToast(`New ${type.toLowerCase()} crossing detected (demo)`);drawChart();
}
$("simulateBtn").addEventListener("click",simulateCrossing);
$("refreshBtn").addEventListener("click",()=>{updateMetrics();drawChart();$("lastUpdated").textContent="Updated "+clockTime();showToast("Dashboard refreshed with current demo data")});
$("rangeSelect").addEventListener("change",e=>{showToast(`Showing ${e.target.options[e.target.selectedIndex].text.toLowerCase()} demo view`);drawChart()});
$("exportBtn").addEventListener("click",()=>{
 const rows=[["Object","Time","Confidence","Direction"],...eventLog.map(e=>[e.type,e.time,e.confidence+"%",e.direction])];
 const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="crosswatch-crossing-events.csv";a.click();URL.revokeObjectURL(url);showToast("Crossing events exported as CSV");
});
$("viewAllBtn").addEventListener("click",()=>showToast("Showing the latest crossing events in this demo"));
document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.remove("active"));btn.classList.add("active");
 const views={dashboard:null,live:"cameraPanel",analytics:"trendPanel",events:"eventsPanel",settings:"settingsPanel"};
 if(views[btn.dataset.view])$(views[btn.dataset.view]).scrollIntoView({behavior:"smooth",block:"center"});else window.scrollTo({top:0,behavior:"smooth"});
}));
window.addEventListener("resize",drawChart);
updateMetrics();renderEvents();drawChart();
