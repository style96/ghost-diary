import 'fake-indexeddb/auto';
import { describe,it,expect,beforeEach } from 'vitest';
import { listEntries,saveEntry,deleteEntry,applyIfCurrent,importEntries } from '../src/storage/diary-store';
import type {Entry,Haunting} from '../src/domain/diary';
const entry:Entry={id:'one',title:'The door',original:'I locked the door.',revision:1,createdAt:'2026-10-30T12:00:00.000Z',updatedAt:'2026-10-30T12:00:00.000Z'};
const haunting:Haunting={edits:[{kind:'replace',target:'I locked the door.',text:'Someone unlocked it.'}],text:'Someone unlocked it.',model:'gemma3:1b',generatedAt:'2026-10-30T12:00:00.000Z'};
beforeEach(async()=>{await importEntries([])});
describe('persistent originals',()=>{
  it('saves and reads an entry, preserving the original on haunt and restore',async()=>{
    const saved=await saveEntry(entry);expect((await listEntries())[0].original).toBe(entry.original);
    expect(await applyIfCurrent(saved.id,saved.revision,haunting)).toBe(true);
    expect((await listEntries())[0]).toMatchObject({original:entry.original,haunting});
    await saveEntry({...((await listEntries())[0]),haunting:undefined});
    expect((await listEntries())[0].haunting).toBeUndefined();
  });
  it('rejects stale results after edits and after deletion',async()=>{
    const saved=await saveEntry(entry);
    const edited=await saveEntry({...saved,original:'I stayed outside.'});
    expect(edited.revision).toBeGreaterThan(saved.revision);
    expect(await applyIfCurrent(saved.id,saved.revision,haunting)).toBe(false);
    await deleteEntry(saved.id);
    expect(await applyIfCurrent(edited.id,edited.revision,haunting)).toBe(false);
    expect(await listEntries()).toEqual([]);
  });
  it('does not replace existing data on an invalid import',async()=>{
    await saveEntry(entry);
    await expect(importEntries([{...entry,original:''}])).rejects.toThrow();
    expect((await listEntries())[0].original).toBe(entry.original);
  });
  it('rejects stale saves cleanly without an unhandled transaction rejection',async()=>{
    const saved=await saveEntry(entry);
    await saveEntry({...saved,title:'Updated'});
    await expect(saveEntry({...saved,title:'Stale'})).rejects.toThrow('changed');
    expect((await listEntries())[0].title).toBe('Updated');
  });
});
