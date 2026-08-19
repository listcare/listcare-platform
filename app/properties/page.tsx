import Link from "next/link";
import { villaTheona } from "@/lib/tools";

export default function Properties(){return <main><p className="eyebrow">Τα καταλύματά μου</p><div className="hero-row"><h1>Ένα προφίλ για κάθε κατάλυμα.</h1><p>Δεν ξαναγράφεις παροχές, περιοχή και βασικές πληροφορίες κάθε φορά.</p></div><div className="panel property-bar"><div className="property-icon">⌂</div><div><small>ΚΥΡΙΟ ΚΑΤΑΛΥΜΑ</small><b>{villaTheona.name}</b><p className="muted">{villaTheona.location} · {villaTheona.capacity} επισκέπτες · {villaTheona.bedrooms} υπνοδωμάτια</p></div><Link className="button secondary" href="/onboarding">Επεξεργασία</Link></div></main>}
