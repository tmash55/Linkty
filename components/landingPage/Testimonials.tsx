export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-center mb-12 text-foreground">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <TestimonialCard
            quote="LinkBeacon has revolutionized our marketing campaigns. The insights we've gained are invaluable."
            author="Jane Doe"
            role="Marketing Director"
          />
          <TestimonialCard
            quote="I've tried many link shorteners, but LinkBeacon's analytics are unmatched. It's a game-changer."
            author="John Smith"
            role="Content Creator"
          />
          <TestimonialCard
            quote="The ease of use and powerful features make LinkBeacon my go-to tool for all my link needs."
            author="Emily Johnson"
            role="Social Media Manager"
          />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
}: {
  quote: string;
  author: string;
  role: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-muted">
      <p className="text-lg mb-4 text-foreground">&quot;{quote}&quot;</p>
      <div>
        <p className="font-medium text-foreground">{author}</p>
        <p className="text-muted-foreground text-sm">{role}</p>
      </div>
    </div>
  );
}
