import {describe,it,expect} from 'vitest';
import recorded from '../src/demo/recorded.json';
import evidence from '../docs/demo-generation.json';
import {applyHaunting} from '../src/domain/haunting';
import {entrySchema,type Edit} from '../src/domain/diary';
import {getRecordedVoice} from '../src/demo/voices';
import {stories} from '../scripts/demo-stories';

describe('committed fictional Gemma recordings',()=>{
  it('replays exactly the selected raw model replies with the actual prior originals',()=>{
    expect(recorded).toHaveLength(3);
    for(let i=0;i<recorded.length;i++){
      const entry=recorded[i];entrySchema.parse(entry);
      const candidate=evidence.candidates.find(c=>c.id===entry.id&&c.attempt===evidence.selected[i])!;
      const reply=JSON.parse(candidate.rawResponse!);
      expect(entry.original).toBe(stories[i].text);
      expect(entry.haunting.edits).toEqual(JSON.parse(reply.message.content).edits);
      expect(entry.haunting).toEqual(candidate.haunting);
      expect(entry.haunting.model).toBe('gemma3:4b');
      expect(reply.model).toBe('gemma3:4b');
      const data=JSON.parse(candidate.messages.at(-1)!.content.split('\n\nDiary data (JSON):\n')[1]);
      expect(data).toEqual({original:entry.original,history:stories.slice(0,i).reverse().map(s=>s.text)});
      expect(candidate.elapsedMs).toBeGreaterThan(0);
      expect(entry.haunting.edits).toHaveLength(1);
      expect(entry.haunting.edits[0].kind).toBe('insertAfter');
      expect(entry.haunting.edits[0].text.split(/\s+/).length).toBeLessThan(25);
      expect(applyHaunting(entry.original,entry.haunting.edits as Edit[])).toBe(entry.haunting.text);
    }
  });
  it('hides the old spoken sentences for all three new examples',()=>{
    for(const entry of recorded)expect(getRecordedVoice(entry as never)).toBeUndefined();
  });
});
