export default { async fetch(request, env) {
 const headers = {"Access-Control-Allow-Origin":"https://bjjconnectionsbygabe.com","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST, OPTIONS"};
 if(request.headers.get("Origin")!=="https://bjjconnectionsbygabe.com") return new Response("Forbidden",{status:403});
 if(request.method==="OPTIONS") return new Response(null,{status:204,headers});
 if(request.method!=="POST") return new Response("Method not allowed",{status:405,headers});
 let body; try {body=await request.json()}catch{return Response.json({error:"Invalid request"},{status:400,headers})}
 const question=body?.question;
 if(typeof question!=="string" || !question.trim() || question.length>1000) return Response.json({error:"Question must be 1-1000 characters"},{status:400,headers});
 try {
 const result=await env.AI.run("@cf/meta/llama-3.1-8b-instruct",{messages:[{role:"system",content:"You are BJJ Connections AI. Explain Brazilian Jiu-Jitsu terminology, sports history, competition scoring and general concepts in a clear, age-appropriate way. Do not invent site references or current rules. Encourage checking official event rules and learning with a qualified coach. Do not give medical advice."},{role:"user",content:question}],max_tokens:350});
 return Response.json({reply:result.response||"Please try another question."},{headers});
 } catch {return Response.json({error:"AI temporarily unavailable"},{status:503,headers})}
}};