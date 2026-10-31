import type {Entry} from '../domain/diary';
import type {RecordedVoice} from '../demo/voices';

export function getLocalVoice(entry:Entry):RecordedVoice|undefined{
  if(!entry.haunting)return;
  return {src:'',label:'A locally generated ghost voice',provider:'windows',text:entry.haunting.edits.map(edit=>edit.text).join(' ')};
}

export async function requestLocalVoice(text:string,signal:AbortSignal,transport:typeof fetch=fetch):Promise<Blob>{
  const response=await transport('/api/voice',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({text}),signal:AbortSignal.any([signal,AbortSignal.timeout(65000)])});
  if(!response.ok||!response.headers.get('Content-Type')?.startsWith('audio/wav'))throw new Error('Local voice could not be prepared.');
  return response.blob();
}
