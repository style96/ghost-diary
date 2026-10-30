import {z} from 'zod';
import {entrySchema,type Entry} from './diary';
import {applyHaunting} from './haunting';
export function validateEntries(input:unknown):Entry[]{
  const entries=z.array(entrySchema).max(1000).parse(input);
  if(new Set(entries.map(e=>e.id)).size!==entries.length)throw new Error('Duplicate entry IDs.');
  for(const entry of entries)if(entry.haunting&&applyHaunting(entry.original,entry.haunting.edits)!==entry.haunting.text)throw new Error('Invalid saved intervention.');
  return entries;
}
export function parseBackup(text:string):Entry[]{
  if(text.length>20_000_000)throw new Error('Backup exceeds 20 MB.');
  const data=z.object({version:z.literal(1),entries:z.unknown()}).strict().parse(JSON.parse(text));
  return validateEntries(data.entries);
}
export function serializeBackup(entries:Entry[]):string{return JSON.stringify({version:1,entries:validateEntries(entries)},null,2)}
