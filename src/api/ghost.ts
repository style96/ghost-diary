import type {Entry,Haunting,ModelStatus} from '../domain/diary';
export async function getStatus():Promise<ModelStatus>{return (await fetch('/api/status',{signal:AbortSignal.timeout(5000)})).json()}
export async function haunt(entry:Entry,history:Entry[],signal:AbortSignal):Promise<Haunting>{
  const response=await fetch('/api/haunt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({entry:{id:entry.id,revision:entry.revision,original:entry.original},history:history.filter(e=>e.id!==entry.id).slice(0,3).map(e=>e.original)}),signal});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'The ghost could not reach this page.');return data.haunting;
}
