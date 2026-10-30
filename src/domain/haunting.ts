import { z } from 'zod';
import { editSchema, type Edit } from './diary';
export function applyHaunting(original:string, input:Edit[]):string {
  if(!original.trim()||original.length>12000)throw new Error('Invalid original text.');
  const edits=z.array(editSchema).min(1).max(2).parse(input);
  const ranges=edits.map(edit=>{
    const start=original.indexOf(edit.target);
    if(start<0||original.indexOf(edit.target,start+1)>=0)throw new Error('The ghost selected a missing or ambiguous sentence. Try again.');
    return {start,end:start+edit.target.length,edit};
  }).sort((a,b)=>a.start-b.start);
  for(let i=1;i<ranges.length;i++)if(ranges[i].start<ranges[i-1].end)throw new Error('The ghost selected overlapping sentences. Try again.');
  let text=original;
  for(const {start,end,edit} of ranges.reverse()){
    text=edit.kind==='replace'?text.slice(0,start)+edit.text+text.slice(end):text.slice(0,end)+' '+edit.text+text.slice(end);
  }
  if(text===original)throw new Error('The ghost left no trace. Try again.');
  return text;
}
