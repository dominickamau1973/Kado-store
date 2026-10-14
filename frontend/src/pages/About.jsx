import { Link } from "react-router-dom";

const About = () => {
  const values = [
    {
      number: "01",
      title: "Quality First",
      description:
        "We believe shopping should feel worthwhile. Our goal is to make it easy to explore products and find items that suit your needs.",
      icon: "✦",
    },
    {
      number: "02",
      title: "Shopping Made Simple",
      description:
        "From browsing our collection to reviewing your cart, Kado is designed to keep your shopping experience straightforward.",
      icon: "↗",
    },
    {
      number: "03",
      title: "Built Around You",
      description:
        "A good shopping experience starts with the customer. We aim to make finding products and managing orders convenient.",
      icon: "♡",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-8">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-blue-300">
            Get to know Kado
          </p>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl">
            Shopping should be
            <span className="block text-blue-300">
              simple, exciting, and yours.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-blue-100/90">
            Welcome to Kado, your online shopping destination built around
            discovering products, making informed choices, and enjoying a
            smoother shopping experience.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              to="/products"
              className="rounded-xl bg-white px-7 py-3.5 font-bold text-blue-950 transition hover:bg-blue-100"
            >
              Explore Products <span aria-hidden="true">→</span>
            </Link>

            <Link
              to="/contact"
              className="rounded-xl border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Get in Touch
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/20 pt-8">
            <div>
              <p className="text-2xl font-extrabold text-white">Simple</p>
              <p className="mt-1 text-sm text-blue-200">
                Easy product discovery
              </p>
            </div>

            <div>
              <p className="text-2xl font-extrabold text-white">Convenient</p>
              <p className="mt-1 text-sm text-blue-200">
                A straightforward checkout
              </p>
            </div>

            <div>
              <p className="text-2xl font-extrabold text-white">
                Customer-focused
              </p>
              <p className="mt-1 text-sm text-blue-200">
                Designed around your needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our story */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
            Our Story
          </p>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            A better way to discover what you need.
          </h2>

          <div className="mt-6 space-y-5 leading-8 text-slate-600">
            <p>
              We created Kado around a simple idea: online shopping should be
              easy to understand and enjoyable to use. Finding a product should
              not feel complicated.
            </p>

            <p>
              That is why our store focuses on a clear product catalogue,
              accessible product information, a convenient cart, and an
              organized checkout experience.
            </p>

            <p>
              As we continue to improve Kado, our focus remains on making the
              shopping journey more useful, intuitive, and convenient for every
              customer.
            </p>
          </div>

          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 font-bold text-blue-700 hover:text-blue-900"
          >
            Find your next favourite
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="relative">
          <div className="rounded-3xl bg-slate-100 p-5 sm:p-8">
            <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-slate-950 p-8 text-white sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl">
                ✦
              </div>

              <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-blue-200">
                The Kado Promise
              </p>

              <h3 className="mt-3 text-3xl font-extrabold leading-snug">
                Less hassle.
                <br />
                More discovery.
              </h3>

              <p className="mt-5 leading-7 text-blue-100">
                A thoughtfully designed shopping experience that puts product
                discovery and convenience first.
              </p>
            </div>
          </div>

          <div className="absolute -bottom-4 -left-2 hidden rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-lg sm:block">
            <p className="text-sm font-bold text-slate-900">
              Find it. Love it. Shop it.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Your journey starts here.
            </p>
          </div>
        </div>
      </section>

      {/* Our values */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              What We Stand For
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              The values behind every click.
            </h2>

            <p className="mt-5 leading-7 text-slate-600">
              Our approach is guided by the little things that make a shopping
              experience better.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.number}
                className="rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-700">
                    {value.icon}
                  </span>

                  <span className="text-sm font-bold text-slate-300">
                    {value.number}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold">{value.title}</h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="rounded-3xl bg-blue-700 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to find something you love?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-100">
            Browse our collection and discover what Kado has to offer.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-flex rounded-xl bg-white px-7 py-3.5 font-bold text-blue-800 transition hover:bg-blue-50"
          >
            Start Shopping{" "}
            <span className="ml-2" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default About;
