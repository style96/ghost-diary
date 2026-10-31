import {describe,it,expect} from 'vitest';
import {recordCandidates} from '../scripts/record-demo';
import {stories} from '../scripts/demo-stories';
import {SYSTEM_PROMPT} from '../server/ollama';

describe('recording real inference inputs and outputs',()=>{
  it('sends only previous originals and saves exact Ollama messages and replies',async()=>{
    const requests:Array<{messages:Array<{role:string;content:string}>}>=[];
    const transport:typeof fetch=async(_url,options)=>{
      const body=JSON.parse(options!.body as string);requests.push(body);
      const {original}=JSON.parse(body.messages.at(-1).content.split('\n\nDiary data (JSON):\n')[1]);
      return new Response(JSON.stringify({model:'gemma3:4b',message:{content:JSON.stringify({edits:[{kind:'insertAfter',target:original.split('. ')[0]+'.',text:'I am here.'}]})}}));
    };
    const candidates=await recordCandidates(1,transport);
    expect(requests).toHaveLength(3);
    for(let i=0;i<3;i++){
      const expected=stories.slice(0,i).reverse().map(s=>s.text);
      expect(JSON.parse(requests[i].messages.at(-1)!.content.split('\n\nDiary data (JSON):\n')[1])).toEqual({original:stories[i].text,history:expected});
      expect(candidates[i].messages).toEqual(requests[i].messages);
      expect(candidates[i].haunting!.edits[0].text).toBe('I am here.');
      expect(JSON.parse(candidates[i].rawResponse!).message.content).toContain('I am here.');
      expect(candidates[i].elapsedMs).toBeGreaterThanOrEqual(0);
    }
  });
  it('retains failed candidates instead of inventing fallback text',async()=>{
    const transport:typeof fetch=async()=>new Response('{"message":{"content":"invalid JSON"}}');
    const candidates=await recordCandidates(1,transport);
    expect(candidates).toHaveLength(3);
    expect(candidates.every(c=>c.error && !c.haunting && c.rawResponse)).toBe(true);
  });
  it('checkpoints every failed attempt and rejects invalid candidate counts before calling the model',async()=>{
    let calls=0;const checkpoints:number[]=[];
    const transport:typeof fetch=async()=>{calls++;throw new Error('Ollama offline')};
    await expect(recordCandidates(0,transport)).rejects.toThrow('1–10');
    expect(calls).toBe(0);
    const candidates=await recordCandidates(1,transport,async candidates=>{checkpoints.push(candidates.length)});
    expect(checkpoints).toEqual([1,2,3]);
    expect(candidates.every(c=>c.error==='Ollama offline'&&!c.haunting)).toBe(true);
  });
  it('explicitly grounds callbacks in history and forbids invented past memories',()=>{
    expect(SYSTEM_PROMPT).toContain('history is empty');
    expect(SYSTEM_PROMPT).toContain('Never invent a past event');
    expect(SYSTEM_PROMPT).toContain('newest first');
  });
});
