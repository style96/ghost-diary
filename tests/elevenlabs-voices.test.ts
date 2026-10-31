import {mkdtemp, mkdir, readFile, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {describe, expect, it, vi} from 'vitest';
import recorded from '../src/demo/recorded.json';
import {recordVoices} from '../scripts/record-elevenlabs';

const env={ELEVENLABS_API_KEY:'test-only-secret'};
const bytes=new Uint8Array([0x49,0x44,0x33,...new Array(100).fill(0)]);
const audio=()=>new ReadableStream<Uint8Array>({start(c){c.enqueue(bytes);c.close()}});
async function fixture(samples:unknown=recorded){
  const root=await mkdtemp(join(tmpdir(),'ghost-elevenlabs-'));
  await mkdir(join(root,'src/demo'),{recursive:true});
  await writeFile(join(root,'src/demo/recorded.json'),JSON.stringify(samples));
  await writeFile(join(root,'src/demo/voices.json'),'[]\n');
  return root;
}
describe('ElevenLabs recorded narration',()=>{
  it('dry runs without credentials, network access or manifest changes',async()=>{
    const root=await fixture(),convert=vi.fn();
    const manifest=await recordVoices({root,env:{},dryRun:true,convert});
    expect(manifest.map(v=>v.text)).toEqual(recorded.map(v=>v.haunting.edits.map(e=>e.text).join(' ')));
    expect(convert).not.toHaveBeenCalled();
    expect(await readFile(join(root,'src/demo/voices.json'),'utf8')).toBe('[]\n');
  });
  it('rejects missing credentials before invoking the SDK',async()=>{
    const root=await fixture(),convert=vi.fn();
    await expect(recordVoices({root,env:{},convert})).rejects.toThrow('ELEVENLABS_API_KEY');
    expect(convert).not.toHaveBeenCalled();
  });
  it('sends only the exact fictional insertions and publishes complete assets',async()=>{
    const root=await fixture(),convert=vi.fn(async()=>audio());
    const manifest=await recordVoices({root,env,convert});
    expect(convert.mock.calls).toHaveLength(3);
    for(const [i,call] of convert.mock.calls.entries()){
      expect(call).toEqual(['EXAVITQu4vr4xnSDxMaL',{
        text:'[whispers] '+recorded[i].haunting.edits.map(e=>e.text).join(' '),
        modelId:'eleven_v4',outputFormat:'mp3_44100_128',
        voiceSettings:{stability:0.5,similarityBoost:0.75},
      }]);
      expect(manifest[i].provider).toBe('elevenlabs');
      expect(manifest[i].text).not.toContain('[whispers]');
      expect(await readFile(join(root,'public',manifest[i].src))).toEqual(Buffer.from(bytes));
    }
    const saved=await readFile(join(root,'src/demo/voices.json'),'utf8');
    expect(JSON.parse(saved)).toEqual(manifest);
    expect(saved).not.toContain(env.ELEVENLABS_API_KEY);
  });
  it('reuses the approved first whisper unchanged and generates only the remaining two',async()=>{
    const root=await fixture(),convert=vi.fn(async()=>audio());
    await mkdir(join(root,'artifacts'));
    const metadata={voiceId:'EXAVITQu4vr4xnSDxMaL',modelId:'eleven_v4',
      text:'[whispers] '+recorded[0].haunting.edits.map(e=>e.text).join(' '),
      outputFormat:'mp3_44100_128',voiceSettings:{stability:0.5,similarityBoost:0.75},
      background:false,postProcessing:false,bytes:bytes.length};
    await writeFile(join(root,'artifacts/friendly-whisper-preview.json'),JSON.stringify(metadata));
    await writeFile(join(root,'artifacts/friendly-whisper-preview.mp3'),bytes);
    const manifest=await recordVoices({root,env,convert,reusePreview:true});
    expect(convert).toHaveBeenCalledTimes(2);
    expect(await readFile(join(root,'public',manifest[0].src))).toEqual(Buffer.from(bytes));
    metadata.text='An unrelated preview.';
    await writeFile(join(root,'artifacts/friendly-whisper-preview.json'),JSON.stringify(metadata));
    convert.mockClear();
    await expect(recordVoices({root,env,convert,reusePreview:true})).rejects.toThrow('preview');
    expect(convert).not.toHaveBeenCalled();
  });
  it('leaves the old manifest untouched when a later request fails and redacts errors',async()=>{
    const root=await fixture();let count=0;
    await expect(recordVoices({root,env,convert:async()=>{
      if(++count===2)throw new Error(env.ELEVENLABS_API_KEY);
      return audio();
    }})).rejects.toThrow('recorded-2');
    expect(await readFile(join(root,'src/demo/voices.json'),'utf8')).toBe('[]\n');
  });
  it('rejects non-audio data instead of publishing it',async()=>{
    const root=await fixture();
    await expect(recordVoices({root,env,convert:async()=>new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('{"error":"bad"}'));c.close()}})})).rejects.toThrow('MP3');
    expect(await readFile(join(root,'src/demo/voices.json'),'utf8')).toBe('[]\n');
  });
  it('rejects unsafe fixture IDs before any network access',async()=>{
    const samples=structuredClone(recorded);samples[0].id='../escape';
    const root=await fixture(samples),convert=vi.fn();
    await expect(recordVoices({root,env,convert})).rejects.toThrow('fixture');
    expect(convert).not.toHaveBeenCalled();
  });
});
