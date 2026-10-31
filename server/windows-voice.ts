import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';

const run=promisify(execFile);
const processor=fileURLToPath(new URL('../scripts/process-ghost-voices.py',import.meta.url));
// Fixed commands, with paths passed as data via the environment. No user text is
// interpolated into PowerShell code and no execution-policy setting is changed.
const speechCommand=String.raw`
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$ghostText = [System.IO.File]::ReadAllText($env:GHOST_VOICE_TEXT_PATH, [System.Text.Encoding]::UTF8)
$ghostSpeech = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $ghostSpeech.Rate = -1
    $ghostSpeech.Volume = 90
    $ghostFormat = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
    $ghostSpeech.SetOutputToWaveFile($env:GHOST_VOICE_OUTPUT_PATH, $ghostFormat)
    $ghostSpeech.Speak($ghostText)
    $ghostSpeech.SetOutputToNull()
} finally { $ghostSpeech.Dispose() }
`;

export async function synthesizeWindowsVoice(text:string,signal:AbortSignal):Promise<Buffer>{
  if(process.platform!=='win32')throw new Error('Windows desktop speech is required.');
  signal.throwIfAborted();
  const tempRoot=resolve(tmpdir());
  const directory=await mkdtemp(join(tempRoot,'ghost-voice-'));
  const input=join(directory,'sentence.txt'),raw=join(directory,'raw.wav'),output=join(directory,'voice.wav');
  try{
    await writeFile(input,text,'utf8');
    const options={signal,timeout:30000,windowsHide:true,maxBuffer:65536};
    await run('powershell.exe',['-NoProfile','-NonInteractive','-Command',speechCommand],{
      ...options,env:{...process.env,GHOST_VOICE_TEXT_PATH:input,GHOST_VOICE_OUTPUT_PATH:raw},
    });
    await run('python',[processor,'--single',raw,output],options);
    signal.throwIfAborted();
    const audio=await readFile(output);
    if(audio.length<44||audio.length>8*1024*1024||audio.toString('ascii',0,4)!=='RIFF'||audio.toString('ascii',8,12)!=='WAVE')
      throw new Error('Invalid Windows audio.');
    return audio;
  }finally{
    // Only remove the exact newly-created child of the verified temp root.
    const target=resolve(directory);
    if(dirname(target)===tempRoot&&basename(target).startsWith('ghost-voice-'))
      await rm(target,{recursive:true,force:true,maxRetries:5,retryDelay:100});
  }
}
