import {writeFile,mkdir} from 'node:fs/promises';
import {generateHaunting,model} from '../server/ollama';
import type {Entry} from '../src/domain/diary';
const stories=[
  {title:'The yellow umbrella',date:'2026-10-28T21:14:00.000Z',text:'It rained all the way home. I left my yellow umbrella beside the door, dripping onto the floorboards. The apartment was quiet for once.\n\nI made tea in the chipped blue cup and finally finished that book. Around midnight, I heard three soft knocks from the kitchen. Probably the pipes.\n\nI should get some sleep. I live alone, after all.'},
  {title:'A second cup',date:'2026-10-29T22:06:00.000Z',text:'The yellow umbrella was dry this morning. Strange, because there was a little puddle beneath it.\n\nI found two cups on the kitchen table. Mine was still warm. I put the other one back in the cupboard. Perhaps I was more tired than I thought.\n\nThe knocking started again tonight. Three times. Always three.'},
  {title:'A note to myself',date:'2026-10-30T23:42:00.000Z',text:'I moved the yellow umbrella into the closet. I checked the lock twice before bed.\n\nThere is a line in yesterday’s diary that I cannot remember writing. The ink looks different. I have been staring at it for twenty minutes.\n\nIf this happens again, I will leave this notebook open on the kitchen table. I want to see what happens when I stop looking.'},
];
const entries:Entry[]=[];const measurements=[];
for(let index=0;index<stories.length;index++){
  const story=stories[index];const entry:Entry={id:`recorded-${index+1}`,title:story.title,original:story.text,revision:1,createdAt:story.date,updatedAt:story.date};
  const start=performance.now();const haunting=await generateHaunting({entry,history:entries.map(e=>e.original).reverse()},new AbortController().signal);
  const elapsedMs=Math.round(performance.now()-start);entries.push({...entry,haunting});measurements.push({id:entry.id,model,elapsedMs,generatedAt:haunting.generatedAt});console.log(`${entry.title}: ${elapsedMs}ms · ${haunting.edits[0].text}`);
}
await writeFile('src/demo/recorded.json',JSON.stringify(entries,null,2)+'\n');
await mkdir('artifacts',{recursive:true});await writeFile('artifacts/model-measurements.json',JSON.stringify(measurements,null,2));
console.log(`Saved ${entries.length} real ${model} examples.`);
