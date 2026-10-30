import type {Entry} from '../domain/diary';
export function HauntedText({entry}:{entry:Entry}){
  if(!entry.haunting)return <>{entry.original}</>;
  const edits=entry.haunting.edits.map(edit=>({edit,start:entry.original.indexOf(edit.target)})).sort((a,b)=>a.start-b.start);
  const parts:React.ReactNode[]=[];let position=0;
  for(const {edit,start} of edits){
    parts.push(entry.original.slice(position,start));
    if(edit.kind==='insertAfter')parts.push(edit.target,' ');
    parts.push(<mark className="ghost-ink" key={start}>{edit.text}</mark>);
    position=start+edit.target.length;
  }
  parts.push(entry.original.slice(position));return <>{parts}</>;
}
export function HauntingCompare({entry,onClose}:{entry:Entry;onClose:()=>void}){
  return <div className="modal-backdrop" onClick={onClose}><section className="comparison modal" role="dialog" aria-modal="true" aria-labelledby="compare-title" onClick={e=>e.stopPropagation()}>
    <div className="modal-head"><div><span className="eyebrow">THE EVIDENCE</span><h2 id="compare-title">You didn't write all of this.</h2></div><button autoFocus onClick={onClose} aria-label="Close comparison">✕</button></div>
    <div className="compare-columns"><div><h3>Your original <span>untouched</span></h3><p>{entry.original}</p></div><div><h3>After the night <span className="red">{entry.haunting?.edits.length} trace left</span></h3><p><HauntedText entry={entry}/></p></div></div>
    <p className="modal-foot">Original words preserved. Ghost ink marked in red. Nothing is lost.</p>
  </section></div>;
}
