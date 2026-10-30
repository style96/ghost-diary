import {it,expect} from 'vitest';
import {parseBackup,serializeBackup} from '../src/domain/backup';
const entry={id:'one',title:'Anı',original:'Üşüdüm. 🌙',revision:1,createdAt:'2026-10-30T12:00:00.000Z',updatedAt:'2026-10-30T12:00:00.000Z'};
it('round-trips original Unicode data',()=>expect(parseBackup(serializeBackup([entry]))).toEqual([entry]));
it.each([
  {version:2,entries:[entry]},
  {version:1,entries:[entry,entry]},
  {version:1,entries:[{...entry,original:'x'.repeat(12001)}]},
  {version:1,entries:[{...entry,haunting:{edits:[],text:'Forged',model:'fake',generatedAt:entry.createdAt}}]},
])('rejects an invalid backup without partial acceptance',data=>expect(()=>parseBackup(JSON.stringify(data))).toThrow());
