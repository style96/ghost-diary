import {createHash, randomUUID} from 'node:crypto';
import {mkdir, readFile, rename, writeFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {ElevenLabsClient} from '@elevenlabs/elevenlabs-js';

type SpeechRequest={text:string;modelId:string;outputFormat:'mp3_44100_128';voiceSettings:{stability:number;similarityBoost:number}};
type Convert=(voiceId:string,request:SpeechRequest)=>Promise<ReadableStream<Uint8Array>>;
type Voice={id:string;src:string;text:string;provider:'elevenlabs';voiceId:string;modelId:string;delivery:'whisper'};
type Options={root:string;env?:NodeJS.ProcessEnv;dryRun?:boolean;convert?:Convert;reusePreview?:boolean};

// Node-only tooling: no diary originals, credentials, or SDK enter the browser bundle.
export async function recordVoices({root,env=process.env,dryRun=false,convert,reusePreview=false}:Options):Promise<Voice[]>{
  const samples:unknown=JSON.parse(await readFile(join(root,'src/demo/recorded.json'),'utf8'));
  if(!Array.isArray(samples)||samples.length!==3)throw new Error('Expected exactly three recorded demo fixtures.');
  const voiceId=env.ELEVENLABS_VOICE_ID?.trim()||'EXAVITQu4vr4xnSDxMaL';
  const modelId=env.ELEVENLABS_MODEL_ID?.trim()||'eleven_v4';
  if(!/^[a-zA-Z0-9_-]+$/.test(voiceId)||!/^[a-zA-Z0-9_-]+$/.test(modelId))throw new Error('Invalid ElevenLabs voice or model ID.');
  if(!['eleven_v4','eleven_v3'].includes(modelId))throw new Error('Whisper delivery requires eleven_v4 or eleven_v3. Update ELEVENLABS_MODEL_ID.');
  const voices:Voice[]=samples.map((sample,i)=>{
    if(sample?.id!==`recorded-${i+1}`||!Array.isArray(sample.haunting?.edits)||sample.haunting.edits.length===0)
      throw new Error('Invalid recorded demo fixture.');
    const texts=sample.haunting.edits.map((edit:{text?:unknown})=>{
      if(typeof edit.text!=='string'||!edit.text.trim())throw new Error('Invalid recorded demo fixture text.');
      return edit.text;
    });
    const text=texts.join(' ');
    if(text.length>2000)throw new Error('Recorded demo fixture text exceeds the narration limit.');
    return {id:sample.id,src:'',text,provider:'elevenlabs',voiceId,modelId,delivery:'whisper'};
  });
  if(dryRun)return voices;
  if(!env.ELEVENLABS_API_KEY?.trim())throw new Error('Missing ELEVENLABS_API_KEY. Run ElevenLabs onboarding first.');
  const requestFor=(text:string):SpeechRequest=>({text:`[whispers] ${text}`,modelId,outputFormat:'mp3_44100_128',voiceSettings:{stability:0.5,similarityBoost:0.75}});
  let approvedClip:Buffer|undefined;
  if(reusePreview){
    const metadata=JSON.parse(await readFile(join(root,'artifacts/friendly-whisper-preview.json'),'utf8'));
    const request=requestFor(voices[0].text);
    if(metadata.voiceId!==voiceId||metadata.modelId!==modelId||metadata.text!==request.text||
      metadata.outputFormat!==request.outputFormat||metadata.voiceSettings?.stability!==0.5||
      metadata.voiceSettings?.similarityBoost!==0.75||metadata.background!==false||metadata.postProcessing!==false)
      throw new Error('Approved preview does not match current text, voice or whisper settings.');
    approvedClip=await readFile(join(root,'artifacts/friendly-whisper-preview.mp3'));
    if(approvedClip.length!==metadata.bytes||approvedClip.length>5*1024*1024)throw new Error('Approved preview file is invalid.');
  }
  // The SDK reads ELEVENLABS_API_KEY from the Node process environment.
  const client=convert?undefined:new ElevenLabsClient();
  const speak:Convert=convert??((id,request)=>client!.textToSpeech.convert(id,request,{timeoutInSeconds:60,maxRetries:0}));
  const clips:Buffer[]=[];
  for(const voice of voices){
    let stream:ReadableStream<Uint8Array>;
    try{
      stream=voice.id==='recorded-1'&&approvedClip
        ?new ReadableStream({start(controller){controller.enqueue(approvedClip!);controller.close()}})
        :await speak(voiceId,requestFor(voice.text));
    }
    catch(error){
      const status=(error as {statusCode?:unknown})?.statusCode;
      throw new Error(`ElevenLabs generation failed for ${voice.id}${typeof status==='number'?` (HTTP ${status})`:''}. Check access, voice, model and quota. Existing manifest unchanged.`);
    }
    const reader=stream.getReader(),chunks:Uint8Array[]=[];let size=0;
    try{
      while(true){
        const {value,done}=await reader.read();if(done)break;
        size+=value.byteLength;
        if(size>5*1024*1024){await reader.cancel();throw new Error('Audio exceeds the size limit.')}
        chunks.push(value);
      }
    }catch{throw new Error(`Audio download failed for ${voice.id}. Existing manifest unchanged.`)}
    finally{reader.releaseLock()}
    const clip=Buffer.concat(chunks);
    const mp3=clip.length>=3&&(clip.subarray(0,3).toString('ascii')==='ID3'||(clip[0]===0xff&&(clip[1]&0xe0)===0xe0));
    if(!mp3||clip.length<100)throw new Error(`Invalid or empty MP3 for ${voice.id}. Existing manifest unchanged.`);
    clips.push(clip);
  }
  // New generation paths never overwrite old audio. The manifest is the final commit point.
  const generation=randomUUID();
  await mkdir(join(root,'public/audio'),{recursive:true});
  for(const [i,voice] of voices.entries()){
    const hash=createHash('sha256').update(clips[i]).digest('hex').slice(0,12);
    voice.src=`/audio/${voice.id}-elevenlabs-${generation}-${hash}.mp3`;
    await writeFile(join(root,'public',voice.src),clips[i],{flag:'wx'});
  }
  const manifestPath=join(root,'src/demo/voices.json');
  const stagingPath=join(root,`src/demo/.voices-${generation}.json`);
  await writeFile(stagingPath,JSON.stringify(voices,null,2)+'\n',{flag:'wx'});
  await rename(stagingPath,manifestPath);
  return voices;
}

async function main(){
  const args=process.argv.slice(2);
  if(args.some(arg=>!['--dry-run','--reuse-preview'].includes(arg)))throw new Error('Usage: npm run record:voices -- [--dry-run] [--reuse-preview]');
  const dryRun=args.includes('--dry-run');
  const voices=await recordVoices({root:resolve('.'),dryRun,reusePreview:args.includes('--reuse-preview')});
  for(const voice of voices)console.log(`${voice.id}: ${voice.text}${dryRun?'':` → ${voice.src}`}`);
  console.log(dryRun?'Dry run only: no API request or file changes.':'Three ElevenLabs clips saved; manifest updated. Review the audio before publishing.');
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{await main()}
  catch(error){console.error(error instanceof Error?error.message:'Voice generation failed.');process.exitCode=1}
}
