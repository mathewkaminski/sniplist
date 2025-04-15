
import { Header } from "@/components/Header";
import { ContactForm } from "@/components/ContactForm";

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-purple-700">Contact Us</h1>
          <ContactForm />
        </div>
      </main>
    </div>
  );
};

export default ContactUs;
