import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {handleApi} from './http';
const root=resolve('dist');
const types:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.ico':'image/x-icon'};
let generating=false;
const server=createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  const host=req.headers.host||'';
  if(!['127.0.0.1:3001','localhost:3001'].includes(host)){res.writeHead(403).end('Local requests only');return;}
  try{
    const url=new URL(req.url||'/',`http://${host}`);
    if(url.pathname.startsWith('/api/')){
      if(url.pathname==='/api/haunt'&&generating){res.writeHead(429,{'Content-Type':'application/json'}).end(JSON.stringify({error:'The ghost is already writing. Try again shortly.'}));return;}
      let size=0;const chunks:Buffer[]=[];
      for await(const chunk of req){size+=chunk.length;if(size>65536){res.writeHead(413).end();return;}chunks.push(chunk);}
      const controller=new AbortController();res.on('close',()=>{if(!res.writableEnded)controller.abort()});
      const request=new Request(url,{method:req.method,headers:req.headers as Record<string,string>,...(req.method!=='GET'&&req.method!=='HEAD'?{body:Buffer.concat(chunks)}:{}),signal:controller.signal});
      const haunting=url.pathname==='/api/haunt';if(haunting)generating=true;
      try{const response=await handleApi(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}finally{if(haunting)generating=false;}
      return;
    }
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
    const file=resolve(root,'.'+decodeURIComponent(url.pathname));
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return;}
    let data:Buffer;let extension=extname(file);
    try{data=await readFile(file)}catch{if(extension){res.writeHead(404).end();return;}data=await readFile(resolve(root,'index.html'));extension='.html';}
    res.writeHead(200,{'Content-Type':types[extension]||'application/octet-stream','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:data);
  }catch{if(!res.headersSent)res.writeHead(500);res.end('The diary could not be opened. Run npm run build first.');}
});
server.requestTimeout=130000;
server.listen(3001,'127.0.0.1',()=>console.log('Ghost Diary · http://127.0.0.1:3001'));
