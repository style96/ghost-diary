import {useEffect,useRef,useState} from 'react';
import {Volume2,Square,LoaderCircle} from 'lucide-react';
import {createGhostPlayback} from '../audio/ghost-playback';
import {requestLocalVoice} from '../audio/local-voice';
import type {RecordedVoice} from '../demo/voices';

export function GhostVoice({voice}:{voice:RecordedVoice}){
  const audio=useRef<HTMLAudioElement>(null);
  const playback=useRef<ReturnType<typeof createGhostPlayback>|null>(null);
  const [state,setState]=useState<'idle'|'loading'|'playing'>('idle');
  const [error,setError]=useState(false);
  const attempt=useRef(0);
  const pending=useRef<AbortController|null>(null),localURL=useRef<string|null>(null);
  useEffect(()=>{
    const player=createGhostPlayback(audio.current!);playback.current=player;
    return()=>{attempt.current++;pending.current?.abort();player.stop();playback.current=null;
      if(localURL.current){URL.revokeObjectURL(localURL.current);localURL.current=null}};
  },[voice.src,voice.text]);
  async function toggle(){
    const player=playback.current;if(!player)return;
    const ownAttempt=++attempt.current;
    if(state!=='idle'){pending.current?.abort();player.stop();setState('idle');return}
    setError(false);setState('loading');
    try{
      if(voice.provider==='windows'&&!localURL.current){
        const controller=new AbortController();pending.current=controller;
        const blob=await requestLocalVoice(voice.text!,controller.signal);
        if(controller.signal.aborted||attempt.current!==ownAttempt)return;
        localURL.current=URL.createObjectURL(blob);audio.current!.src=localURL.current;
      }
      if(await player.play()&&attempt.current===ownAttempt)setState('playing');
    }
    catch{if(attempt.current===ownAttempt){setError(true);setState('idle')}}
  }
  return <div className={`ghost-voice-card ${state==='playing'?'voice-playing':''}`}>
    <div className="voice-caption"><span className="eyebrow">A VOICE BETWEEN THE LINES</span><span>Read it. Then hear who wrote it.</span></div>
    <button className="ghost-voice-button" onClick={toggle} aria-pressed={state!=='idle'}>
      {state==='loading'?<LoaderCircle size={15} className="voice-loading"/>:state==='playing'?<Square size={13}/>:<Volume2 size={16}/>}
      {state==='loading'?'Cancel voice':state==='playing'?'Stop the ghost':'Hear the ghost'}
      <span className="voice-wave" aria-hidden="true"><i/><i/><i/><i/><i/></span>
    </button>
    <audio ref={audio} src={voice.src||undefined} preload="none" aria-label={voice.label}
      onEnded={()=>setState('idle')} onPause={()=>setState('idle')}
      onError={()=>{setError(true);setState('idle')}}/>
    <p className="voice-footnote" role={error?'status':undefined}>{error?(voice.provider==='windows'?'The voice could not be prepared. Check Windows speech and Python 3, then try again.':'The voice could not be played. Try again.'):voice.provider==='windows'?'Optional sound · Windows voice · generated on this device':voice.provider==='elevenlabs'?'Optional sound · recorded ElevenLabs voice · plays on this device':'Optional sound · temporary synthesized voice · plays on this device'}</p>
  </div>;
}
