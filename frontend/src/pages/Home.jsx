import { useState } from "react";
import { Link } from "react-router-dom";

const CONTACT_EMAIL = "dominickarenge254@gmail.com";
const CONTACT_PHONE = "0712345678";

const Home = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const subject = encodeURIComponent(form.subject || "Kado Customer Enquiry");

    const body = encodeURIComponent(
      `Name: ${form.name}\n` +
        `Email: ${form.email}\n\n` +
        `Message:\n${form.message}`,
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const features = [
    {
      icon: "✦",
      title: "Quality Products",
      description:
        "Discover products selected to make shopping more enjoyable.",
    },
    {
      icon: "↗",
      title: "Great Prices",
      description:
        "Explore our collection and find products that suit your needs.",
    },
    {
      icon: "♡",
      title: "Easy Shopping",
      description:
        "Browse products, add items to your cart, and proceed to checkout.",
    },
  ];

  return (
    <main className="bg-white text-slate-900">
      {/* ================= HOME ================= */}
      <section
        id="home"
        className="scroll-mt-24 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 text-center sm:py-28">
          <p className="mb-5 font-semibold uppercase tracking-[0.2em] text-blue-300">
            Welcome to Kado
          </p>

          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-6xl">
            Find What You Love.
            <span className="block text-blue-300">Enjoy the Journey.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
            Discover great products, explore new favourites, and enjoy a simpler
            way to shop online with Kado.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="rounded-xl bg-white px-7 py-3.5 font-bold text-blue-950
            transition hover:bg-blue-100"
            >
              Shop Now →
            </Link>
            <a
              href="#about"
              className="rounded-xl border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Discover Kado
            </a>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="text-center">
          <p className="font-semibold uppercase tracking-widest text-blue-600">
            The Kado Experience
          </p>

          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Why Shop With Us?
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 p-7 text-center transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-3xl text-blue-700">
                {feature.icon}
              </div>

              <h3 className="mt-5 text-xl font-bold">{feature.title}</h3>

              <p className="mt-3 leading-7 text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ================= SHOPPING CALLOUT ================= */}
      <section id="shop" className="scroll-mt-24 bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 px-7 py-14 text-center shadow-xl sm:px-14 sm:py-20">
            {/* Decorative background elements */}
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="relative mx-auto max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-200">
                Your Next Favourite Is Waiting
              </p>

              <h2 className="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-5xl">
                Good Finds.
                <span className="block text-cyan-200">
                  Great Choices. That's Kado.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
                From everyday essentials to products worth discovering, your
                next great find could be just a click away. Explore our
                collection and find something made for you.
              </p>

              <Link
                to="/products"
                className="mt-9 inline-flex items-center justify-center gap-3 rounded-xl bg-white px-8 py-4 font-bold text-blue-950 shadow-lg transition hover:-translate-y-1 hover:bg-cyan-100"
              >
                Explore All Products
                <span aria-hidden="true">→</span>
              </Link>

              <p className="mt-5 text-sm text-blue-200">
                Browse the collection. Find your favourite. Shop with Kado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="scroll-mt-24 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="font-semibold uppercase tracking-widest text-blue-600">
              About Kado
            </p>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              A Better Way to Discover What You Need.
            </h2>
            <div className="mt-6 space-y-5 leading-8 text-slate-600">
              <p>
                Kado is built around a simple idea: online shopping should be
                easy to understand, convenient, and enjoyable. Finding something
                you need should not feel complicated.
              </p>

              <p>
                Our store brings product discovery, a convenient shopping cart,
                and an organized checkout experience together in one place.
              </p>

              <p>
                As Kado grows, we aim to keep improving the shopping experience
                by making it easier for customers to browse products and manage
                their purchases.
              </p>
            </div>

            <Link
              to="/products"
              className="mt-7 inline-flex font-bold text-blue-700
            hover:text-blue-900"
            >
              Shop Now →
            </Link>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-slate-950 p-8 text-white sm:p-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl">
              ✦
            </div>

            <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-blue-200">
              The Kado Promise
            </p>

            <h3 className="mt-4 text-3xl font-extrabold leading-snug sm:text-4xl">
              Less Hassle.
              <br />
              More Discovery.
            </h3>

            <p className="mt-5 leading-7 text-blue-100">
              A thoughtfully designed shopping experience focused on product
              discovery, convenience, and customer needs.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="scroll-mt-24 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-semibold uppercase tracking-widest text-blue-600">
              Contact Us
            </p>

            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Let's Start a Conversation.
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Have a question about a product or your order? Get in touch with
              Kado using the details below.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-5">
            {/* Contact Details */}
            <div className="space-y-5 lg:col-span-2">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="block rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
              >
                <span className="text-2xl">✉</span>

                <h3 className="mt-3 font-bold">Email Us</h3>

                <p className="mt-2 break-all text-sm text-slate-600">
                  {CONTACT_EMAIL}
                </p>
              </a>

              <a
                href={`tel:${CONTACT_PHONE}`}
                className="block rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
              >
                <span className="text-2xl">☎</span>

                <h3 className="mt-3 font-bold">Call Us</h3>

                <p className="mt-2 text-sm text-slate-600">{CONTACT_PHONE}</p>
              </a>
            </div>

            {/* Enquiry Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-3">
              <h3 className="text-2xl font-extrabold">Send an Enquiry</h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Fill out the form to prepare an email to our team.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="kado-name"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Your Name
                    </label>

                    <input
                      id="kado-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      autoComplete="name"
                      maxLength={100}
                      required
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="kado-email"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Email Address
                    </label>

                    <input
                      id="kado-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      maxLength={254}
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="kado-subject"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Subject
                  </label>

                  <input
                    id="kado-subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={handleChange}
                    maxLength={150}
                    required
                    placeholder="What is your enquiry about?"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="kado-message"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Your Message
                  </label>

                  <textarea
                    id="kado-message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    maxLength={5000}
                    required
                    placeholder="Write your message here..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
                >
                  Prepare Email →
                </button>

                <p className="text-xs leading-5 text-slate-500">
                  This form opens your default email application. The website
                  does not directly send or store messages.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <a href="#home" className="text-2xl font-extrabold">
              Kado.
            </a>

            <p className="mt-2 text-sm text-slate-400">
              Find what you love. Enjoy the journey.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-slate-300">
            <a href="#home" className="hover:text-white">
              Home
            </a>
            <a href="#products" className="hover:text-white">
              Products
            </a>
            <a href="#about" className="hover:text-white">
              About
            </a>
            <a href="#contact" className="hover:text-white">
              Contact
            </a>
          </div>

          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Kado. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Home;
