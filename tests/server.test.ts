import { describe, it, expect } from 'vitest';
import { handleApi } from '../server/http';
import { generateHaunting, buildMessages } from '../server/ollama';
const input = {entry:{id:'one',revision:1,original:'I locked the door.'},history:[]};
const diaryData=(messages:ReturnType<typeof buildMessages>)=>JSON.parse(messages.at(-1)!.content.split('\n\nDiary data (JSON):\n')[1]);
const haunting = {edits:[{kind:'replace',target:'I locked the door.',text:'Someone unlocked it.'}],text:'Someone unlocked it.',model:'gemma3:1b',generatedAt:'2026-10-30T12:00:00.000Z'};
const deps = {generate:async()=>haunting,status:async()=>({available:true,model:'gemma3:1b'})};
const request = (body:unknown=input,headers:Record<string,string>={})=>new Request('http://127.0.0.1:3001/api/haunt',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
describe('local inference HTTP boundary',()=>{
  it('returns a valid generation',async()=>{
    const response=await handleApi(request(),deps as never);
    expect(response.status).toBe(200);expect(await response.json()).toEqual({haunting});
  });
  it('rejects foreign origins and host headers',async()=>{
    expect((await handleApi(request(input,{Origin:'https://evil.example'}),deps as never)).status).toBe(403);
    expect((await handleApi(request(input,{Host:'evil.example:3001'}),deps as never)).status).toBe(403);
  });
  it('rejects non-JSON, oversized and malformed input',async()=>{
    expect((await handleApi(request(input,{'Content-Type':'text/plain'}),deps as never)).status).toBe(415);
    expect((await handleApi(request({entry:{...input.entry,original:'x'.repeat(70000)}}),deps as never)).status).toBe(413);
    expect((await handleApi(request({entry:{...input.entry,original:''}}),deps as never)).status).toBe(400);
    expect((await handleApi(request({...input,url:'https://evil.example'}),deps as never)).status).toBe(400);
  });
  it('makes unavailable models recoverable without fake output',async()=>{
    const response=await handleApi(request(),{...deps,generate:async()=>{throw new Error('unavailable')}} as never);
    expect(response.status).toBe(503);expect(await response.json()).toHaveProperty('error');
  });
  it('bounds model context',()=>{
    const messages=buildMessages({entry:{...input.entry,original:'x'.repeat(12000)},history:Array(10).fill('y'.repeat(12000))});
    const prompt=JSON.stringify(diaryData(messages));
    expect(prompt.length).toBeLessThan(25500);
    expect(diaryData(messages).history).toHaveLength(3);
    expect(diaryData(messages).original).toHaveLength(12000);
    expect(diaryData(messages).history.join('')).toHaveLength(12000);
  });
  it('passes original history unchanged in supplied order and excludes a fourth entry',()=>{
    const history=['A cracked blue cup.','A yellow umbrella.','A missing key.','Not in context.'];
    expect(diaryData(buildMessages({...input,history}))).toEqual({original:input.entry.original,history:history.slice(0,3)});
    expect(diaryData(buildMessages(input)).history).toEqual([]);
  });
  it('keeps instructions and diary together for Gemma templates that map system to user turns',()=>{
    const messages=buildMessages(input);
    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toContain('Never invent a past event');
    expect(diaryData(messages).original).toBe(input.entry.original);
  });
  it('rejects malformed model edits and respects cancellation',async()=>{
    const malformed=async()=>new Response(JSON.stringify({message:{content:'{"edits":[]}'}}));
    await expect(generateHaunting(input,new AbortController().signal,malformed as never)).rejects.toThrow();
    const controller=new AbortController();controller.abort();
    await expect(generateHaunting(input,controller.signal)).rejects.toThrow();
  });
  it('uses only the loopback Ollama URL and returns real validated content',async()=>{
    const transport:typeof fetch=async(url,options)=>{
      if(url!=='http://127.0.0.1:11434/api/chat')throw new Error('Wrong destination');
      const body=JSON.parse(options?.body as string);
      if(body.stream!==false || !body.format)throw new Error('Missing structured contract');
      return new Response(JSON.stringify({message:{content:JSON.stringify({edits:haunting.edits})}}));
    };
    const result=await generateHaunting(input,new AbortController().signal,transport);
    expect(result.text).toBe('Someone unlocked it.');
  });
  it('constrains the model target to actual individual sentences',async()=>{
    const text='I came home. I heard the door.';
    const transport:typeof fetch=async(_url,options)=>{
      const body=JSON.parse(options?.body as string);
      expect(body.format.properties.edits.items.properties.target.enum).toEqual(['I came home.','I heard the door.']);
      return new Response(JSON.stringify({message:{content:JSON.stringify({edits:[{kind:'replace',target:'I came home.',text:'We came home.'}]})}}));
    };
    expect((await generateHaunting({...input,entry:{...input.entry,original:text}},new AbortController().signal,transport)).text).toBe('We came home. I heard the door.');
  });
});
