import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const $=id=>document.getElementById(id), langs=['pt-BR','en','es'];
const blank=()=>({objname:{},objsystem:[],objdescription:{},linkedModels:[],resources:[],parts:{}});
let data=blank(), filename='4.json', tab='general', selected=null, meshes=[], root=null,mixer=null,action=null, preview=false, dirty=false, generation=0;
const lang=()=>$('lang').value, own=(o,k)=>Object.hasOwn(o,k), base=k=>k.split('+').filter(s=>!['nisolar','ninteract'].includes(s)), local=v=>typeof v==='string'?{'pt-BR':v}:Object.assign({},v||{}), text=v=>typeof v==='string'?v:v?.[lang()]||v?.['pt-BR']||'';
function status(s){$('status').textContent=s} function change(){dirty=true;document.title='* BioExplora Studio'}
function normalize(d){if(!d||typeof d!=='object'||Array.isArray(d))throw Error('JSON inválido');const out={...blank(),...d};out.parts={...(d.parts||{})};for(const [k,v] of Object.entries(d)){if(!own(blank(),k)&&v&&typeof v==='object'&&own(v,'objname')&&own(v,'description')){out.parts[k]=v;delete out[k]}}out.linkedModels=Array.isArray(d.linkedModels)?d.linkedModels:d.linkedModel?[d.linkedModel]:[];out.resources=Array.isArray(d.resources)?d.resources:[];return out}
const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(42,1,.01,10000), renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping; $('viewport').append(renderer.domElement); const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;camera.position.set(0,0,5);const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();scene.environment=pmrem.fromScene(room).texture;room.dispose();pmrem.dispose();scene.add(new THREE.HemisphereLight(0xffffff,0x667788,2));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(4,8,5);scene.add(light);
new ResizeObserver(()=>{const v=$('viewport');if(!v.clientWidth||!v.clientHeight)return;renderer.setSize(v.clientWidth,v.clientHeight);camera.aspect=v.clientWidth/v.clientHeight;camera.updateProjectionMatrix()}).observe($('viewport'));
const clock=new THREE.Clock();renderer.setAnimationLoop(()=>{mixer?.update(Math.min(clock.getDelta(),.05));renderer.render(scene,camera)});
function fit(){if(!root)return;const b=new THREE.Box3().setFromObject(root),c=b.getCenter(new THREE.Vector3()),s=b.getSize(new THREE.Vector3()).length()||1;controls.target.copy(c);camera.position.copy(c).add(new THREE.Vector3(0,0,s*1.35));camera.near=s/10000;camera.far=s*100;camera.updateProjectionMatrix();controls.update()}
function disposeModel(){if(!root)return;mixer?.stopAllAction();mixer?.uncacheRoot(root);scene.remove(root);const seen=new Set();root.traverse(o=>{if(!o.isMesh)return;for(const r of [o.geometry,...(Array.isArray(o.material)?o.material:[o.material])]){if(r&&!seen.has(r)){seen.add(r);if(r.isMaterial)for(const v of Object.values(r))if(v?.isTexture&&!seen.has(v)){seen.add(v);v.dispose()}r.dispose()}}});root=null;meshes=[];mixer=action=null}
const loader=new GLTFLoader();async function openModel(source){const token=++generation;status('Carregando GLB…');const gltf=typeof source==='string'?await loader.loadAsync(source):await loader.parseAsync(await source.arrayBuffer(),'');if(token!==generation)return;disposeModel();root=gltf.scene;scene.add(root);root.traverse(o=>{if(o.isMesh){o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();meshes.push(o)}});if(gltf.animations.length){mixer=new THREE.AnimationMixer(root);action=mixer.clipAction(gltf.animations[0]);action.play()}$('empty').hidden=true;fit();refresh();status(`${meshes.length} meshes carregadas`)}
function keyFor(name){return Object.keys(data.parts).find(k=>base(k).includes(name))||name}function names(){return [...new Set([...Object.keys(data.parts),...meshes.map(m=>keyFor(m.name))])]}function matched(k){return meshes.filter(m=>base(k||'').includes(m.name))}function highlight(){for(const m of meshes){for(const mat of Array.isArray(m.material)?m.material:[m.material]){if(!mat.emissive)continue;if(!mat.userData.originalEmissive)mat.userData.originalEmissive=mat.emissive.clone();mat.emissive.copy(mat.userData.originalEmissive);if(m.visible&&matched(selected).includes(m))mat.emissive.setHex(0x168899)}}}
function list(){const q=$('search').value.toLowerCase();$('list').replaceChildren();const keys=names();$('count').textContent=keys.length;for(const k of keys){if(preview&&(k.includes('+ninteract')||!own(data.parts,k)))continue;const label=text(data.parts[k]?.objname)||k;if(!`${label} ${k}`.toLowerCase().includes(q))continue;const b=document.createElement('button');b.classList.toggle('active',k===selected);b.textContent=label;const sub=document.createElement('small');sub.textContent=`${k}${root&&!matched(k).length?' · sem mesh':''}${!own(data.parts,k)?' · sem cadastro':''}`;b.append(sub);b.onclick=()=>select(k);$('list').append(b)}}
function select(k){selected=k;tab='part';refresh()}function refresh(){list();highlight();form()}
let down;renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const r=renderer.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(meshes.filter(m=>m.visible),false).find(h=>!preview||own(data.parts,keyFor(h.object.name))&&!keyFor(h.object.name).includes('+ninteract'));if(hit)select(keyFor(hit.object.name))});
function field(parent,label,value,cb,multi=false){const l=document.createElement('label');l.textContent=label;const el=document.createElement(multi?'textarea':'input');el.value=value??'';el.readOnly=preview;el.oninput=()=>{cb(el.value);change()};parent.append(l,el);return el}function translated(parent,label,obj,k,multi=false){field(parent,`${label} · ${lang()}`,local(obj[k])[lang()]||'',v=>{obj[k]={...local(obj[k]),[lang()]:v};list()},multi)}function button(parent,label,fn){const b=document.createElement('button');b.textContent=label;b.disabled=preview;b.onclick=fn;parent.append(b);return b}function check(parent,label,checked,fn){const l=document.createElement('label');l.className='check';const c=document.createElement('input');c.type='checkbox';c.checked=checked;c.disabled=preview;c.onchange=()=>fn(c.checked);l.append(c,document.createTextNode(label));parent.append(l)}
function form(){const p=$('form');p.replaceChildren();document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));if(tab==='general'){translated(p,'Nome do objeto',data,'objname');field(p,'Sistemas (separados por vírgula)',Array.isArray(data.objsystem)?data.objsystem.join(', '):data.objsystem,v=>data.objsystem=v.split(',').map(x=>x.trim()).filter(Boolean));translated(p,'Descrição geral',data,'objdescription',true)}else if(tab==='part'){if(!selected){p.textContent='Selecione uma estrutura na lista ou no modelo.';return}const id=document.createElement('code');id.textContent=selected;p.append(id);if(!own(data.parts,selected)){button(p,'Cadastrar estrutura',()=>{data.parts[selected]={objname:{},description:{}};change();refresh()});return}const part=data.parts[selected];translated(p,'Nome',part,'objname');translated(p,'Descrição',part,'description',true);const flag=(tag,on)=>{const tags=['nisolar','ninteract'].filter(t=>t===tag?!on:selected.includes('+'+t));const next=base(selected).join('+')+tags.map(t=>'+'+t).join('');if(next!==selected&&own(data.parts,next)){alert('Já existe uma chave com essas opções.');refresh();return}delete data.parts[selected];data.parts[next]=part;selected=next;change();refresh()};check(p,'Permitir interação',!selected.includes('+ninteract'),v=>flag('ninteract',v));check(p,'Permitir isolamento',!selected.includes('+nisolar'),v=>flag('nisolar',v));button(p,'Remover cadastro',()=>{if(confirm('Remover os metadados desta peça?')){delete data.parts[selected];change();refresh()}})}else if(tab==='code'){const a=document.createElement('textarea');a.readOnly=true;a.style.height='65vh';a.value=JSON.stringify(data,null,2);p.append(a)}else{const links=tab==='links',arr=links?data.linkedModels:data.resources;arr.forEach((item,i)=>{const box=document.createElement('fieldset');p.append(box);if(links){field(box,'ID',item.id,v=>item.id=v);translated(box,'Rótulo',item,'label')}else{field(box,'Tipo (image, video, doc, link, audio)',item.type,v=>item.type=v);field(box,'URL',item.url,v=>item.url=v);translated(box,'Nome',item,'name');translated(box,'Informação',item,'info')}button(box,'Remover',()=>{arr.splice(i,1);change();form()})});button(p,'Adicionar',()=>{arr.push(links?{id:'',label:{}}:{type:'image',url:'',name:{},info:{}});change();form()})}}
function confirmDiscard(){return !dirty||confirm('Descartar alterações não salvas?')}function setData(d,name){data=normalize(d);filename=name;dirty=false;document.title='BioExplora Studio';selected=null;refresh()}
// Acesso local autorizado pelo Chrome. Nenhuma pasta é escrita sem permissão.
let folderHandle = null, jsonHandle = null, busy = false, revision = 0;
const oldChange = change;
change = function(){revision++; oldChange();};
const folderButton = document.createElement('button');
folderButton.textContent = 'Pasta models';
$('load').before(folderButton);
const exportButton = document.createElement('button');
exportButton.textContent = 'Exportar JSON';
$('save').after(exportButton);
function exportJSON(){
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=filename;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);status('Cópia JSON exportada.');
}
exportButton.onclick=exportJSON;
folderButton.onclick=async()=>{
  if(busy || !confirmDiscard())return;
  try {
    if(!window.showDirectoryPicker)throw Error('Acesso a pastas indisponível neste contexto.');
    const folder=await window.showDirectoryPicker({mode:'readwrite'});
    folderHandle=folder;jsonHandle=null;data=blank();dirty=false;selected=null;disposeModel();$('empty').hidden=false;refresh();
    document.title='BioExplora Studio';folderButton.textContent=folder.name;status('Pasta autorizada. Abra um ID.');
  }catch(e){if(e.name!=='AbortError')status(e.message)}
};
$('load').onclick=async()=>{
  if(busy||!confirmDiscard())return;const id=$('id').value;
  if(!/^\d+$/.test(id))return status('Informe um ID numérico.');
  busy=true;jsonHandle=null;
  try{
    let next=blank(), handle=null;
    if(folderHandle){
      try{handle=await folderHandle.getFileHandle(`${id}.json`);next=JSON.parse(await (await handle.getFile()).text());}
      catch(e){if(e.name!=='NotFoundError')throw e;handle=null;}
    }else{
      const r=await fetch(`models/${id}.json`);
      if(r.ok)next=await r.json();else if(r.status!==404)throw Error('Não foi possível ler JSON: '+r.status);
    }
    const source=folderHandle?await (await folderHandle.getFileHandle(`${id}.glb`)).getFile():`models/${id}.glb`;
    await openModel(source);setData(next,`${id}.json`);jsonHandle=handle;
    status(handle||!folderHandle?'Objeto carregado.':'Objeto carregado; novo JSON.');
  }catch(e){status('Falha ao abrir: '+e.message)}finally{busy=false;}
};
$('glb').onclick=()=>{if(!busy)$('glbFile').click()};
$('glbFile').onchange=async e=>{const f=e.target.files[0];if(f&&!busy&&confirmDiscard()){busy=true;try{await openModel(f);jsonHandle=null;setData(blank(),f.name.replace(/\.glb$/i,'.json'));folderHandle=null;folderButton.textContent='Pasta models';}catch(err){status(err.message)}finally{busy=false}}e.target.value=''};
$('json').onclick=async()=>{
 if(busy||!confirmDiscard())return;
 if(!window.showOpenFilePicker){$('jsonFile').click();return;}
 busy=true;try{const [h]=await window.showOpenFilePicker({types:[{description:'JSON',accept:{'application/json':['.json']}}]});const f=await h.getFile();setData(JSON.parse(await f.text()),f.name);jsonHandle=h;status('JSON aberto; salvamento direto disponível.');}catch(e){if(e.name!=='AbortError')status(e.message)}finally{busy=false;}
};
$('jsonFile').onchange=async e=>{const f=e.target.files[0];if(f&&!busy&&confirmDiscard())try{setData(JSON.parse(await f.text()),f.name);jsonHandle=null;folderHandle=null;folderButton.textContent='Pasta models';status('JSON carregado; use Salvar para escolher destino.')}catch(err){status(err.message)}e.target.value=''};
async function saveLocal(){
 if(busy)return;busy=true;const snapshot=JSON.stringify(data,null,2), rev=revision;
 try{
   let h=jsonHandle;
   if(!h&&folderHandle){
     try{h=await folderHandle.getFileHandle(filename);if(!confirm(`Substituir ${filename} na pasta ${folderHandle.name}?`))return;}
     catch(e){if(e.name!=='NotFoundError')throw e;h=await folderHandle.getFileHandle(filename,{create:true});}
   }
   if(!h){if(!window.showSaveFilePicker)throw Error('Salvamento direto indisponível. Use Exportar JSON.');h=await window.showSaveFilePicker({suggestedName:filename,types:[{description:'JSON',accept:{'application/json':['.json']}}]});}
   const w=await h.createWritable();try{await w.write(snapshot);await w.close();}catch(e){try{await w.abort()}catch{}throw e;}
   jsonHandle=h;filename=h.name;if(revision===rev){dirty=false;document.title='BioExplora Studio';}status(`${filename} salvo diretamente no disco.`);
 }catch(e){if(e.name!=='AbortError')status('Erro ao salvar: '+e.message);}finally{busy=false;}
}
$('save').onclick=saveLocal;
window.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();if(!e.repeat)saveLocal();}});
$('search').oninput=list;$('lang').onchange=refresh;document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;form()});$('reset').onclick=fit;$('show').onclick=()=>{meshes.forEach(m=>m.visible=true);highlight()};$('hide').onclick=()=>{matched(selected).forEach(m=>m.visible=false);highlight()};$('isolate').onclick=()=>{if(!selected||preview&&selected.includes('+nisolar')||!matched(selected).length)return;meshes.forEach(m=>m.visible=matched(selected).includes(m));highlight()};$('play').onclick=()=>{if(action)action.paused=!action.paused};$('preview').onclick=()=>{preview=!preview;if(preview&&(!own(data.parts,selected)||selected?.includes('+ninteract')))selected=null;$('preview').classList.toggle('active',preview);refresh()};window.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat&&!e.target.closest?.('input,textarea,select,button')&&action){e.preventDefault();action.paused=!action.paused}});window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});refresh();status('Pronto para abrir um modelo.');if(new URLSearchParams(location.search).has('id')){$('id').value=new URLSearchParams(location.search).get('id');$('load').click()}
