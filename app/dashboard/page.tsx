import Link from "next/link";
import { tools, villaTheona } from "@/lib/tools";

export default function Dashboard() {
  return <main>
    <div className="hero-row">
      <div><p className="eyebrow">Η εργαλειοθήκη σου</p><h1>Τι θέλεις να ετοιμάσουμε;</h1></div>
      <p>Διάλεξε εργαλείο. Τα στοιχεία του καταλύματος είναι ήδη αποθηκευμένα και χρησιμοποιούνται αυτόματα.</p>
    </div>
    <div className="property-bar">
      <div className="property-icon">⌂</div>
      <div><small>ΤΟ ΚΑΤΑΛΥΜΑ ΜΟΥ</small><b>{villaTheona.name} · {villaTheona.location}</b></div>
      <Link href="/properties">Αλλαγή καταλύματος</Link>
    </div>
    <section className="tool-grid">
      {(Object.entries(tools) as [string, (typeof tools)[keyof typeof tools]][]).map(([key, tool], index)=><Link key={key} className={`tool-card ${index===0?"featured":""}`} href={`/tools/${key}`}>
        <small>0{index+1} · {tool.eyebrow}</small>
        <h2>{tool.title}</h2><p>{tool.description}</p>
        <div className="tool-footer"><span>{tool.credits} {tool.credits===1?"credit":"credits"}</span><span>Άνοιγμα →</span></div>
      </Link>)}
    </section>
  </main>;
}
