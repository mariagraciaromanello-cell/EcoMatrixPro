/* =========================================================
   MATRIZ AMBIENTAL — app local
   HTML + CSS + JavaScript vanilla
   ========================================================= */

const STORAGE_KEY = "matrizAmbientalProyecto_v1";

const BASE_FACTORS = [
  {id:"agua_disponibilidad", name:"Disponibilidad del recurso hídrico", group:"Agua", regional:true},
  {id:"agua_consumo", name:"Consumo de agua", group:"Agua", regional:true},
  {id:"agua_fuente", name:"Fuente de abastecimiento", group:"Agua", regional:true},
  {id:"agua_superficial", name:"Agua superficial", group:"Agua", regional:true},
  {id:"agua_subterranea", name:"Agua subterránea", group:"Agua", regional:true},
  {id:"agua_calidad", name:"Calidad del agua", group:"Agua", regional:true},
  {id:"agua_efluentes", name:"Generación de efluentes", group:"Agua", regional:true},
  {id:"agua_tratamiento", name:"Tratamiento de efluentes", group:"Agua", regional:true},
  {id:"agua_disposicion", name:"Disposición final de efluentes", group:"Agua", regional:true},
  {id:"agua_contaminacion", name:"Riesgo de contaminación hídrica", group:"Agua", regional:true},
  {id:"agua_competencia", name:"Competencia con otros usos del recurso", group:"Agua", regional:true},
  {id:"suelo_ocupacion", name:"Ocupación del suelo", group:"Suelo"},
  {id:"suelo_erosion", name:"Erosión", group:"Suelo"},
  {id:"suelo_salinizacion", name:"Salinización", group:"Suelo"},
  {id:"suelo_contaminacion", name:"Contaminación del suelo", group:"Suelo"},
  {id:"suelo_productivo", name:"Pérdida de suelo productivo", group:"Suelo"},
  {id:"aire_particulado", name:"Material particulado", group:"Aire"},
  {id:"aire_gases", name:"Emisiones gaseosas", group:"Aire"},
  {id:"aire_olores", name:"Olores", group:"Aire"},
  {id:"aire_ruido", name:"Ruido", group:"Aire"},
  {id:"flora", name:"Vegetación / flora", group:"Biodiversidad"},
  {id:"fauna", name:"Fauna", group:"Biodiversidad"},
  {id:"habitat", name:"Hábitat / fragmentación", group:"Biodiversidad"},
  {id:"paisaje", name:"Paisaje", group:"Paisaje"},
  {id:"poblacion", name:"Población", group:"Socioeconómico"},
  {id:"empleo", name:"Empleo y actividad económica", group:"Socioeconómico"},
  {id:"salud", name:"Salud y seguridad", group:"Socioeconómico"},
  {id:"infraestructura", name:"Infraestructura y servicios", group:"Socioeconómico"},
  {id:"productivas", name:"Actividades productivas", group:"Socioeconómico"}
];

const ACTIONS_BY_TYPE = {
  industrial:["Movimiento de suelo","Construcción de instalaciones","Uso de maquinaria","Transporte de insumos y productos","Consumo de agua","Consumo de energía","Generación de efluentes","Emisiones atmosféricas","Generación de residuos","Almacenamiento de sustancias","Operación de instalaciones"],
  agropecuario:["Preparación del terreno","Riego","Uso de fertilizantes","Uso de fitosanitarios","Cosecha","Transporte","Consumo de agua","Generación de residuos","Generación de efluentes"],
  minero:["Desmonte","Movimiento de suelo","Excavación","Extracción","Transporte","Uso de maquinaria","Consumo de agua","Generación de residuos","Generación de efluentes","Emisiones y polvo","Cierre y restauración"],
  urbanistico:["Desmonte","Movimiento de suelo","Excavación","Construcción","Tránsito y transporte","Consumo de agua","Generación de residuos","Generación de efluentes","Ocupación permanente del suelo"],
  infraestructura:["Desmonte","Movimiento de suelo","Excavación","Construcción","Transporte","Uso de maquinaria","Consumo de agua","Generación de residuos","Generación de efluentes","Operación y mantenimiento"],
  energetico:["Preparación del terreno","Construcción","Montaje de equipos","Transporte","Consumo de agua","Emisiones","Generación de residuos","Operación","Mantenimiento"],
  residuos:["Recepción de residuos","Transporte","Almacenamiento","Tratamiento","Generación de efluentes","Emisiones y olores","Generación de residuos secundarios","Disposición final"],
  agua:["Captación","Conducción","Tratamiento","Consumo de agua","Generación de efluentes","Descarga","Operación y mantenimiento","Generación de residuos"],
  otro:["Movimiento de suelo","Construcción","Transporte","Consumo de agua","Consumo de energía","Generación de efluentes","Emisiones atmosféricas","Generación de residuos","Operación","Cierre / restauración"]
};

let state = {
  project:{name:"",location:"",type:"industrial",stage:"construccion",profile:"larioja",description:""},
  factors:[],
  actions:[],
  impacts:{},
  selectedImpact:null
};

const $ = id => document.getElementById(id);
const uid = prefix => prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,7);

function defaultState(){
  const factors = BASE_FACTORS.map(f => ({...f, selected: true}));
  const actions = ACTIONS_BY_TYPE.industrial.map(name => ({id:uid("act"),name,selected:true,custom:false}));
  return {project:{...state.project},factors,actions,impacts:{},selectedImpact:null};
}

function showMessage(text, error=false){
  const el=$("mensaje"); el.textContent=text; el.classList.toggle("error",error); el.hidden=false;
  clearTimeout(showMessage.timer); showMessage.timer=setTimeout(()=>el.hidden=true,3200);
}

function saveState(silent=false){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); if(!silent) showMessage("Proyecto guardado en este dispositivo."); }
  catch(e){ showMessage("No se pudo guardar el proyecto localmente.",true); }
}

function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(raw){state={...defaultState(),...JSON.parse(raw)}; return;}
  }catch(e){}
  state=defaultState();
}

function bindProject(){
  const map={projectName:"name",projectLocation:"location",projectType:"type",projectStage:"stage",profile:"profile",projectDescription:"description"};
  Object.entries(map).forEach(([id,key])=>{
    $(id).value=state.project[key]||"";
    $(id).addEventListener("input",()=>{state.project[key]=$(id).value; if(id==="projectType") resetActionsForType();});
    $(id).addEventListener("change",()=>{state.project[key]=$(id).value; if(id==="profile") applyProfile(); if(id==="projectType") resetActionsForType();});
  });
}

function applyProfile(){
  if(state.project.profile==="larioja"){
    state.factors=BASE_FACTORS.map(f=>({...f,selected:true}));
  }else if(state.project.profile==="generico"){
    state.factors=BASE_FACTORS.filter(f=>!f.regional).map(f=>({...f,selected:true}));
  }else if(!state.factors.length){
    state.factors=BASE_FACTORS.map(f=>({...f,selected:true}));
  }
  renderFactors();
}

function resetActionsForType(){
  const names=ACTIONS_BY_TYPE[state.project.type]||ACTIONS_BY_TYPE.otro;
  state.actions=names.map(name=>({id:uid("act"),name,selected:true,custom:false}));
  renderActions();
}

function renderFactors(){
  const box=$("factorsList"); box.innerHTML="";
  const groups=[...new Set(state.factors.map(f=>f.group))];
  groups.forEach(group=>{
    const title=document.createElement("h3"); title.textContent=group; title.className="group-title";
    box.appendChild(title);
    state.factors.filter(f=>f.group===group).forEach(f=>{
      const row=document.createElement("div"); row.className="item";
      row.innerHTML=`<input type="checkbox" ${f.selected?"checked":""} aria-label="Incluir ${escapeHtml(f.name)}">
        <div class="item-main"><strong>${escapeHtml(f.name)}</strong><span class="item-meta">${f.regional?"Sugerido para el perfil La Rioja":"Factor ambiental"}</span></div>
        <div class="item-tools"><button class="small-btn edit-factor" type="button">Editar</button><button class="small-btn delete-factor" type="button">Eliminar</button></div>`;
      row.querySelector("input").addEventListener("change",e=>f.selected=e.target.checked);
      row.querySelector(".edit-factor").addEventListener("click",()=>openItemDialog("factor",f));
      row.querySelector(".delete-factor").addEventListener("click",()=>removeFactor(f.id));
      box.appendChild(row);
    });
  });
}

function renderActions(){
  const box=$("actionsList"); box.innerHTML="";
  state.actions.forEach(a=>{
    const row=document.createElement("div"); row.className="item";
    row.innerHTML=`<input type="checkbox" ${a.selected?"checked":""} aria-label="Incluir ${escapeHtml(a.name)}">
      <div class="item-main"><strong>${escapeHtml(a.name)}</strong><span class="item-meta">${a.custom?"Acción personalizada":"Acción sugerida"}</span></div>
      <div class="item-tools"><button class="small-btn edit-action" type="button">Editar</button><button class="small-btn delete-action" type="button">Eliminar</button></div>`;
    row.querySelector("input").addEventListener("change",e=>a.selected=e.target.checked);
    row.querySelector(".edit-action").addEventListener("click",()=>openItemDialog("action",a));
    row.querySelector(".delete-action").addEventListener("click",()=>removeAction(a.id));
    box.appendChild(row);
  });
}

function removeFactor(id){
  state.factors=state.factors.filter(f=>f.id!==id);
  Object.keys(state.impacts).filter(k=>k.includes("|"+id)).forEach(k=>delete state.impacts[k]);
  renderFactors(); showMessage("Factor eliminado.");
}
function removeAction(id){
  state.actions=state.actions.filter(a=>a.id!==id);
  Object.keys(state.impacts).filter(k=>k.startsWith(id+"|")).forEach(k=>delete state.impacts[k]);
  renderActions(); showMessage("Acción eliminada.");
}

function openItemDialog(type,item=null){
  const dialog=$("itemDialog"); dialog.dataset.type=type; dialog.dataset.id=item?.id||"";
  $("dialogTitle").textContent=(item?"Editar ":"Agregar ")+(type==="factor"?"factor ambiental":"acción");
  $("itemName").value=item?.name||"";
  $("itemGroupLabel").hidden=type!=="factor";
  if(type==="factor"){
    $("itemGroup").innerHTML=["Agua","Suelo","Aire","Biodiversidad","Paisaje","Socioeconómico","Otro"].map(g=>`<option>${g}</option>`).join("");
    $("itemGroup").value=item?.group||"Otro";
  }
  dialog.showModal();
  setTimeout(()=>$("itemName").focus(),50);
}

function confirmItem(e){
  e.preventDefault();
  const dialog=$("itemDialog"),type=dialog.dataset.type,id=dialog.dataset.id,name=$("itemName").value.trim();
  if(!name)return;
  if(type==="factor"){
    if(id){const f=state.factors.find(x=>x.id===id); if(f){f.name=name;f.group=$("itemGroup").value;}}
    else state.factors.push({id:uid("fac"),name,group:$("itemGroup").value,selected:true,custom:true});
    renderFactors();
  }else{
    if(id){const a=state.actions.find(x=>x.id===id); if(a)a.name=name;}
    else state.actions.push({id:uid("act"),name,selected:true,custom:true});
    renderActions();
  }
  dialog.close(); showMessage("Elemento actualizado.");
}

function activeFactors(){return state.factors.filter(f=>f.selected)}
function activeActions(){return state.actions.filter(a=>a.selected)}

function renderMatrix(){
  const factors=activeFactors(), actions=activeActions();
  const thead=$("matrixTable").querySelector("thead"),tbody=$("matrixTable").querySelector("tbody");
  thead.innerHTML="";tbody.innerHTML="";
  const tr=document.createElement("tr"); tr.innerHTML="<th>Acción / factor</th>"+factors.map(f=>`<th>${escapeHtml(f.name)}</th>`).join(""); thead.appendChild(tr);
  actions.forEach(a=>{
    const row=document.createElement("tr"); const first=document.createElement("td");first.textContent=a.name;row.appendChild(first);
    factors.forEach(f=>{
      const td=document.createElement("td"),btn=document.createElement("button");btn.type="button";btn.className="matrix-cell";
      const key=a.id+"|"+f.id, impact=state.impacts[key];
      if(impact){btn.classList.add("has-impact",impact.nature);btn.textContent=impact.nature==="negativo"?"−":"+";btn.title=`${impact.nature} · ${impact.score}`;}
      else{btn.textContent="+";btn.title="Agregar interacción";}
      btn.addEventListener("click",()=>openImpact(a,f));td.appendChild(btn);row.appendChild(td);
    });
    tbody.appendChild(row);
  });
}

function openImpact(action,factor){
  const key=action.id+"|"+factor.id;
  state.selectedImpact=key;
  const impact=state.impacts[key]||{nature:"negativo",intensity:1,extent:1,duration:1,reversibility:1,probability:1,notes:""};
  $("editorTitle").textContent=`${action.name} → ${factor.name}`;
  ["nature","intensity","extent","duration","reversibility","probability","notes"].forEach(k=>$(k==="nature"?"impactNature":"impact"+capitalize(k)).value=impact[k]);
  $("impactEditor").hidden=false; updateScorePreview();
  $("impactEditor").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1)}

function getEditorImpact(){
  return {
    nature:$("impactNature").value,
    intensity:Number($("impactIntensity").value),
    extent:Number($("impactExtent").value),
    duration:Number($("impactDuration").value),
    reversibility:Number($("impactReversibility").value),
    probability:Number($("impactProbability").value),
    notes:$("impactNotes").value.trim()
  };
}
function scoreImpact(i){return i.intensity*i.extent*i.duration*i.reversibility*i.probability}
function levelScore(score){
  if(score>=1875)return "Muy alto";
  if(score>=625)return "Alto";
  if(score>=125)return "Moderado";
  return "Bajo";
}
function updateScorePreview(){
  const score=scoreImpact(getEditorImpact()); $("impactScore").textContent=score; $("impactLevel").textContent=levelScore(score);
}
function saveImpact(){
  if(!state.selectedImpact)return;
  state.impacts[state.selectedImpact]=getEditorImpact();
  $("impactEditor").hidden=true; state.selectedImpact=null; renderMatrix(); showMessage("Interacción guardada.");
}
function removeImpact(){
  if(state.selectedImpact){delete state.impacts[state.selectedImpact];$("impactEditor").hidden=true;state.selectedImpact=null;renderMatrix();showMessage("Interacción eliminada.");}
}

function renderSummary(){
  const impacts=Object.entries(state.impacts).map(([key,v])=>({key,...v}));
  const neg=impacts.filter(i=>i.nature==="negativo"),pos=impacts.filter(i=>i.nature==="positivo");
  const high=impacts.filter(i=>levelScore(scoreImpact(i))==="Muy alto"||levelScore(scoreImpact(i))==="Alto");
  const moderate=impacts.filter(i=>levelScore(scoreImpact(i))==="Moderado");
  const low=impacts.filter(i=>levelScore(scoreImpact(i))==="Bajo");
  const factorCounts={};
  impacts.forEach(i=>{const f=i.key.split("|")[1];factorCounts[f]=(factorCounts[f]||0)+1});
  const factorRows=Object.entries(factorCounts).map(([id,n])=>({name:state.factors.find(f=>f.id===id)?.name||"Factor eliminado",n})).sort((a,b)=>b.n-a.n).slice(0,8);
  const max=Math.max(1,...factorRows.map(x=>x.n));
  $("summary").innerHTML=`
    <div class="summary-grid">
      <div class="stat"><strong>${impacts.length}</strong><span>Interacciones evaluadas</span></div>
      <div class="stat"><strong>${neg.length}</strong><span>Impactos negativos</span></div>
      <div class="stat"><strong>${pos.length}</strong><span>Impactos positivos</span></div>
      <div class="stat"><strong>${high.length}</strong><span>Alta / muy alta significancia</span></div>
    </div>
    <div class="summary-columns">
      <div class="summary-box">
        <h3>Distribución preliminar</h3>
        <div class="bar-row"><span>Alta / muy alta</span><div class="bar"><i style="width:${impacts.length?high.length/impacts.length*100:0}%"></i></div><b>${high.length}</b></div>
        <div class="bar-row"><span>Moderada</span><div class="bar"><i style="width:${impacts.length?moderate.length/impacts.length*100:0}%"></i></div><b>${moderate.length}</b></div>
        <div class="bar-row"><span>Baja</span><div class="bar"><i style="width:${impacts.length?low.length/impacts.length*100:0}%"></i></div><b>${low.length}</b></div>
      </div>
      <div class="summary-box">
        <h3>Factores con mayor número de interacciones</h3>
        ${factorRows.length?factorRows.map(x=>`<div class="bar-row"><span>${escapeHtml(x.name)}</span><div class="bar"><i style="width:${x.n/max*100}%"></i></div><b>${x.n}</b></div>`).join(""):"<p class='muted'>Todavía no hay interacciones evaluadas.</p>"}
      </div>
    </div>
    <div class="summary-box" style="margin-top:18px">
      <h3>Proyecto</h3>
      <p><strong>${escapeHtml(state.project.name||"Sin nombre")}</strong> · ${escapeHtml(labelType(state.project.type))} · ${escapeHtml(labelStage(state.project.stage))}</p>
      <p class="muted">${escapeHtml(state.project.location||"Sin ubicación")} · Perfil: ${escapeHtml(labelProfile(state.project.profile))}</p>
    </div>`;
}

function labelType(v){return ({industrial:"Industrial",agropecuario:"Agropecuario / agroindustrial",minero:"Minero",urbanistico:"Urbanístico / inmobiliario",infraestructura:"Infraestructura",energetico:"Energético",residuos:"Gestión de residuos",agua:"Agua / saneamiento",otro:"Otro"})[v]||v}
function labelStage(v){return ({construccion:"Construcción",operacion:"Funcionamiento / operación",ampliacion:"Ampliación / modificación",cierre:"Cierre / abandono"})[v]||v}
function labelProfile(v){return ({larioja:"La Rioja",generico:"Genérico",personalizado:"Personalizado"})[v]||v}

function exportCSV(){
  const rows=[["Proyecto",state.project.name],["Ubicación",state.project.location],["Tipo",labelType(state.project.type)],["Etapa",labelStage(state.project.stage)],["Perfil",labelProfile(state.project.profile)],[],["Acción","Factor","Naturaleza","Intensidad","Extensión","Duración","Reversibilidad","Probabilidad","Valor preliminar","Nivel","Observaciones"]];
  Object.entries(state.impacts).forEach(([key,i])=>{
    const [aid,fid]=key.split("|"),a=state.actions.find(x=>x.id===aid),f=state.factors.find(x=>x.id===fid);
    if(a&&f)rows.push([a.name,f.name,i.nature,i.intensity,i.extent,i.duration,i.reversibility,i.probability,scoreImpact(i),levelScore(scoreImpact(i)),i.notes]);
  });
  const csv=rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(";")).join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(slug(state.project.name)||"matriz-ambiental")+".csv";a.click();URL.revokeObjectURL(a.href);
}
function slug(s){return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}

function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

function goStep(n){
  if(n===4)renderMatrix();
  if(n===5)renderSummary();
  document.querySelectorAll(".step-panel").forEach(p=>p.classList.remove("active"));
  document.querySelectorAll(".step").forEach(b=>b.classList.toggle("active",Number(b.dataset.step)===n));
  $("step"+n).classList.add("active"); window.scrollTo({top:0,behavior:"smooth"});
}

function newProject(){
  if(confirm("¿Crear un proyecto nuevo? Se reemplazará el proyecto actual en pantalla.")){
    state=defaultState(); bindValuesOnly(); renderFactors(); renderActions(); renderMatrix(); saveState(true); goStep(1); showMessage("Proyecto nuevo creado.");
  }
}
function bindValuesOnly(){
  const map={projectName:"name",projectLocation:"location",projectType:"type",projectStage:"stage",profile:"profile",projectDescription:"description"};
  Object.entries(map).forEach(([id,key])=>$(id).value=state.project[key]||"");
}

document.addEventListener("DOMContentLoaded",()=>{
  loadState(); bindProject(); renderFactors(); renderActions();

  document.querySelectorAll(".step").forEach(b=>b.addEventListener("click",()=>goStep(Number(b.dataset.step))));
  document.querySelectorAll(".next-step").forEach(b=>b.addEventListener("click",()=>goStep(Number(b.dataset.next))));
  document.querySelectorAll(".prev-step").forEach(b=>b.addEventListener("click",()=>goStep(Number(b.dataset.prev))));
  $("btnGuardar").addEventListener("click",()=>saveState(false));
  $("btnNuevo").addEventListener("click",newProject);
  $("btnAddFactor").addEventListener("click",()=>openItemDialog("factor"));
  $("btnAddAction").addEventListener("click",()=>openItemDialog("action"));
  $("itemForm").addEventListener("submit",confirmItem);
  $("btnCloseEditor").addEventListener("click",()=>{$("impactEditor").hidden=true;state.selectedImpact=null});
  $("btnSaveImpact").addEventListener("click",saveImpact);
  $("btnRemoveImpact").addEventListener("click",removeImpact);
  ["impactNature","impactIntensity","impactExtent","impactDuration","impactReversibility","impactProbability","impactNotes"].forEach(id=>$(id).addEventListener("input",updateScorePreview));
  $("btnExportCSV").addEventListener("click",exportCSV);
  $("btnPrint").addEventListener("click",()=>{renderSummary();window.print()});
});
