import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import sharp from "sharp";
import { z } from "zod";
import { adminDb, userFromToken } from "@/lib/supabase";
import { tools, ToolKey } from "@/lib/tools";

export const runtime="nodejs";
const inputSchema=z.object({tool:z.enum(["listing","photos","money","reviews"]),text:z.string().max(30000).default(""),images:z.array(z.string()).max(10).default([]),enhance:z.boolean().default(false)});
const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});

const instructions:Record<ToolKey,string>={
  listing:"Είσαι ειδικός στις καταχωρήσεις τουριστικών καταλυμάτων. Απάντησε στα ελληνικά, απλά και συγκεκριμένα. Δώσε: σύντομο έλεγχο, 5 τίτλους, μία σύντομη και μία πλήρη περιγραφή, και συγκεκριμένες διορθώσεις. Μην εφευρίσκεις παροχές.",
  photos:"Είσαι ειδικός στη σειρά φωτογραφιών καταλυμάτων. Αρίθμησε τις φωτογραφίες με τη σειρά που δόθηκαν και πρότεινε ιδανική νέα σειρά. Εξήγησε σε μία πρόταση γιατί κάθε φωτογραφία βρίσκεται εκεί. Μην ισχυρίζεσαι ότι υπάρχει κάτι που δεν φαίνεται.",
  money:"Είσαι οικονομικός βοηθός για ελληνικά τουριστικά καταλύματα. Κάνε καθαρούς υπολογισμούς βήμα-βήμα, ξεχώρισε έσοδο, προμήθειες, λειτουργικά έξοδα, φόρους/τέλη που δόθηκαν και καθαρό αποτέλεσμα. Αν λείπει κρίσιμο στοιχείο, δήλωσέ το. Οι προτάσεις δεν αντικαθιστούν λογιστή.",
  reviews:"Είσαι βοηθός εξυπηρέτησης καταλυμάτων. Βρες επαναλαμβανόμενα θετικά και αρνητικά θέματα, προτεραιότητες βελτίωσης και γράψε φυσική, σύντομη απάντηση για κάθε κριτική στη γλώσσα της. Χωρίς υπερβολές ή έτοιμες εταιρικές φράσεις."
};

function stripDataUrl(value:string){const [meta,data]=value.split(",",2);if(!meta?.startsWith("data:image/")||!data)throw new Error("Μη αποδεκτή φωτογραφία.");return Buffer.from(data,"base64")}

export async function POST(req:NextRequest){
  try{
    const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");if(!token)throw new Error("Χρειάζεται σύνδεση.");
    const user=await userFromToken(token);const input=inputSchema.parse(await req.json());const db=adminDb();
    const {data:profile}=await db.from("profiles").select("credits").eq("id",user.id).single();
    const cost=tools[input.tool].credits+(input.tool==="photos"&&input.enhance?input.images.length*3:0);
    if(!profile||profile.credits<cost)return NextResponse.json({error:"Δεν υπάρχουν αρκετά credits."},{status:402});
    const {data:property}=await db.from("properties").select("*").eq("user_id",user.id).order("is_primary",{ascending:false}).limit(1).maybeSingle();
    const context=`ΣΤΟΙΧΕΙΑ ΚΑΤΑΛΥΜΑΤΟΣ:\n${JSON.stringify(property||{},null,2)}\n\nΑΙΤΗΜΑ ΧΡΗΣΤΗ:\n${input.text}`;
    const content:any[]=[{type:"input_text",text:context}];
    if(input.tool==="photos")input.images.forEach(image_url=>content.push({type:"input_image",image_url,detail:"high"}));
    const response=await openai.responses.create({model:input.tool==="money"?"gpt-5.6-terra":"gpt-5.6-luna",instructions:instructions[input.tool],input:[{role:"user",content}],tools:input.tool==="money"?[{type:"web_search" as const}]:undefined});
    const enhanced:string[]=[];
    if(input.tool==="photos"&&input.enhance){for(const raw of input.images){const output=await sharp(stripDataUrl(raw)).rotate().modulate({brightness:1.04,saturation:1.03}).sharpen({sigma:.8}).jpeg({quality:91}).toBuffer();enhanced.push(`data:image/jpeg;base64,${output.toString("base64")}`)}}
    const runId=crypto.randomUUID();const {error:spendError}=await db.rpc("spend_credits",{p_user_id:user.id,p_amount:cost,p_reason:tools[input.tool].title,p_reference:runId});if(spendError)throw spendError;
    await db.from("tool_runs").insert({id:runId,user_id:user.id,property_id:property?.id||null,tool:input.tool,credits:cost,input:{text:input.text,image_count:input.images.length,enhance:input.enhance},output:{answer:response.output_text}});
    return NextResponse.json({answer:response.output_text,images:enhanced,cost});
  }catch(error){const message=error instanceof Error?error.message:"Κάτι δεν πήγε καλά.";return NextResponse.json({error:message},{status:400})}
}
