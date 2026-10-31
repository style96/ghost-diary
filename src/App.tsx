import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,ArrowRight,Plus,Feather,Moon,Sun,Check,Download,Upload,Trash2,GitCompareArrows,RotateCcw,BookOpen,ShieldCheck,Monitor,ChevronRight,VolumeX} from 'lucide-react';
import type {Entry,ModelStatus} from './domain/diary';
import {validateEntries,parseBackup,serializeBackup} from './domain/backup';
import * as store from './storage/diary-store';
import {getStatus,haunt} from './api/ghost';
import {HauntedText,HauntingCompare} from './components/HauntingCompare';
import {GhostVoice} from './components/GhostVoice';
import {getRecordedVoice} from './demo/voices';
import recordedData from './demo/recorded.json';
const recorded=__RECORDED__;
const samples=validateEntries(recordedData);
const date=(value:string)=>new Date(value).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
function Ghost({small=false}:{small?:boolean}){return <svg className={small?'ghost small':'ghost'} viewBox="0 0 60 72" fill="none" aria-hidden="true"><path d="M10 60V28a20 20 0 0140 0v32l-10-6-10 6-10-6-10 6z" fill="currentColor"/><ellipse cx="23" cy="28" rx="2.7" ry="4.4" fill="#292c26"/><ellipse cx="37" cy="28" rx="2.7" ry="4.4" fill="#292c26"/><path d="M27 40q3 3 6 0" stroke="#292c26" strokeWidth="2" strokeLinecap="round"/></svg>}
export default function App(){
  const [entries,setEntries]=useState<Entry[]>(recorded?samples:[]),[selected,setSelected]=useState<string|null>(recorded?samples[0]?.id:null);
  const [title,setTitle]=useState(''),[text,setText]=useState(''),[editing,setEditing]=useState(!recorded),[revealed,setRevealed]=useState<Set<string>>(new Set());
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[compare,setCompare]=useState(false),[about,setAbout]=useState(false);
  const [inkEntry,setInkEntry]=useState<string|null>(null);
  const [status,setStatus]=useState<ModelStatus>({available:false,model:'Gemma',message:'Checking connection…'});
  const upload=useRef<HTMLInputElement>(null),controller=useRef<AbortController|null>(null);
  const current=entries.find(e=>e.id===selected);
  const shown=current&&(!recorded||revealed.has(current.id))?current:current?{...current,haunting:undefined}:undefined;
  const voice=recorded&&shown?getRecordedVoice(shown):undefined;
  const dirty=editing&&(text!==(current?.original||'')||title!==(current?.title||''));
  const refresh=async()=>{const all=await store.listEntries();setEntries(all);return all};
  const checkConnection=async()=>{try{setStatus(await getStatus())}catch{setStatus({available:false,model:'Gemma',message:'Start the local server and Ollama.'})}};
  useEffect(()=>{if(!recorded){refresh().catch(()=>setError('Browser storage is unavailable. Enable storage to keep your diary.'));checkConnection()}return()=>controller.current?.abort()},[]);
  useEffect(()=>{const handler=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',handler);return()=>window.removeEventListener('beforeunload',handler)},[dirty]);
  useEffect(()=>{const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setCompare(false);setAbout(false)}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[]);
  useEffect(()=>{
    if(inkEntry===null)return;
    if(about||editing){setInkEntry(null);return}
    const timer=window.setTimeout(()=>setInkEntry(null),1300);
    return()=>window.clearTimeout(timer);
  },[inkEntry,about,editing]);
  function select(entry?:Entry){
    if(dirty&&!window.confirm('Leave this page without saving your changes?'))return;
    controller.current?.abort();setBusy(false);setInkEntry(null);setSelected(entry?.id||null);setTitle(entry?.title||'');setText(entry?.original||'');setEditing(!entry&&!recorded);setError('');setNotice('');setCompare(false);
  }
  async function save(){try{if(!text.trim()){setError('Leave a few words on the page first.');return;}
    const now=new Date().toISOString();const saved=await store.saveEntry({...current,id:current?.id||crypto.randomUUID(),title:title.trim()||'An untitled day',original:text,revision:current?.revision||1,createdAt:current?.createdAt||now,updatedAt:now},!current);
    await refresh();setSelected(saved.id);setTitle(saved.title);setEditing(false);setError('');setNotice('Your words are safe on this device.');
  }catch(e){setError(e instanceof Error?e.message:'The page could not be saved.')}}
  async function passNight(){if(!current||busy)return;setBusy(true);setError('');setNotice('');
    const active=new AbortController();controller.current=active;
    try{
      if(recorded){await new Promise<void>((resolve,reject)=>{const id=setTimeout(resolve,1600);active.signal.addEventListener('abort',()=>{clearTimeout(id);reject(new DOMException('Aborted','AbortError'))},{once:true})});setRevealed(old=>new Set(old).add(current.id));}
      else{const result=await haunt(current,entries,active.signal);if(!await store.applyIfCurrent(current.id,current.revision,result))throw new Error('This page changed while the ghost was writing. Reopen it and try again.');await refresh();}
      setInkEntry(current.id);setNotice('Something is different. Read closely.');
    }catch(e){if(!active.signal.aborted)setError(e instanceof Error?e.message:'The ghost could not reach this page.')}finally{if(controller.current===active)setBusy(false)}
  }
  async function restore(){if(!current)return;try{if(recorded)setRevealed(old=>{const next=new Set(old);next.delete(current.id);return next});else{await store.saveEntry({...current,haunting:undefined});await refresh()}setInkEntry(null);setNotice('Only your words remain.')}catch(e){setError(String(e))}}
  async function remove(){if(!current||!window.confirm('Delete this diary page permanently?'))return;try{await store.deleteEntry(current.id);await refresh();select()}catch{setError('The page could not be deleted.')}}
  async function exportDiary(){try{const url=URL.createObjectURL(new Blob([serializeBackup(entries)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='ghost-diary-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch{setError('The backup could not be created.')}}
  async function importDiary(file?:File){if(!file)return;try{if(file.size>20_000_000)throw new Error('Backup exceeds 20 MB.');const data=parseBackup(await file.text());if(!window.confirm(`Replace your diary with ${data.length} imported pages? Export your current diary first if you want to keep it.`))return;await store.importEntries(data);const all=await refresh();select(all[0]);setNotice('Your diary has been imported.')}catch{setError('This backup could not be imported. Your existing diary is unchanged.')}finally{if(upload.current)upload.current.value=''}}
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#" onClick={e=>{e.preventDefault();setAbout(false)}}><Ghost small/><span>Ghost Diary<span className="brand-sub">A NOTEBOOK WITH A PRESENCE</span></span></a>
      <div className="sidebar-divider"/>
      <div className="sidebar-section"><span className="eyebrow">{recorded?'A STRANGER’S DIARY':'YOUR PRIVATE DIARY'}</span><span className="count">{entries.length.toString().padStart(2,'0')}</span></div>
      {!recorded&&<button className="new-entry" onClick={()=>select()}><Plus size={17}/>A new page <span>↗</span></button>}
      <nav className="entry-list" aria-label="Diary pages">{entries.map((entry,i)=><button className={`entry-item ${selected===entry.id?'active':''}`} key={entry.id} onClick={()=>{select(entry);setAbout(false)}}>
        <span className="entry-index">{(i+1).toString().padStart(2,'0')}</span><span className="entry-item-copy"><span>{entry.title}</span><small>{new Date(entry.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short'})} <span className="entry-dot">·</span> {entry.haunting&&(!recorded||revealed.has(entry.id))?'A presence was here':'Quiet, for now'}</small></span><ChevronRight size={14}/>
      </button>)}{!entries.length&&<p className="empty-list">An empty notebook.<br/>For now, only you are here.</p>}</nav>
      <div className="sidebar-bottom"><div className="presence-art"><div className="orbit"/><Ghost/><span className="star one">✦</span><span className="star two">✧</span></div><p>Some things are better<br/>left unwritten.</p><div className="local-label"><span className="status-dot"/>{recorded?'RECORDED MODEL EXAMPLES':'STORED ON THIS DEVICE'}</div>{!recorded&&<div className="backup-actions"><button onClick={exportDiary}><Download size={13}/>Export</button><button onClick={()=>upload.current?.click()}><Upload size={13}/>Import</button><input ref={upload} type="file" accept="application/json,.json" hidden onChange={e=>importDiary(e.target.files?.[0])}/></div>}</div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="top-tabs"><button className={!about?'selected':''} onClick={()=>setAbout(false)}><BookOpen size={14}/>The diary</button><button className={about?'selected':''} onClick={()=>setAbout(true)}>How it haunts <ArrowUpRight size={13}/></button></div><span className="challenge-tag">GHOST IN THE MACHINE <span>’26</span></span></header>
      <main>
        <div className="intro-line"><span className="eyebrow">A PRIVATE DIARY. AN UNINVITED AUTHOR.</span><span className="sound-note"><VolumeX size={13}/>Best read in the quiet</span></div>
        <div className="headline-row"><h1>Your words.<br/><em>Until they’re not.</em></h1><div className="intro-aside"><span className="tiny-star">✳</span><p>Write about your day.<br/>Leave it for the night.<br/>See what stays yours.</p></div></div>
        {recorded&&!about&&<div className="demo-banner"><span className="demo-badge">RECORDED DEMO</span><span>Real Gemma outputs. Fictional diaries. No live inference on this site.</span><button onClick={()=>setAbout(true)}>Run it locally <ArrowUpRight size={13}/></button></div>}
        {about?<section className="about-page"><span className="eyebrow">THE SPIRIT OF THE MACHINE</span><h2>A ghost you can<br/><em>look inside.</em></h2><p className="about-lead">The unsettling part is the story.<br/>The reassuring part is who controls it.</p><div className="about-grid"><article><Monitor size={21}/><h3>The ghost lives locally.</h3><p>Ollama runs Gemma on your own computer. In local mode, your diary stays in your browser and inference happens on your device.</p></article><article><Feather size={21}/><h3>AI leaves the trace.</h3><p>The model reads a page and up to three recent entries, then suggests a short intervention. Exact sentence targets keep the rest of your writing intact.</p></article><article><ShieldCheck size={21}/><h3>Your original survives.</h3><p>Compare the ghost’s version with your own. Restore it whenever you like. Export your notebook and keep a copy that belongs to you.</p></article></div><div className="setup-box"><div><span className="eyebrow">INVITE YOUR OWN GHOST</span><h3>Open weights. Open code.<br/>A closed door to your diary.</h3></div><div><code>ollama pull gemma3:4b<br/>npm install<br/>npm run build<br/>npm start</code><p>Node 24+ and Ollama. Download the model first. No hosted AI API key.</p>{import.meta.env.VITE_REPO_URL?<a href={import.meta.env.VITE_REPO_URL} target="_blank" rel="noreferrer">Source & full setup <ArrowUpRight size={14}/></a>:<p className="setup-pending">Source repository link will appear here when published.</p>}</div></div><p className="about-fine">{recorded?'This website shows recorded generations, not a live model.':'This local app generates with Ollama on your device.'} Local browser storage is not encrypted; export a backup before clearing browser data. Gemma is open-weight under its own terms. No per-request hosted API fee in local mode.</p><button className="text-link" onClick={()=>setAbout(false)}>Back to the diary <ArrowRight size={15}/></button></section>:<>
        <section className={`notebook ${busy?'being-haunted':''}`} aria-label="Diary entry">
          <div className="notebook-spine"/>
          <div className="paper-top"><span className="eyebrow">{current?date(current.createdAt):date(new Date().toISOString())}</span><div className="page-state">{busy?<><span className="status-dot red-dot pulse"/>A presence is writing</>:shown?.haunting?<><span className="status-dot red-dot"/>THIS PAGE HAS CHANGED</>:<><span className="status-dot"/>{editing?'A MOMENT TO YOURSELF':'ALL IS QUIET'}</>}</div></div>
          <div className="paper-content">
            <div className="entry-heading">{editing?<input aria-label="Entry title" placeholder="Give today a name…" value={title} maxLength={120} onChange={e=>setTitle(e.target.value)}/>:<h2>{current?.title||'A page of your own'}</h2>}<Feather className="heading-feather" size={25} strokeWidth={1}/></div>
            <div className="entry-body">{editing?<textarea aria-label="Diary text" placeholder={'Dear diary,\n\nSomething ordinary happened today…'} value={text} maxLength={12000} onChange={e=>setText(e.target.value)}/>:shown?<p><HauntedText key={`${shown.id}:${shown.haunting?.generatedAt||'quiet'}`} entry={shown} animate={inkEntry===shown.id}/></p>:<p className="empty-paper">Every haunting starts with a few words.</p>}</div>
            {voice&&<GhostVoice key={shown!.id} voice={voice}/>}
            {!editing&&shown?.haunting&&<div className="ghost-note"><span>✧</span><p>You’re not the only one<br/>keeping a diary.</p></div>}
            <div className="paper-bottom"><span>{editing?`${text.length.toLocaleString()} / 12,000 characters`:'— End of entry —'}</span><span className="page-number">{current?String(entries.findIndex(e=>e.id===current.id)+1).padStart(2,'0'):'01'}</span></div>
          </div>
          <div className="notebook-toolbar"><div className="toolbar-left">{shown?.haunting?<button className="compare-button" onClick={()=>setCompare(true)}><GitCompareArrows size={15}/>See what changed</button>:<span><ShieldCheck size={14}/>{recorded?'A fictional page. A real AI trace.':'Your original is always preserved.'}</span>}</div><div className="toolbar-actions">{editing?<><button className="subtle-button" disabled={!current} onClick={()=>{setText(current?.original||'');setTitle(current?.title||'');setEditing(false)}}>Cancel</button><button className="dark-button" onClick={save}><Check size={15}/>Save page</button></>:<>{!recorded&&<button className="subtle-button edit-button" onClick={()=>{setTitle(current?.title||'');setText(current?.original||'');setEditing(true)}} disabled={!current||busy}><Feather size={14}/>Edit</button>}{shown?.haunting?<button className="dark-button" onClick={restore}><RotateCcw size={14}/>Restore my words</button>:<button className="dark-button night-button" onClick={passNight} disabled={!current||busy}>{busy?<span className="spinner"/>:<Moon size={16}/>} {busy?'Wait for the morning…':'Pass the night'}{!busy&&<ArrowRight size={15}/>}</button>}</>}</div></div>
        </section>
        <div className="under-notebook"><div className="whisper">{busy?'The house is quiet. The page is not.':shown?.haunting?'A familiar page. An unfamiliar handwriting.':'Close the day. Let the night have a word.'}</div>{!recorded&&current&&!editing&&<button className="delete-button" onClick={remove}><Trash2 size={13}/>Delete page</button>}</div>
        <div role="status" aria-live="polite" className={`feedback ${error?'error':''}`}>{error||notice}</div>
        <div className="how-strip"><span className="eyebrow">A SMALL RITUAL</span><div><span>01</span>Leave your words</div><ArrowRight size={14}/><div><span>02</span>Let the night pass</div><ArrowRight size={14}/><div><span>03</span>Look a little closer</div></div>
        </>}
      </main>
      <footer><span><Ghost small/>Built with open-weight AI. Haunted by Gemma.</span>{recorded?<span className="footer-right">HACKTOBERFEST 2026 <span>✧</span> OPEN SOURCE, OTHERWORLDLY</span>:<button className={`connection ${status.available?'connected':''}`} onClick={checkConnection} title={status.message}><span className="status-dot"/>{status.model} · {status.available?'local & connected':'check connection'}</button>}</footer>
    </div>
    {compare&&shown&&<HauntingCompare entry={shown} onClose={()=>setCompare(false)}/>}
  </div>;
}

