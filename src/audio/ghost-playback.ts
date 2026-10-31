type GhostMedia=Pick<HTMLAudioElement,'play'|'pause'|'currentTime'>;

export function createGhostPlayback(audio:GhostMedia){
  let request=0;
  return {
    async play(){
      const ownRequest=++request;
      await audio.play();
      // A cancelled promise can settle after a newer click. It must not
      // change that newer request or resurrect a stopped voice.
      return ownRequest===request;
    },
    stop(){request++;audio.pause();audio.currentTime=0},
  };
}
