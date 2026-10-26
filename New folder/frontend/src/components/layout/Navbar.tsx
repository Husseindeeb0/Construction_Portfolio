import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  Phone,
  ChevronDown,
  BarChart2,
  Menu,
  X,
  User,
  LogIn,
  LogOut,
  LayoutDashboard,
  Building2,
  Image,
  Info,
  Wrench,
  Trophy,
  Tag,
  Layers,
} from "lucide-react";
import { useGetCompanyProfileQuery } from "../../../client/companyProfileAPI";
import { useGetMeQuery, useSignoutMutation } from "../../../client/authAPI";

const NAV_LINKS = [
  { label: "Home", href: "#home", section: "home" },
  { label: "About", href: "#about", section: "about" },
  { label: "Services", href: "#services", section: "services" },
  { label: "Projects", href: "#projects", section: "projects" },
  { label: "Team", href: "#team", section: "team" },
  { label: "Pages", href: "#pages", section: "pages", hasDropdown: true },
  { label: "Contact", href: "#contact", section: "contact" },
];

const DASHBOARD_LINKS = [
  { label: "Company", href: "/dashboard/company", icon: Building2 },
  { label: "Hero", href: "/dashboard/hero", icon: Image },
  { label: "About", href: "/dashboard/about", icon: Info },
  { label: "Services", href: "/dashboard/services", icon: Wrench },
  { label: "Records", href: "/dashboard/records", icon: Trophy },
  { label: "Projects", href: "/dashboard/projects", icon: Layers },
  { label: "Categories", href: "/dashboard/categories", icon: Tag },
];

/** Reusable dropdown item */
function DropdownItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors text-left ${
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-50 hover:text-orange"
      }`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
      {label}
    </button>
  );
}

/** Desktop auth/account dropdown */
function AuthDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: meData } = useGetMeQuery();
  const [signout] = useSignoutMutation();

  const user = meData?.user;
  const isAdmin = user?.role === "ADMIN";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignout = async () => {
    setOpen(false);
    try {
      await signout().unwrap();
    } catch {
      // ignore
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 text-gray-700 hover:border-orange hover:text-orange transition-all text-[13px] font-medium cursor-pointer"
        aria-label="Account menu"
      >
        <User className="w-4 h-4" />
        <span className="hidden xl:inline">
          {user ? (isAdmin ? "Admin" : "Account") : "Sign In"}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-50">
          {!user ? (
            /* Unauthenticated */
            <>
              <DropdownItem
                icon={LogIn}
                label="Sign In"
                onClick={() => {
                  setOpen(false);
                  navigate("/login");
                }}
              />
              <DropdownItem
                icon={User}
                label="Register"
                onClick={() => {
                  setOpen(false);
                  navigate("/register");
                }}
              />
            </>
          ) : (
            /* Authenticated */
            <>
              {/* User info */}
              <div className="px-3 py-2 mb-1 border-b border-gray-100">
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">
                  Signed in as
                </p>
                <p className="text-[13px] text-gray-800 font-medium truncate mt-0.5">
                  {user.email}
                </p>
              </div>

              {/* Admin dashboard links */}
              {isAdmin && (
                <>
                  <div className="px-3 pt-1.5 pb-0.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                      <LayoutDashboard className="w-3 h-3" />
                      Dashboard
                    </p>
                  </div>
                  {DASHBOARD_LINKS.map((link) => (
                    <DropdownItem
                      key={link.href}
                      icon={link.icon}
                      label={link.label}
                      onClick={() => {
                        setOpen(false);
                        navigate(link.href);
                      }}
                    />
                  ))}
                  <div className="my-1 border-t border-gray-100" />
                </>
              )}

              <DropdownItem
                icon={LogOut}
                label="Sign Out"
                danger
                onClick={handleSignout}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** Mobile drawer auth section */
function MobileAuthLinks() {
  const navigate = useNavigate();
  const { data: meData } = useGetMeQuery();
  const [signout] = useSignoutMutation();

  const user = meData?.user;
  const isAdmin = user?.role === "ADMIN";

  const handleSignout = async () => {
    try {
      await signout().unwrap();
    } catch {
      // ignore
    }
    navigate("/", { replace: true });
  };

  if (!user) {
    return (
      <div className="flex gap-2">
        <Link
          to="/login"
          className="flex-1 text-center cursor-pointer border border-orange text-orange font-bold py-2.5 rounded-full text-sm"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="flex-1 text-center cursor-pointer bg-gray-100 text-gray-700 font-bold py-2.5 rounded-full text-sm"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {isAdmin && (
        <Link
          to="/dashboard/company"
          className="flex items-center cursor-pointer gap-2 text-sm text-gray-700 font-medium py-1"
        >
          <LayoutDashboard className="w-4 h-4 text-orange" />
          Go to Dashboard
        </Link>
      )}
      <button
        onClick={handleSignout}
        className="flex items-center cursor-pointer gap-2 text-sm text-red-500 font-medium py-1 text-left"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data } = useGetCompanyProfileQuery();
  const profile = data?.profile;

  // Track if user clicked a link to prevent scroll events from overriding the target during smooth scroll
  const isClickingRef = useRef(false);
  const clickTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);

      // If user just clicked a nav link, don't let scroll spy overwrite it while traveling
      if (isClickingRef.current) return;

      const sectionIds = ["home", "about", "services", "records", "projects"];
      const headerOffset = 160;
      let currentSection = "home";

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the top of the section is near or above the header threshold, it's the current one
          if (rect.top <= headerOffset) {
            currentSection = id === "records" ? "services" : id;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initialize

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  const handleNavClick = (href: string, section: string) => {
    setActiveSection(section);
    setMobileOpen(false);

    if (href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        // Lock scroll updates so it goes straight to the clicked item without jittering
        isClickingRef.current = true;
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

        target.scrollIntoView({ behavior: "smooth" });

        // Release lock once arrived
        clickTimerRef.current = setTimeout(() => {
          isClickingRef.current = false;
        }, 1000);
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-md" : "border-b border-gray-100"
      }`}
    >
      <nav className="max-w-[1240px] mx-auto px-6 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex items-center justify-center w-9 h-9 bg-orange rounded-lg text-white shadow-sm transition-transform group-hover:scale-105">
            {profile?.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={profile.companyName}
                className="w-6 h-6 object-contain"
              />
            ) : (
              <BarChart2 className="w-5 h-5" />
            )}
          </div>
          <span className="text-xl font-extrabold text-[#111827] tracking-tight">
            {profile?.companyName || "Constructify"}
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-7 h-full">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.section;
            return (
              <div
                key={link.label}
                className="relative flex flex-col items-center justify-center"
              >
                <a
                  href={link.href}
                  onClick={(e) => {
                    if (link.href.startsWith("#")) {
                      e.preventDefault();
                      handleNavClick(link.href, link.section);
                    }
                  }}
                  className={`flex items-center gap-1 text-[15px] font-medium transition-colors py-1 ${
                    isActive
                      ? "text-orange font-semibold"
                      : "text-gray-700 hover:text-orange"
                  }`}
                >
                  {link.label}
                  {link.hasDropdown && (
                    <ChevronDown className="w-4 h-4 ml-0.5 opacity-60" />
                  )}
                </a>
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-orange rounded-full" />
                )}
              </div>
            );
          })}
        </div>

        {/* Right CTA Area */}
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          <a
            href={`tel:${profile?.phoneNumber || "+15552346789"}`}
            className="flex items-center gap-2 text-[14px] font-medium text-gray-700 hover:text-orange transition-colors"
          >
            <Phone className="w-4 h-4 text-orange" />
            <span>{profile?.phoneNumber || "+1 (555) 234-6789"}</span>
          </a>

          <a
            href="#contact"
            className="bg-orange hover:bg-orange-dark text-white text-[14px] font-bold px-6 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow"
          >
            Get Estimate
          </a>

          {/* Auth Dropdown */}
          <AuthDropdown />
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-gray-700 hover:text-orange transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-5 flex flex-col gap-4 shadow-xl">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                if (link.href.startsWith("#")) {
                  e.preventDefault();
                  handleNavClick(link.href, link.section);
                }
              }}
              className={`flex items-center justify-between text-base font-medium py-1.5 ${
                activeSection === link.section
                  ? "text-orange font-semibold"
                  : "text-gray-800"
              }`}
            >
              <span>{link.label}</span>
              {link.hasDropdown && (
                <ChevronDown className="w-4 h-4 opacity-50" />
              )}
            </a>
          ))}

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <a
              href={`tel:${profile?.phoneNumber || "+15552346789"}`}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <Phone className="w-4 h-4 text-orange" />
              <span>{profile?.phoneNumber || "+1 (555) 234-6789"}</span>
            </a>
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="bg-orange text-white text-center font-bold py-2.5 rounded-full"
            >
              Get Estimate
            </a>

            {/* Mobile Auth Links */}
            <MobileAuthLinks />
          </div>
        </div>
      )}
    </header>
  );
}
