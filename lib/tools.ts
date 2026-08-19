export type ToolKey = "listing" | "photos" | "money" | "reviews";

export const tools: Record<ToolKey, {
  title: string;
  eyebrow: string;
  description: string;
  credits: number;
  placeholder: string;
}> = {
  listing: {
    title: "Βελτίωσε την καταχώρησή σου",
    eyebrow: "Τίτλος, περιγραφή και έλεγχος",
    description: "Βάλε το link ή το κείμενο της καταχώρησης και πάρε συγκεκριμένες διορθώσεις, νέους τίτλους και έτοιμη περιγραφή.",
    credits: 2,
    placeholder: "Κάνε επικόλληση το link της Booking/Airbnb ή την υπάρχουσα περιγραφή…"
  },
  photos: {
    title: "Βάλε τις φωτογραφίες στη σωστή σειρά",
    eyebrow: "Σειρά και βελτίωση φωτογραφιών",
    description: "Ανέβασε τις φωτογραφίες και το ListCare προτείνει ποια πρέπει να μπει πρώτη και ποια ακολουθεί.",
    credits: 2,
    placeholder: "Πρόσθεσε μία σύντομη σημείωση, αν χρειάζεται…"
  },
  money: {
    title: "Δες τι σου μένει πραγματικά",
    eyebrow: "Τιμές, έξοδα και καθαρό κέρδος",
    description: "Υπολόγισε τι μένει μετά από προμήθεια, καθαρισμό, διαχείριση, φόρους και υπόλοιπα έξοδα.",
    credits: 2,
    placeholder: "Παράδειγμα: 5 βράδια × 220€, Booking 15%, καθαρισμός 60€, manager 20%…"
  },
  reviews: {
    title: "Κατάλαβε τις κριτικές και απάντησε σωστά",
    eyebrow: "Ανάλυση και έτοιμες απαντήσεις",
    description: "Βάλε μία ή περισσότερες κριτικές και πάρε καθαρή εικόνα των θεμάτων και απαντήσεις στον σωστό τόνο.",
    credits: 1,
    placeholder: "Κάνε επικόλληση εδώ τις κριτικές…"
  }
};

export const villaTheona = {
  name: "Villa Theona",
  property_type: "Ιδιωτική βίλα",
  location: "Πιτσίδια, Κρήτη",
  capacity: 4,
  bedrooms: 2,
  bathrooms: 2,
  size_sqm: 95,
  amenities: ["Ιδιωτική πισίνα", "Κήπος", "BBQ", "Wi-Fi", "Κλιματισμός", "Πάρκινγκ"],
  booking_url: "https://www.booking.com/hotel/gr/villa-theona-with-private-pool.el.html",
  website_url: "https://www.villatheona.com/",
  description: "Ιδιωτική βίλα για έως 4 επισκέπτες με δύο υπνοδωμάτια, δύο μπάνια, πλήρως εξοπλισμένη κουζίνα, ιδιωτική πισίνα και κήπο."
};
