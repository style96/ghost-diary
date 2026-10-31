import type {Entry} from '../domain/diary';
import recorded from './recorded.json';
import voices from './voices.json';

export type RecordedVoice={src:string;label:string;provider?:string;text?:string};

// Generated offline by record:voices. No hosted service is called by the
// notebook, and personal diary text never enters this path.
export function getRecordedVoice(entry:Entry):RecordedVoice|undefined{
  const sample=recorded.find(sample=>sample.id===entry.id);
  const voice=voices.find(voice=>voice.id===entry.id);
  if(!sample||!entry.haunting||sample.original!==entry.original||
    sample.haunting.text!==entry.haunting.text||
    JSON.stringify(sample.haunting.edits)!==JSON.stringify(entry.haunting.edits)||
    !voice||voice.text!==entry.haunting.edits.map(edit=>edit.text).join(' '))return;
  const provider=(voice as {provider?:string}).provider;
  return {src:voice.src,label:provider==='elevenlabs'?'A recorded ElevenLabs ghost voice':'A recorded ghost voice',provider};
}
