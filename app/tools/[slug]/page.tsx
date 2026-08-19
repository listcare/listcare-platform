import { notFound } from "next/navigation";
import ToolRunner from "./tool-runner";
import { tools, ToolKey, villaTheona } from "@/lib/tools";

export default async function ToolPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; if(!(slug in tools))notFound(); const tool=tools[slug as ToolKey];
  return <main><p className="eyebrow">{tool.eyebrow}</p><div className="hero-row"><h1>{tool.title}</h1><p>{tool.description}</p></div><div className="property-bar"><div className="property-icon">⌂</div><div><small>ΧΡΗΣΙΜΟΠΟΙΟΥΜΕ ΤΑ ΣΤΟΙΧΕΙΑ ΤΟΥ</small><b>{villaTheona.name} · {villaTheona.location}</b></div></div><ToolRunner toolKey={slug as ToolKey} tool={tool}/></main>
}
