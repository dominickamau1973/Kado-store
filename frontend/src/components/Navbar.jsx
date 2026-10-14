import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();

  const cartCount = getCartCount();
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll to the selected section when the URL contains a hash.
  // This also works when a visitor clicks a section link
  // while on another page, such as the cart or login page.
  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) {
      return;
    }

    const sectionId = decodeURIComponent(location.hash.slice(1));

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [location.pathname, location.hash]);

  // Handle navigation between sections of the homepage.
  const handleSectionClick = (sectionId) => (event) => {
    if (location.pathname === "/") {
      event.preventDefault();

      // Update the URL and allow the effect above to handle scrolling.
      navigate(`/#${sectionId}`);

      // Scroll immediately when the section already exists.
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const sectionLinks = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Contact", id: "contact" },
  ];

  const linkClass =
    "text-sm font-medium text-slate-700 transition hover:text-blue-700";

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Kado Logo */}
        <Link
          to="/#home"
          onClick={handleSectionClick("home")}
          className="w-fit text-2xl font-extrabold tracking-tight text-blue-700"
        >
          Kado<span className="text-slate-900">.</span>
        </Link>

        {/* Homepage Section Links */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {sectionLinks.map((section) => (
            <Link
              key={section.id}
              to={`/#${section.id}`}
              onClick={handleSectionClick(section.id)}
              className={linkClass}
            >
              {section.label}
            </Link>
          ))}
          <Link to="/products" className={linkClass}>
            Products
          </Link>

          {/* Customer Orders */}
          {user && (
            <Link to="/orders" className={linkClass}>
              My Orders
            </Link>
          )}

          {/* Admin Navigation */}
          {user?.role === "admin" && (
            <>
              <Link to="/admin" className={linkClass}>
                Dashboard
              </Link>

              <Link to="/admin/orders" className={linkClass}>
                Admin Orders
              </Link>

              <Link to="/admin/products" className={linkClass}>
                Admin Products
              </Link>
            </>
          )}
        </div>

        {/* Cart and Authentication */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <span aria-hidden="true">🛒</span>
            Cart
            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
