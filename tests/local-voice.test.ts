import {describe,it,expect,vi} from 'vitest';
import {handleApi} from '../server/http';
import {getLocalVoice,requestLocalVoice} from '../src/audio/local-voice';
import recorded from '../src/demo/recorded.json';
import type {Entry} from '../src/domain/diary';
const wav=new Uint8Array([82,73,70,70,0,0,0,0,87,65,86,69]);
const request=(body:unknown={text:'I touched the umbrella.'},origin?:string)=>new Request('http://127.0.0.1:3001/api/voice',{
  method:'POST',headers:{'Content-Type':'application/json',...(origin?{Origin:origin}:{})},body:JSON.stringify(body),
});
describe('local Windows narration',()=>{
  it('returns audio without caching and gives the renderer only the requested sentence',async()=>{
    const voice=vi.fn(async()=>Buffer.from(wav));
    const response=await handleApi(request(),{voice} as never);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('audio/wav');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(wav);
    expect(voice).toHaveBeenCalledWith('I touched the umbrella.',expect.any(AbortSignal));
  });
  it('rejects foreign origins and invalid input before calling speech',async()=>{
    const voice=vi.fn();
    expect((await handleApi(request(undefined,'https://evil.example'),{voice} as never)).status).toBe(403);
    for(const body of [{text:''},{text:'x'.repeat(802)},{text:'Hi',original:'private'},{text:4}]){
      expect((await handleApi(request(body),{voice} as never)).status).toBe(400);
    }
    expect(voice).not.toHaveBeenCalled();
  });
  it('recovers after renderer errors and prevents simultaneous synthesis',async()=>{
    const broken=await handleApi(request(),{voice:async()=>{throw new Error('internal path')}} as never);
    expect(broken.status).toBe(503);
    expect(await broken.text()).not.toContain('internal path');
    let finish!:(audio:Buffer)=>void;
    const first=handleApi(request(),{voice:()=>new Promise<Buffer>(resolve=>{finish=resolve})} as never);
    await vi.waitFor(()=>expect(finish).toBeTypeOf('function'));
    expect((await handleApi(request(),{voice:vi.fn()} as never)).status).toBe(429);
    finish(Buffer.from(wav));expect((await first).status).toBe(200);
  });
  it('offers local playback only for an active haunting and sends only inserted words',async()=>{
    const entry=recorded[0] as Entry;
    expect(getLocalVoice({...entry,haunting:undefined})).toBeUndefined();
    const voice=getLocalVoice(entry)!;
    const transport=vi.fn(async()=>new Response(wav,{headers:{'Content-Type':'audio/wav'}}));
    const controller=new AbortController();
    await requestLocalVoice(voice.text!,controller.signal,transport);
    expect(transport).toHaveBeenCalledTimes(1);
    const [url,options]=transport.mock.calls[0] as unknown as [string,RequestInit];
    expect(url).toBe('/api/voice');
    expect(JSON.parse(options.body as string)).toEqual({text:entry.haunting!.edits.map(e=>e.text).join(' ')});
    expect(voice.provider).toBe('windows');
  });
});
