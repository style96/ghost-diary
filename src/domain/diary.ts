import { z } from 'zod';
export const editSchema=z.object({kind:z.enum(['replace','insertAfter']),target:z.string().min(1).max(12000),text:z.string().trim().min(1).max(400)}).strict();
export type Edit=z.infer<typeof editSchema>;
export const hauntingSchema=z.object({edits:z.array(editSchema).min(1).max(2),text:z.string().min(1).max(13000),model:z.string().min(1).max(100),generatedAt:z.iso.datetime()}).strict();
export type Haunting=z.infer<typeof hauntingSchema>;
export const entrySchema=z.object({id:z.string().min(1).max(100),title:z.string().trim().min(1).max(120),original:z.string().min(1).max(12000).refine(v=>v.trim().length>0),revision:z.number().int().positive(),createdAt:z.iso.datetime(),updatedAt:z.iso.datetime(),haunting:hauntingSchema.optional()}).strict();
export type Entry=z.infer<typeof entrySchema>;
export type GenerateInput={entry:Pick<Entry,'id'|'revision'|'original'>;history:string[]};
export type ModelStatus={available:boolean;model:string;message?:string};
