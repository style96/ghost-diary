import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {generateHaunting,buildMessages,model} from '../server/ollama';
import {entrySchema,type Entry,type Haunting} from '../src/domain/diary';
import {applyHaunting} from '../src/domain/haunting';
import {stories} from './demo-stories';

export type Candidate={id:string;attempt:number;entry:Entry;messages:ReturnType<typeof buildMessages>;model:string;elapsedMs:number;rawResponse?:string;haunting?:Haunting;error?:string};

export async function recordCandidates(attempts:number,transport:typeof fetch=fetch,onCandidate?:(candidates:Candidate[])=>Promise<void>):Promise<Candidate[]>{
  if(!Number.isInteger(attempts)||attempts<1||attempts>10)throw new Error('Choose 1–10 candidates per page.');
  const candidates:Candidate[]=[];
  for(let index=0;index<stories.length;index++){
    const story=stories[index];
    const entry:Entry={id:`recorded-${index+1}`,title:story.title,original:story.text,revision:1,createdAt:story.date,updatedAt:story.date};
    const input={entry,history:stories.slice(0,index).reverse().slice(0,3).map(s=>s.text)};
    for(let attempt=1;attempt<=attempts;attempt++){
      let rawResponse:string|undefined;let haunting:Haunting|undefined;let error:string|undefined;
      const start=performance.now();
      try{
        haunting=await generateHaunting(input,new AbortController().signal,async(url,options)=>{
          const response=await transport(url,options);
          rawResponse=await response.clone().text();return response;
        });
      }catch(e){error=e instanceof Error?e.message:String(e)}
      candidates.push({id:entry.id,attempt,entry,messages:buildMessages(input),model,elapsedMs:Math.round(performance.now()-start),rawResponse,haunting,error});
      await onCandidate?.(candidates);
    }
  }
  return candidates;
}

async function main(){
  const selectIndex=process.argv.indexOf('--select');
  if(selectIndex>=0){
    const choices=process.argv[selectIndex+1]?.split(',').map(Number);
    if(!choices||choices.length!==3||choices.some(n=>!Number.isInteger(n)||n<1))throw new Error('Use --select 1,2,3 (one attempt per page).');
    const evidence=JSON.parse(await readFile('artifacts/demo-candidates.json','utf8'));
    const candidates:Candidate[]=evidence.candidates;
    const selected=stories.map((story,i)=>{
      const c=candidates.find(c=>c.id===`recorded-${i+1}`&&c.attempt===choices[i]);
      if(!c?.haunting||c.error||c.entry.original!==story.text)throw new Error('Missing, failed or outdated candidate. Generate again.');
      const messages=buildMessages({entry:c.entry,history:stories.slice(0,i).reverse().map(s=>s.text)});
      if(JSON.stringify(c.messages)!==JSON.stringify(messages))throw new Error('Prompt or context changed. Generate again.');
      const raw=JSON.parse(c.rawResponse!);
      if(JSON.stringify(JSON.parse(raw.message.content).edits)!==JSON.stringify(c.haunting.edits))throw new Error('Candidate differs from raw model reply.');
      entrySchema.parse({...c.entry,haunting:c.haunting});
      if(applyHaunting(c.entry.original,c.haunting.edits)!==c.haunting.text)throw new Error('Invalid candidate text.');
      return c;
    });
    await writeFile('src/demo/recorded.json',JSON.stringify(selected.map(c=>({...c.entry,haunting:c.haunting})),null,2)+'\n');
    await writeFile('docs/demo-generation.json',JSON.stringify({...evidence,selected:choices},null,2)+'\n');
    await writeFile('docs/model-measurements.json',JSON.stringify(selected.map(c=>({id:c.id,attempt:c.attempt,model:c.model,elapsedMs:c.elapsedMs,generatedAt:c.haunting!.generatedAt})),null,2)+'\n');
    console.log('Selected complete, unmodified model outputs:',choices.join(','));return;
  }
  const countIndex=process.argv.indexOf('--candidates');
  const attempts=countIndex<0?3:Number(process.argv[countIndex+1]);
  const response=await fetch('http://127.0.0.1:11434/api/tags');
  if(!response.ok)throw new Error('Cannot inspect local Ollama models.');
  const tags=await response.json();const identity=tags.models.find((m:{name:string})=>m.name===model);
  if(!identity)throw new Error(`Install ${model} in local Ollama first.`);
  const version=await (await fetch('http://127.0.0.1:11434/api/version')).json();
  await mkdir('artifacts',{recursive:true});
  await recordCandidates(attempts,fetch,async candidates=>{
    await writeFile('artifacts/demo-candidates.json',JSON.stringify({recordedAt:new Date().toISOString(),identity,ollamaVersion:version.version,candidates},null,2)+'\n');
    const c=candidates.at(-1)!;console.log(`${c.id} candidate ${c.attempt}: ${c.elapsedMs}ms · ${c.haunting?.edits[0].text??c.error}`);
  });
  console.log('Review artifacts/demo-candidates.json, then run npm run record:demo -- --select 1,1,1 with your chosen attempts. Demo unchanged until selection.');
}

// Importing the recorder in tests must never start inference or write files.
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  await main();
}
