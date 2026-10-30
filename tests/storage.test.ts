import 'fake-indexeddb/auto';
import {IDBFactory} from 'fake-indexeddb';
import { describe,it,expect,beforeEach,vi } from 'vitest';
import { listEntries,saveEntry,deleteEntry,applyIfCurrent,importEntries } from '../src/storage/diary-store';
import type {Entry,Haunting} from '../src/domain/diary';
const entry:Entry={id:'one',title:'The door',original:'I locked the door.',revision:1,createdAt:'2026-10-30T12:00:00.000Z',updatedAt:'2026-10-30T12:00:00.000Z'};
const haunting:Haunting={edits:[{kind:'replace',target:'I locked the door.',text:'Someone unlocked it.'}],text:'Someone unlocked it.',model:'gemma3:1b',generatedAt:'2026-10-30T12:00:00.000Z'};
beforeEach(()=>{globalThis.indexedDB=new IDBFactory()});
describe('persistent originals',()=>{
  it('saves and reads an entry, preserving the original on haunt and restore',async()=>{
    const saved=await saveEntry(entry,true);expect((await listEntries())[0].original).toBe(entry.original);
    expect(await applyIfCurrent(saved.id,saved.revision,haunting)).toBe(true);
    expect((await listEntries())[0]).toMatchObject({original:entry.original,haunting});
    await saveEntry({...((await listEntries())[0]),haunting:undefined});
    expect((await listEntries())[0].haunting).toBeUndefined();
  });
  it('rejects stale results after edits and after deletion',async()=>{
    const saved=await saveEntry(entry,true);
    const edited=await saveEntry({...saved,original:'I stayed outside.'});
    expect(edited.revision).toBeGreaterThan(saved.revision);
    expect(await applyIfCurrent(saved.id,saved.revision,haunting)).toBe(false);
    await deleteEntry(saved.id);
    expect(await applyIfCurrent(edited.id,edited.revision,haunting)).toBe(false);
    expect(await listEntries()).toEqual([]);
  });
  it('does not replace existing data on an invalid import',async()=>{
    await saveEntry(entry,true);
    await expect(importEntries([{...entry,original:''}])).rejects.toThrow();
    expect((await listEntries())[0].original).toBe(entry.original);
  });
  it('rejects stale saves cleanly without an unhandled transaction rejection',async()=>{
    const saved=await saveEntry(entry,true);
    await saveEntry({...saved,title:'Updated'});
    await expect(saveEntry({...saved,title:'Stale'})).rejects.toThrow('changed');
    expect((await listEntries())[0].title).toBe('Updated');
  });
  it('does not let an old editor resurrect a deleted page',async()=>{
    const old=await saveEntry(entry,true);await deleteEntry(old.id);
    await expect(saveEntry({...old,original:'An old tab saved this.'})).rejects.toThrow();
    expect(await listEntries()).toEqual([]);
  });
  it('invalidates old editors and generations even when a backup reuses revisions',async()=>{
    const old=await saveEntry(entry,true);
    await importEntries([{...old,original:'The imported original.'}]);
    await expect(saveEntry({...old,original:'A stale edit.'})).rejects.toThrow();
    expect(await applyIfCurrent(old.id,old.revision,haunting)).toBe(false);
    expect((await listEntries())[0].original).toBe('The imported original.');
  });
  it('invalidates old revisions across delete and reimport of the same backup',async()=>{
    const old=await saveEntry(entry,true);await deleteEntry(old.id);
    await importEntries([old]);
    await expect(saveEntry({...old,title:'Stale overwrite'})).rejects.toThrow();
    expect((await listEntries())[0].title).toBe('The door');
  });
  it('rolls back a replacing import when storage fails after clearing',async()=>{
    await saveEntry(entry,true);
    const put=IDBObjectStore.prototype.put;
    const spy=vi.spyOn(IDBObjectStore.prototype,'put').mockImplementation(function(this:IDBObjectStore,value,key){
      if(value.original==='Quota failure.')throw new DOMException('No space','QuotaExceededError');
      return put.call(this,value,key);
    });
    try{await expect(importEntries([{...entry,original:'Quota failure.'}])).rejects.toThrow('No space')}
    finally{spy.mockRestore()}
    expect((await listEntries())[0]?.original).toBe(entry.original);
  });
});
