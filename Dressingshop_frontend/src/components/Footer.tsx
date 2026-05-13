import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="gradient-maroon text-primary-foreground">
      <div className="container mx-auto px-4 py-10 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
        {/* Brand */}
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center text-sm font-bold text-maroon-dark">SP</div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg">SRI POTHYS</h3>
              <p className="text-xs tracking-widest opacity-70">SILKS & READYMADES</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm opacity-80 leading-relaxed mb-4">
            Since 2000, bringing you the finest silk sarees and traditional wear from across India. Where tradition meets elegance.
          </p>
          <div className="flex gap-3">
            {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display font-semibold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h4>
          <div className="space-y-1.5 sm:space-y-2">
            {["New Arrivals", "Wedding Collection", "Festival Specials", "Sale", "Gift Cards"].map((link) => (
              <Link key={link} to="/products" className="block text-xs sm:text-sm opacity-80 hover:opacity-100 transition-opacity">{link}</Link>
            ))}
          </div>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="font-display font-semibold text-base sm:text-lg mb-3 sm:mb-4">Customer Care</h4>
          <div className="space-y-1.5 sm:space-y-2">
            {["Track Order", "Returns & Exchange", "Size Guide", "FAQs", "Contact Us"].map((link) => (
              <a key={link} href="#" className="block text-xs sm:text-sm opacity-80 hover:opacity-100 transition-opacity">{link}</a>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="col-span-2 lg:col-span-1">
          <h4 className="font-display font-semibold text-base sm:text-lg mb-3 sm:mb-4">Get in Touch</h4>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm opacity-80">
              <Phone className="w-4 h-4" /> +91 88702 94044
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm opacity-80 break-all">
              <Mail className="w-4 h-4 shrink-0" /> sripothysswamimalai2000@gmail.com
            </div>
            <div className="flex items-start gap-2 text-xs sm:text-sm opacity-80">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> 62, North St, Swamimalai, Kumbakonam, Alavandipuram, Tamil Nadu 612302
            </div>
          </div>
        </div>
      </div>

        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-primary-foreground/20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs opacity-60">© {currentYear} Sri Pothys Silks & Readymades. All rights reserved.</p>
          <div className="flex gap-4 text-xs opacity-60">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Shipping Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
