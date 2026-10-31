import {describe,it,expect} from 'vitest';
import {getRecordedVoice} from '../src/demo/voices';
import {createGhostPlayback} from '../src/audio/ghost-playback';
import recorded from '../src/demo/recorded.json';
import voices from '../src/demo/voices.json';
import type {Entry} from '../src/domain/diary';

describe('recorded ghost voices',()=>{
  it('offers an asset only when the manifest matches the exact new intervention',()=>{
    for(const entry of recorded){
      const voice=voices.find(v=>v.id===entry.id);
      const matching=voice?.text===entry.haunting.edits.map(e=>e.text).join(' ');
      expect(getRecordedVoice(entry as Entry)?.src).toBe(matching?voice!.src:undefined);
    }
  });
  it('never assigns demo audio to a hidden, edited or unrelated personal entry',()=>{
    const entry=recorded[0] as Entry;
    expect(getRecordedVoice({...entry,haunting:undefined})).toBeUndefined();
    expect(getRecordedVoice({...entry,original:'My private diary.'})).toBeUndefined();
    expect(getRecordedVoice({...entry,haunting:{...entry.haunting!,text:'A different ghost.'}})).toBeUndefined();
    expect(getRecordedVoice({...entry,id:'personal-page'})).toBeUndefined();
  });
});

describe('ghost playback lifecycle',()=>{
  function media(){
    const pending:Array<()=>void>=[];
    const audio={paused:true,currentTime:2,play:()=>{audio.paused=false;return new Promise<void>(done=>{pending.push(done)})},pause:()=>{audio.paused=true}};
    return {audio,finish:()=>pending.shift()!()};
  }
  it('stops and rewinds on disposal even while play is pending',async()=>{
    const m=media(),player=createGhostPlayback(m.audio);
    const playing=player.play();
    player.stop();
    m.finish();
    expect(await playing).toBe(false);
    expect(m.audio.paused).toBe(true);
    expect(m.audio.currentTime).toBe(0);
  });
  it('reports a completed play request as active',async()=>{
    const m=media(),player=createGhostPlayback(m.audio);
    const playing=player.play();m.finish();
    expect(await playing).toBe(true);
    expect(m.audio.paused).toBe(false);
  });
  it('keeps a newer play request alive when an older request completes late',async()=>{
    const m=media(),player=createGhostPlayback(m.audio);
    const first=player.play();const finishFirst=m.finish;
    player.stop();
    const second=player.play();
    finishFirst();expect(await first).toBe(false);
    m.finish();expect(await second).toBe(true);
    expect(m.audio.paused).toBe(false);
  });
  it('lets playback errors reach the UI without suppressing retries',async()=>{
    let broken=true;
    const audio={currentTime:0,pause:()=>{},play:()=>broken?Promise.reject(new Error('Missing audio')):Promise.resolve()};
    const player=createGhostPlayback(audio);
    await expect(player.play()).rejects.toThrow('Missing audio');
    broken=false;expect(await player.play()).toBe(true);
  });
});
