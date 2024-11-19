const services = [
  {
    title: "Corporate Law",
    description: "Expert guidance for businesses of all sizes",
    icon: "💼"
  },
  {
    title: "Family Law",
    description: "Compassionate support for family matters",
    icon: "👨‍👩‍👧‍👦"
  },
  {
    title: "Civil Litigation",
    description: "Strong representation in civil cases",
    icon: "⚖️"
  }
] as const;

export function Services() {
  return (
    <section id="services" className="py-10 px-16">
      <h2 className="text-3xl font-bold text-law-primary text-center mb-12">Our Legal Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">{service.icon}</div>
            <h3 className="text-xl font-semibold text-law-primary mb-2">{service.title}</h3>
            <p className="text-gray-600">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
} 