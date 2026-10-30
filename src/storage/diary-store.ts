import {openDB,type DBSchema,type IDBPTransaction} from 'idb';
import {entrySchema,hauntingSchema,type Entry,type Haunting} from '../domain/diary';
import {validateEntries} from '../domain/backup';
import {applyHaunting} from '../domain/haunting';
interface DiaryDB extends DBSchema{entries:{key:string;value:Entry};meta:{key:string;value:number}}
const db=()=>openDB<DiaryDB>('ghost-diary',2,{upgrade(db){if(!db.objectStoreNames.contains('entries'))db.createObjectStore('entries',{keyPath:'id'});if(!db.objectStoreNames.contains('meta'))db.createObjectStore('meta')},blocking(_old,_next,event){(event.target as IDBDatabase).close()}});
type WriteTransaction=IDBPTransaction<DiaryDB,['entries','meta'],'readwrite'>;
async function write<T>(action:(tx:WriteTransaction)=>Promise<T>):Promise<T>{
  const database=await db(),tx=database.transaction(['entries','meta'],'readwrite');
  const done=tx.done;void done.catch(()=>{});
  try{const result=await action(tx);await done;return result}
  catch(error){try{tx.abort()}catch{}await done.catch(()=>{});throw error}
}
export async function listEntries():Promise<Entry[]>{return (await (await db()).getAll('entries')).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))}
export async function saveEntry(input:Entry,create=false):Promise<Entry>{
  const entry=entrySchema.parse(input);
  return write(async tx=>{
  const entries=tx.objectStore('entries'),meta=tx.objectStore('meta'),current=await entries.get(entry.id);
  if((create&&current)||(!create&&!current)||(current&&current.revision!==entry.revision))throw new Error('This entry changed or was removed in another tab. Reopen it before saving.');
  const revision=Math.max((await meta.get('revision'))||Date.now(),entry.revision)+1;
  const saved={...entry,revision,updatedAt:new Date().toISOString()};
  if(current&&current.original!==saved.original)delete saved.haunting;
  await entries.put(saved);await meta.put(revision,'revision');return saved;
  });
}
export async function deleteEntry(id:string):Promise<void>{await write(async tx=>{await tx.objectStore('entries').delete(id)})}
export async function applyIfCurrent(id:string,revision:number,input:Haunting):Promise<boolean>{
  const haunting=hauntingSchema.parse(input);
  return write(async tx=>{
  const entries=tx.objectStore('entries'),meta=tx.objectStore('meta'),current=await entries.get(id);
  if(!current||current.revision!==revision)return false;
  if(applyHaunting(current.original,haunting.edits)!==haunting.text)throw new Error('Invalid ghost intervention.');
  const next=Math.max((await meta.get('revision'))||Date.now(),current.revision)+1;
  await entries.put({...current,haunting,revision:next});await meta.put(next,'revision');return true;
  });
}
export async function importEntries(input:Entry[]):Promise<void>{
  const entries=validateEntries(input);
  await write(async tx=>{
  const store=tx.objectStore('entries'),meta=tx.objectStore('meta');
  const existing:Entry[]=await store.getAll();
  let revision=Math.max((await meta.get('revision'))||Date.now(),...existing.map(e=>e.revision),...entries.map(e=>e.revision))+1;
  await store.clear();for(const entry of entries)await store.put({...entry,revision:++revision});await meta.put(revision,'revision');
  });
}
