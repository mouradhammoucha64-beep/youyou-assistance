import dns from 'node:dns/promises';
import net from 'node:net';
import http from 'node:http';
import https from 'node:https';

export function isPublicAddress(address) {
  if (net.isIPv4(address)) {
    const [a,b] = address.split('.').map(Number);
    return !(a===0 || a===10 || a===127 || a>=224 || (a===169&&b===254)
      || (a===172&&b>=16&&b<=31) || (a===192&&(b===168||b===0))
      || (a===100&&b>=64&&b<=127) || (a===198&&(b===18||b===19)));
  }
  // Only global-unicast IPv6; exclude mapped IPv4, local, multicast and tunnels.
  return net.isIPv6(address) && /^[23]/.test(address)
    && !/^200[12]:/i.test(address);
}

export async function resolvePublic(url, lookup = dns.lookup) {
  if (!['http:','https:'].includes(url.protocol) || url.username || url.password
    || (url.port && !['80','443'].includes(url.port))) throw new Error('Only public HTTP/HTTPS websites on standard ports are supported.');
  const hostname = url.hostname.replace(/^\[|\]$/g,'');
  let timer;
  let rows;
  try {
    rows = net.isIP(hostname) ? [{address:hostname,family:net.isIP(hostname)}]
      : await Promise.race([lookup(hostname,{all:true,verbatim:true}),
        new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('DNS lookup timed out.')),3000);})]);
  } finally { clearTimeout(timer); }
  if (!rows.length || rows.some(row=>!isPublicAddress(row.address))) throw new Error('Private/local network addresses cannot be audited.');
  return rows[0];
}

export function readPublicResponse(url, address, {maxBytes,timeoutMs,requestImpl} = {}) {
  return new Promise((resolve,reject)=>{
    const request = requestImpl || (url.protocol==='https:' ? https.request : http.request);
    let timer;
    const req = request(url, {
      method:'GET', agent:false,
      lookup: (_host,options,callback)=> options.all
        ? callback(null,[address]) : callback(null,address.address,address.family),
      headers:{'User-Agent':'YOUYOU-SEO-Audit/1.1','Accept':'text/html,application/xml,text/plain','Accept-Encoding':'identity'},
    }, response=>{
      response.on('error',error=>{clearTimeout(timer);reject(error);});
      if (Number(response.headers['content-length'] || 0)>maxBytes) {
        response.destroy(new Error('Page is too large for this audit.')); return;
      }
      if ([301,302,303,307,308].includes(response.statusCode)) {
        clearTimeout(timer); response.resume(); response.destroy();
        resolve({status:response.statusCode,headers:response.headers,body:''}); return;
      }
      const chunks=[]; let size=0;
      response.on('data',chunk=>{
        size+=chunk.length;
        if(size>maxBytes) { response.destroy(new Error('Page is too large for this audit.')); return; }
        chunks.push(chunk);
      });
      response.on('end',()=>{clearTimeout(timer);resolve({status:response.statusCode,headers:response.headers,body:Buffer.concat(chunks).toString('utf8')});});
      response.on('close',()=>clearTimeout(timer));
    });
    req.on('error',error=>{clearTimeout(timer);reject(error);});
    timer=setTimeout(()=>req.destroy(new Error('The website took too long to respond.')),timeoutMs);
    req.end();
  });
}

export async function fetchPublicUrl(initialUrl,{maxBytes=2_000_000,timeoutMs=9000,lookup,read=readPublicResponse}={}) {
  let url=new URL(initialUrl);
  for(let hop=0;hop<=3;hop++) {
    const address=await resolvePublic(url,lookup);
    const result=await read(url,address,{maxBytes,timeoutMs});
    if([301,302,303,307,308].includes(result.status)) {
      if(!result.headers.location) throw new Error('Redirect destination is missing.');
      url=new URL(result.headers.location,url);continue;
    }
    return {response:{status:result.status,ok:result.status>=200&&result.status<300,headers:new Headers(result.headers)},
      body:result.body,finalUrl:url.toString(),contentType:result.headers['content-type'] || ''};
  }
  throw new Error('Too many redirects.');
}
