import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};

async function tts(text) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not configured');
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method:'POST', headers:{'Authorization':`Bearer ${process.env.OPENROUTER_API_KEY}`,'Content-Type':'application/json','HTTP-Referer':'https://englishland.muveeai.com','X-Title':'Englishland'},
    body:JSON.stringify({model:'openai/gpt-audio-mini',modalities:['text','audio'],audio:{voice:'alloy',format:'wav'},stream:true,messages:[{role:'user',content:`Read this sentence clearly and warmly for a five-year-old English learner. Say only the sentence: ${text}`}]}),
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(`OpenRouter returned ${response.status}: ${raw.slice(0,300)}`);
  const chunks=[];
  for(const line of raw.split(/\r?\n/)){
    if(!line.startsWith('data:')||line.includes('[DONE]')) continue;
    try{const item=JSON.parse(line.slice(5).trim());const audio=item?.choices?.[0]?.delta?.audio?.data||item?.choices?.[0]?.message?.audio?.data;if(audio)chunks.push(Buffer.from(audio,'base64'))}catch{}
  }
  if(!chunks.length) throw new Error('OpenRouter response did not contain audio');
  return Buffer.concat(chunks);
}

createServer(async (req,res)=>{
  try {
    if(req.url==='/health'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('ok\n')}
    if(req.method==='POST'&&req.url==='/api/tts'){
      let body='';for await(const chunk of req) body+=chunk;
      const text=JSON.parse(body).text?.trim();if(!text||text.length>300){res.writeHead(400);return res.end('invalid text')}
      const audio=await tts(text);res.writeHead(200,{'Content-Type':'audio/wav','Cache-Control':'public, max-age=86400'});return res.end(audio)
    }
    const pathname=decodeURIComponent((req.url||'/').split('?')[0]);const safe=normalize(pathname).replace(/^\.\.[/\\]/,'');let file=join(root,safe==='/'?'/index.html':safe);let content;
    try{content=await readFile(file)}catch{content=await readFile(join(root,'index.html'));file=join(root,'index.html')}
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(content)
  }catch(error){res.writeHead(502,{'Content-Type':'application/json'});res.end(JSON.stringify({error:error.message}))}
}).listen(8080,'0.0.0.0',()=>console.log('Englishland listening on 8080'));
