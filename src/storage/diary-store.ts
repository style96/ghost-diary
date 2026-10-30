import {openDB} from 'idb';
import {entrySchema,hauntingSchema,type Entry,type Haunting} from '../domain/diary';
import {validateEntries} from '../domain/backup';
import {applyHaunting} from '../domain/haunting';
const db=()=>openDB('ghost-diary',1,{upgrade(db){db.createObjectStore('entries',{keyPath:'id'})}});
export async function listEntries():Promise<Entry[]>{return (await (await db()).getAll('entries')).sort((a:Entry,b:Entry)=>b.createdAt.localeCompare(a.createdAt))}
export async function saveEntry(input:Entry):Promise<Entry>{
  const entry=entrySchema.parse(input),database=await db(),tx=database.transaction('entries','readwrite');
  const current:Entry|undefined=await tx.store.get(entry.id);
  if(current&&current.revision!==entry.revision){await tx.done;throw new Error('This entry changed in another tab. Reopen it before saving.');}
  const saved={...entry,revision:current?current.revision+1:1,updatedAt:new Date().toISOString()};
  if(current&&current.original!==saved.original)delete saved.haunting;
  await tx.store.put(saved);await tx.done;return saved;
}
export async function deleteEntry(id:string){await (await db()).delete('entries',id)}
export async function applyIfCurrent(id:string,revision:number,input:Haunting):Promise<boolean>{
  const haunting=hauntingSchema.parse(input),database=await db(),tx=database.transaction('entries','readwrite');
  const current:Entry|undefined=await tx.store.get(id);
  if(!current||current.revision!==revision){await tx.done;return false;}
  if(applyHaunting(current.original,haunting.edits)!==haunting.text){await tx.done;throw new Error('Invalid ghost intervention.');}
  await tx.store.put({...current,haunting,revision:current.revision+1});await tx.done;return true;
}
export async function importEntries(input:Entry[]):Promise<void>{
  const entries=validateEntries(input),database=await db(),tx=database.transaction('entries','readwrite');
  await tx.store.clear();for(const entry of entries)await tx.store.put(entry);await tx.done;
}
