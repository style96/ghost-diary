import {useEffect,useRef,useState} from 'react';
import {Volume2,Square,LoaderCircle} from 'lucide-react';
import {createGhostPlayback} from '../audio/ghost-playback';
import type {RecordedVoice} from '../demo/voices';

export function GhostVoice({voice}:{voice:RecordedVoice}){
  const audio=useRef<HTMLAudioElement>(null);
  const playback=useRef<ReturnType<typeof createGhostPlayback>|null>(null);
  const [state,setState]=useState<'idle'|'loading'|'playing'>('idle');
  const [error,setError]=useState(false);
  const attempt=useRef(0);
  useEffect(()=>{
    const player=createGhostPlayback(audio.current!);playback.current=player;
    return()=>{attempt.current++;player.stop();playback.current=null};
  },[voice.src]);
  async function toggle(){
    const player=playback.current;if(!player)return;
    const ownAttempt=++attempt.current;
    if(state!=='idle'){player.stop();setState('idle');return}
    setError(false);setState('loading');
    try{if(await player.play()&&attempt.current===ownAttempt)setState('playing')}
    catch{if(attempt.current===ownAttempt){setError(true);setState('idle')}}
  }
  return <div className={`ghost-voice-card ${state==='playing'?'voice-playing':''}`}>
    <div className="voice-caption"><span className="eyebrow">A VOICE BETWEEN THE LINES</span><span>Read it. Then hear who wrote it.</span></div>
    <button className="ghost-voice-button" onClick={toggle} aria-pressed={state!=='idle'}>
      {state==='loading'?<LoaderCircle size={15} className="voice-loading"/>:state==='playing'?<Square size={13}/>:<Volume2 size={16}/>}
      {state==='loading'?'Cancel voice':state==='playing'?'Stop the ghost':'Hear the ghost'}
      <span className="voice-wave" aria-hidden="true"><i/><i/><i/><i/><i/></span>
    </button>
    <audio ref={audio} src={voice.src} preload="none" aria-label={voice.label}
      onEnded={()=>setState('idle')} onPause={()=>setState('idle')}
      onError={()=>{setError(true);setState('idle')}}/>
    <p className="voice-footnote" role={error?'status':undefined}>{error?'The voice could not be played. Try again.':'Optional sound · temporary synthesized voice · plays on this device'}</p>
  </div>;
}
