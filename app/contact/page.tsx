import ContactForm from '../components/ContactForm';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Contactez JBF SPORT
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Notre équipe d&apos;experts est à votre disposition pour vous accompagner dans tous vos projets d&apos;équipements sportifs.
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
} 