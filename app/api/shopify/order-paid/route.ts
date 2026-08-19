import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase";

export const runtime="nodejs";

function validSignature(raw:string,received:string|null){
  if(!received||!process.env.SHOPIFY_WEBHOOK_SECRET)return false;
  const expected=createHmac("sha256",process.env.SHOPIFY_WEBHOOK_SECRET).update(raw,"utf8").digest("base64");
  const a=Buffer.from(expected);const b=Buffer.from(received);return a.length===b.length&&timingSafeEqual(a,b);
}

export async function POST(req:NextRequest){
  const raw=await req.text();
  if(!validSignature(raw,req.headers.get("x-shopify-hmac-sha256")))return NextResponse.json({error:"invalid signature"},{status:401});
  const order=JSON.parse(raw);const orderId=String(order.id);const email=String(order.email||order.customer?.email||"").toLowerCase();
  if(!email)return NextResponse.json({ok:true,ignored:"missing email"});
  const mapping:Record<string,number>=JSON.parse(process.env.SHOPIFY_CREDIT_VARIANTS||"{}");
  const credits=(order.line_items||[]).reduce((sum:number,item:any)=>sum+(mapping[String(item.variant_id)]||0)*Number(item.quantity||1),0);
  if(!credits)return NextResponse.json({ok:true,ignored:"no credit products"});
  const db=adminDb();
  const {data:profile}=await db.from("profiles").select("id").eq("email",email).maybeSingle();
  if(!profile)return NextResponse.json({error:"ListCare account not found"},{status:409});
  const {error}=await db.rpc("process_credit_order",{p_order_id:orderId,p_user_id:profile.id,p_amount:credits});if(error)throw error;
  return NextResponse.json({ok:true,credits});
}
