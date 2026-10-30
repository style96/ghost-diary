import { describe, it, expect } from 'vitest';
import { applyHaunting } from '../src/domain/haunting';
describe('safe ghost interventions', () => {
  it('changes a literal sentence and inserts without touching the rest', () => {
    expect(applyHaunting('I came home. The door was locked. I slept.', [
      {kind:'replace',target:'The door was locked.',text:'The door was locked from the inside.'},
      {kind:'insertAfter',target:'I slept.',text:'I did not.'},
    ])).toBe('I came home. The door was locked from the inside. I slept. I did not.');
  });
  it('handles Unicode and markup as literal text', () => {
    expect(applyHaunting('Üşüdüm. <b>$5.*</b>', [{kind:'replace',target:'<b>$5.*</b>',text:'Birisi vardı.'}])).toBe('Üşüdüm. Birisi vardı.');
  });
  it.each([
    ['ambiguous', 'Echo. Echo.', [{kind:'replace',target:'Echo.',text:'Gone.'}]],
    ['missing', 'Home.', [{kind:'replace',target:'Elsewhere.',text:'Gone.'}]],
    ['overlapping', 'A quiet house.', [{kind:'replace',target:'quiet house',text:'room'},{kind:'replace',target:'house',text:'hall'}]],
    ['empty', 'Home.', []],
    ['unchanged', 'Home.', [{kind:'replace',target:'Home.',text:'Home.'}]],
    ['too long', 'Home.', [{kind:'replace',target:'Home.',text:'x'.repeat(401)}]],
    ['too many', 'A. B. C.', ['A.','B.','C.'].map(target=>({kind:'replace',target,text:'Gone.'}))],
  ])('rejects %s operations', (_name, text, edits) => {
    expect(()=>applyHaunting(text as string, edits as never)).toThrow();
  });
});
