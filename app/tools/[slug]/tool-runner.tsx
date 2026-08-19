"use client";

import { FormEvent, useState } from "react";
import { browserDb } from "@/lib/supabase";
import { ToolKey, tools } from "@/lib/tools";

async function asDataUrl(file:File){return await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file)})}

export default function ToolRunner({toolKey,tool}:{toolKey:ToolKey;tool:(typeof tools)[ToolKey]}){
  const [text,setText]=useState(""); const [files,setFiles]=useState<File[]>([]); const [enhance,setEnhance]=useState(false);
  const [loading,setLoading]=useState(false); const [error,setError]=useState(""); const [answer,setAnswer]=useState(""); const [downloads,setDownloads]=useState<string[]>([]);
  const total=tool.credits+(toolKey==="photos"&&enhance?files.length*3:0);
  async function run(e:FormEvent){
    e.preventDefault();setLoading(true);setError("");setAnswer("");setDownloads([]);
    try{
      const db=browserDb(); const {data:{session}}=await db.auth.getSession(); if(!session)throw new Error("Κάνε πρώτα σύνδεση.");
      const images=toolKey==="photos"?await Promise.all(files.map(asDataUrl)):[];
      const res=await fetch("/api/tools",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({tool:toolKey,text,images,enhance})});
      const data=await res.json(); if(!res.ok)throw new Error(data.error||"Κάτι δεν πήγε καλά."); setAnswer(data.answer);setDownloads(data.images||[]);
    }catch(e){setError(e instanceof Error?e.message:"Κάτι δεν πήγε καλά.")}finally{setLoading(false)}
  }
  return <form className="panel" onSubmit={run}>
    {toolKey==="photos"&&<><div className="field"><label>Φωτογραφίες καταλύματος</label><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>setFiles(Array.from(e.target.files||[]).slice(0,10))}/><small className="muted">Έως 10 φωτογραφίες ανά φορά.</small></div><label className="notice" style={{display:"flex",gap:10,alignItems:"center"}}><input type="checkbox" checked={enhance} onChange={e=>setEnhance(e.target.checked)}/> Βελτίωσε και φωτισμό/ευκρίνεια χωρίς να αλλάξεις τον χώρο (+3 credits ανά φωτογραφία)</label></>}
    <div className="field"><label>{toolKey==="photos"?"Προαιρετική σημείωση":"Τι θέλεις να ετοιμάσουμε;"}</label><textarea value={text} onChange={e=>setText(e.target.value)} placeholder={tool.placeholder} required={toolKey!=="photos"}/></div>
    <button className="button" disabled={loading||toolKey==="photos"&&!files.length}>{loading?"Το ετοιμάζουμε…":`Συνέχεια · ${total} ${total===1?"credit":"credits"}`}</button>
    {error&&<p className="notice">{error}</p>}{answer&&<div className="result">{answer}</div>}
    {downloads.length>0&&<div className="result"><b>Βελτιωμένες φωτογραφίες</b><div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:14}}>{downloads.map((src,i)=><a className="button secondary" href={src} download={`listcare-${i+1}.jpg`} key={i}>Λήψη {i+1}</a>)}</div></div>}
  </form>
}
