"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { browserDb } from "@/lib/supabase";
import { villaTheona } from "@/lib/tools";

export default function Onboarding() {
  const router=useRouter(); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  const [form,setForm]=useState({...villaTheona,amenities:villaTheona.amenities.join(", ")});
  const update=(key:string,value:string|number)=>setForm(prev=>({...prev,[key]:value}));
  async function save(e:FormEvent){
    e.preventDefault(); setLoading(true); setError(""); const db=browserDb();
    const {data:{user}}=await db.auth.getUser(); if(!user){setError("Κάνε πρώτα εγγραφή ή σύνδεση.");setLoading(false);return;}
    const {error}=await db.from("properties").insert({
      user_id:user.id,name:form.name,property_type:form.property_type,location:form.location,
      capacity:Number(form.capacity),bedrooms:Number(form.bedrooms),bathrooms:Number(form.bathrooms),size_sqm:Number(form.size_sqm),
      amenities:String(form.amenities).split(",").map(x=>x.trim()).filter(Boolean),booking_url:form.booking_url,website_url:form.website_url,
      description:form.description,is_primary:true
    });
    if(error)setError(error.message);else router.push("/dashboard"); setLoading(false);
  }
  return <main>
    <p className="eyebrow">Μία φορά και τελείωσε</p><div className="hero-row"><h1>Πες μας για το κατάλυμά σου.</h1><p>Θα θυμόμαστε αυτά τα στοιχεία σε κάθε εργαλείο. Μπορείς να τα αλλάξεις όποτε θέλεις.</p></div>
    <div className="steps"><div className="step"><b>1. Βασικά στοιχεία</b><span className="muted">Όνομα, περιοχή και τύπος</span></div><div className="step"><b>2. Χώροι & παροχές</b><span className="muted">Για πιο σωστές προτάσεις</span></div><div className="step"><b>3. Σύνδεσμοι</b><span className="muted">Ιστοσελίδα ή OTA</span></div></div>
    <form className="panel" onSubmit={save}>
      <div className="form-grid"><div className="field"><label>Όνομα καταλύματος</label><input value={form.name} onChange={e=>update("name",e.target.value)} required /></div><div className="field"><label>Περιοχή</label><input value={form.location} onChange={e=>update("location",e.target.value)} required /></div></div>
      <div className="form-grid"><div className="field"><label>Τύπος</label><input value={form.property_type} onChange={e=>update("property_type",e.target.value)} /></div><div className="field"><label>Μέγιστοι επισκέπτες</label><input type="number" value={form.capacity} onChange={e=>update("capacity",e.target.value)} /></div></div>
      <div className="form-grid"><div className="field"><label>Υπνοδωμάτια</label><input type="number" value={form.bedrooms} onChange={e=>update("bedrooms",e.target.value)} /></div><div className="field"><label>Μπάνια</label><input type="number" value={form.bathrooms} onChange={e=>update("bathrooms",e.target.value)} /></div></div>
      <div className="field"><label>Βασικές παροχές, χωρισμένες με κόμμα</label><input value={form.amenities} onChange={e=>update("amenities",e.target.value)} /></div>
      <div className="form-grid"><div className="field"><label>Booking ή Airbnb link</label><input type="url" value={form.booking_url} onChange={e=>update("booking_url",e.target.value)} /></div><div className="field"><label>Ιστοσελίδα</label><input type="url" value={form.website_url} onChange={e=>update("website_url",e.target.value)} /></div></div>
      <div className="field"><label>Μία σύντομη περιγραφή</label><textarea value={form.description} onChange={e=>update("description",e.target.value)} /></div>
      <button className="button" disabled={loading}>{loading?"Αποθήκευση…":"Αποθήκευση και συνέχεια"}</button>{error&&<p className="notice">{error}</p>}
    </form>
  </main>;
}
