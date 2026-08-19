"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { browserDb } from "@/lib/supabase";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setMessage("");
    const db = browserDb();
    if (mode === "register") {
      const { error } = await db.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) setMessage(error.message);
      else { setMessage("Ο λογαριασμός δημιουργήθηκε. Έλεγξε το email σου αν ζητηθεί επιβεβαίωση."); router.push("/onboarding"); }
    } else {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) setMessage("Δεν ήταν σωστό το email ή ο κωδικός.");
      else router.push("/dashboard");
    }
    setLoading(false);
  }

  return <div className="auth-shell">
    <section className="auth-copy">
      <p className="eyebrow" style={{color:"#f0b47b"}}>Καλώς ήρθες στο ListCare</p>
      <h1>Το κατάλυμά σου, έτοιμο για όλα.</h1>
      <p>Αποθηκεύεις μία φορά τα στοιχεία του και χρησιμοποιείς απλά εργαλεία χωρίς να ξαναγράφεις τα ίδια.</p>
    </section>
    <form className="auth-form" onSubmit={submit}>
      <div className="auth-tabs">
        <button type="button" onClick={()=>setMode("register")}>Νέος λογαριασμός</button>
        <button type="button" onClick={()=>setMode("login")}>Έχω λογαριασμό</button>
      </div>
      {mode === "register" && <div className="field"><label>Το όνομά σου</label><input value={name} onChange={e=>setName(e.target.value)} required /></div>}
      <div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
      <div className="field"><label>Κωδικός</label><input type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required /></div>
      <button className="button" disabled={loading}>{loading ? "Μισό λεπτό…" : mode === "register" ? "Δημιουργία λογαριασμού" : "Σύνδεση"}</button>
      {message && <p className="notice">{message}</p>}
    </form>
  </div>;
}
