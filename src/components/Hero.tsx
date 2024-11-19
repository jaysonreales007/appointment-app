interface HeroProps {
  onAppointmentClick: () => void;
}

export function Hero({ onAppointmentClick }: HeroProps) {
  return (
    <div className="bg-gradient-to-b from-law-primary to-law-secondary text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Professional Legal Consultation Made Simple
          </h1>
          <p className="text-xl mb-8 text-law-neutral">
            Schedule your appointment with our experienced attorneys today
          </p>
          <button 
            onClick={onAppointmentClick}
            className="bg-amber-600 hover:bg-opacity-90 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
          >
            Book an Appointment
          </button>
        </div>
      </div>
    </div>
  );
} 