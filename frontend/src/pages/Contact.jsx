import { useState } from "react";

const CONTACT_EMAIL = "dominickarenge254@gmail.com";
const CONTACT_PHONE = "0712345678";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const subject = encodeURIComponent(
      form.subject.trim() || "General enquiry",
    );

    const body = encodeURIComponent(
      `Name: ${form.name}\n` +
        `Email: ${form.email}\n\n` +
        `Message:\n${form.message}`,
    );

    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    window.location.href = mailtoUrl;
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-300">
            We're Here to Help
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Let's start a
            <span className="block text-blue-300">conversation.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100/90">
            Have a question about a product, your order, or shopping with Kado?
            Reach out using the contact details below or prepare a message using
            our enquiry form.
          </p>
        </div>
      </section>

      {/* Contact content */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Contact information */}
          <div className="lg:col-span-2">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Contact Information
            </p>

            <h2 className="mt-3 text-3xl font-extrabold">
              We'd love to hear from you.
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Whether you need help finding a product or have a question about
              an order, choose the contact method that works best for you.
            </p>

            <div className="mt-8 space-y-4">
              {/* Email card */}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  ✉
                </span>

                <span className="min-w-0">
                  <span className="block font-bold text-slate-900">
                    Email Us
                  </span>

                  <span className="mt-1 block break-all text-sm text-slate-600 group-hover:text-blue-700">
                    {CONTACT_EMAIL}
                  </span>

                  <span className="mt-2 block text-xs font-semibold text-blue-700">
                    Send us an email →
                  </span>
                </span>
              </a>

              {/* Phone card */}
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  ☎
                </span>

                <span className="min-w-0">
                  <span className="block font-bold text-slate-900">
                    Call Us
                  </span>

                  <span className="mt-1 block text-sm text-slate-600 group-hover:text-blue-700">
                    {CONTACT_PHONE}
                  </span>

                  <span className="mt-2 block text-xs font-semibold text-blue-700">
                    Tap to call →
                  </span>
                </span>
              </a>
            </div>

            <div className="mt-8 rounded-2xl bg-blue-950 p-6 text-white">
              <p className="text-lg font-bold">Every question matters.</p>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Tell us what you need, and we'll use your feedback to help
                improve your Kado experience.
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9 lg:col-span-3">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Send an Enquiry
            </p>

            <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
              How can we help?
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Fill in the details below. Your default email application will
              open with your message ready to send.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Your Name
                  </label>

                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    maxLength={254}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject
                </label>

                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  placeholder="What is your enquiry about?"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Your Message
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={handleChange}
                  required
                  maxLength={5000}
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 sm:w-auto"
              >
                Prepare Email <span aria-hidden="true">→</span>
              </button>

              <p className="text-xs leading-5 text-slate-500">
                This form opens your email application. Your message is not
                stored or sent by the website itself.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Bottom call to action */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <h2 className="text-xl font-extrabold">Still exploring Kado?</h2>
            <p className="mt-1 text-sm text-slate-600">
              Discover products and find something that suits you.
            </p>
          </div>

          <a
            href="/products"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Browse Products →
          </a>
        </div>
      </section>
    </main>
  );
};

export default Contact;
