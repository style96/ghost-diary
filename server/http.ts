import {z} from 'zod';
import {generateHaunting,getModelStatus} from './ollama';
const inputSchema=z.object({entry:z.object({id:z.string().min(1).max(100),revision:z.number().int().positive(),original:z.string().min(1).max(12000).refine(v=>!!v.trim())}).strict(),history:z.array(z.string().max(12000)).max(3)}).strict();
type Dependencies={generate:typeof generateHaunting;status:typeof getModelStatus};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function handleApi(request:Request,deps:Dependencies={generate:generateHaunting,status:getModelStatus}):Promise<Response>{
  const url=new URL(request.url),host=request.headers.get('host')||url.host;
  if(!['127.0.0.1:3001','localhost:3001'].includes(host))return json({error:'Local requests only.'},403);
  const origin=request.headers.get('origin');
  if(origin&&!['http://127.0.0.1:3001','http://localhost:3001','http://127.0.0.1:5173','http://localhost:5173'].includes(origin))return json({error:'Origin is not allowed.'},403);
  if(url.pathname==='/api/status'&&request.method==='GET')return json(await deps.status());
  if(url.pathname!=='/api/haunt'||request.method!=='POST')return json({error:'Not found.'},404);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON requests required.'},415);
  const text=await request.text();if(new TextEncoder().encode(text).length>65536)return json({error:'Entry is too large.'},413);
  let input;try{input=inputSchema.parse(JSON.parse(text))}catch{return json({error:'Invalid diary request.'},400)}
  try{return json({haunting:await deps.generate(input,request.signal)})}
  catch{return json({error:'The ghost could not leave a valid trace. Check Ollama and try again; your original is safe.'},503)}
}
