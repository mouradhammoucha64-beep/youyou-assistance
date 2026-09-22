import dns from 'node:dns/promises';
import net from 'node:net';
import http from 'node:http';
import https from 'node:https';
export function publicAddress(ip) {
  if (net.isIPv4(ip)) {
    const [a,b,c] = ip.split('.').map(Number);
    return !(a===0 || a===10 || a===127 || a>=224 || (a===100 && b>=64 && b<=127) || (a===169 && b===254) || (a===172 && b>=16 && b<=31) || (a===192 && (b===168 || b===0 || (b===88 && c===99))) || (a===198 && (b===18 || b===19 || (b===51 && c===100))) || (a===203 && b===0 && c===113));
  }
  // Only global unicast IPv6; exclude documentation, transition and mapped ranges.
  return net.isIPv6(ip) && /^[23]/i.test(ip) && !/^2001:(?:0:|db8:|2:|10:|20:)/i.test(ip) && !/^2002:/i.test(ip);
}
export function normalizeUrl(value='') {
  let raw = String(value).trim();
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  const url = new URL(raw);
  if (!['http:','https:'].includes(url.protocol) || url.username || url.password || (url.port && !['80','443'].includes(url.port))) throw new Error('Use a public HTTP or HTTPS website without credentials or custom ports.');
  return url;
}
export async function fetchPublicUrl(value,{maxBytes=2000000}={}) {
  let url=normalizeUrl(value);
  const deadline = Date.now() + 12000;
  for(let hop=0;hop<4;hop++) {
    if (Date.now() >= deadline) throw new Error('The website took too long to respond.');
    const host=url.hostname.replace(/^\[|\]$/g,'');
    let dnsTimer;
    const addresses=net.isIP(host) ? [{address:host,family:net.isIP(host)}] : await Promise.race([
      dns.lookup(host,{all:true,verbatim:true}),
      new Promise((_,reject)=>{dnsTimer=setTimeout(()=>reject(new Error('Website DNS lookup timed out.')),Math.min(3000,Math.max(1,deadline-Date.now())));}),
    ]).finally(()=>clearTimeout(dnsTimer));
    if (!addresses.length || addresses.some(a=>!publicAddress(a.address))) throw new Error('Private or reserved network addresses cannot be audited.');
    // Pin the checked address, preventing a second DNS resolution / rebinding.
    const address=addresses[0];
    const result=await new Promise((resolve,reject)=>{
      const transport=url.protocol==='https:'?https:http;
      let timer;
      const request=transport.request(url,{method:'GET',lookup:(_h,opts,cb)=>opts.all?cb(null,[address]):cb(null,address.address,address.family),headers:{'User-Agent':'YOUYOU-SEO-Audit/2.0','Accept':'text/html,application/xml,text/plain','Accept-Encoding':'identity'}},response=>{
        const status=response.statusCode || 0;
        if ([301,302,303,307,308].includes(status)) {const redirect=response.headers.location;response.destroy();clearTimeout(timer);resolve({redirect});return;}
        const chunks=[];let size=0;
        response.on('data',chunk=>{size+=chunk.length;if(size>maxBytes)request.destroy(new Error('Page is too large for this audit.'));else chunks.push(chunk);});
        response.on('error',error=>{clearTimeout(timer);reject(error);});
        response.on('end',()=>{clearTimeout(timer);resolve({response:{status,ok:status>=200&&status<300,headers:new Headers(Object.entries(response.headers).filter(([,v])=>v!==undefined).map(([k,v])=>[k,String(v)]))},body:Buffer.concat(chunks).toString('utf8'),contentType:String(response.headers['content-type']||''),finalUrl:url.href});});
      });
      timer=setTimeout(()=>request.destroy(new Error('The website took too long to respond.')),Math.min(9000,Math.max(1,deadline-Date.now())));
      request.on('error',error=>{clearTimeout(timer);reject(error);});request.end();
    });
    if ('redirect' in result) {if(!result.redirect)throw new Error('Redirect destination is missing.');url=normalizeUrl(new URL(result.redirect,url).href);continue;}
    return result;
  }
  throw new Error('Too many redirects.');
}
