import { 
  Facebook, Twitter, Youtube, Instagram, Mail, Phone, 
  Search, Landmark, ShieldCheck, Package, Fingerprint, 
  Smartphone, Calculator, Info, FileText, Download, 
  Gavel, Users, Bell, Image, HelpCircle, Calendar, 
  UserCog, MapPin, Map, BookOpen, ExternalLink,
  Briefcase, AlertCircle, Globe, Github, GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#4a0404] text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: DakShiksha Branding */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
                <div className="relative">
                  <Mail size={32} className="text-postal-red" />
                  <GraduationCap 
                    size={20} 
                    className="absolute -top-1 -right-1 text-postal-yellow stroke-postal-red stroke-2" 
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white group-hover:text-[#facc15] transition-colors">
                  डाकशिक्षा
                </span>
                <span className="text-lg font-bold text-[#facc15] -mt-1 leading-none">
                  DakShiksha
                </span>
              </div>
            </Link>
            
            <p className="text-sm opacity-80 leading-relaxed max-w-xs">
              Your personal guide to mastering postal departmental exams. Empowering postal employees through knowledge.
            </p>

            <div className="space-y-3 text-sm">
              <a href="mailto:dakshiksha@gmail.com" className="flex items-center gap-3 opacity-80 hover:opacity-100 hover:text-[#facc15] transition-all">
                <Mail size={18} className="text-[#facc15]" /> dakshiksha@gmail.com
              </a>
              <a href="tel:+918249574543" className="flex items-center gap-3 opacity-80 hover:opacity-100 hover:text-[#facc15] transition-all">
                <Phone size={18} className="text-[#facc15]" /> +91 8249574543
              </a>
            </div>

            <div className="flex gap-4 pt-2">
              {[Twitter, Instagram, Github, Mail].map((Icon, i) => (
                <a key={i} href="#" className="opacity-60 hover:opacity-100 hover:text-[#facc15] transition-all">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: SERVICES */}
          <div>
            <h3 className="text-[#facc15] font-bold text-lg mb-6 uppercase tracking-wider">Services</h3>
            <ul className="space-y-4">
              {[
                { name: "Track & Trace", icon: Search },
                { name: "Banking & Savings", icon: Landmark },
                { name: "Insurance (PLI/RPLI)", icon: ShieldCheck },
                { name: "Speed Post / Parcels", icon: Package },
                { name: "Aadhaar Services", icon: Fingerprint },
                { name: "PLI Online", icon: Smartphone },
                { name: "Know Your DIGIPIN", icon: Map },
                { name: "Postage Calculator", icon: Calculator },
              ].map((item) => (
                <li key={item.name}>
                  <a href="#" className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100 hover:text-[#facc15] transition-all group">
                    <item.icon size={16} className="text-[#facc15] group-hover:scale-110 transition-transform" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: INFORMATION */}
          <div>
            <h3 className="text-[#facc15] font-bold text-lg mb-6 uppercase tracking-wider">Information</h3>
            <ul className="space-y-4">
              {[
                { name: "About Division", icon: Info },
                { name: "Post Office Directory", icon: BookOpen },
                { name: "Forms & Downloads", icon: Download },
                { name: "Tenders", icon: Gavel },
                { name: "Vacancies", icon: Briefcase },
                { name: "News & Updates", icon: Bell },
                { name: "Photo Gallery", icon: Image },
                { name: "RTI", icon: Info },
              ].map((item) => (
                <li key={item.name}>
                  <a href="#" className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100 hover:text-[#facc15] transition-all group">
                    <item.icon size={16} className="text-[#facc15] group-hover:scale-110 transition-transform" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: GRIEVANCE & HELP */}
          <div className="space-y-8">
            <div>
              <h3 className="text-[#facc15] font-bold text-lg mb-6 uppercase tracking-wider">Grievance & Help</h3>
              <ul className="space-y-4">
                {[
                  { name: "File Complaint", icon: AlertCircle },
                  { name: "Corporate Complaints", icon: Users },
                  { name: "FAQs", icon: HelpCircle },
                  { name: "Contact Us", icon: Phone },
                  { name: "Holiday List", icon: Calendar, link: 'https://drive.google.com/file/d/1OTZ0aGL93WI7hGR5sfZAkM_xSwoFxSzn/view?usp=drive_link' },
                  { name: "Admin Panel", icon: UserCog },
                ].map((item) => (
                  <li key={item.name}>
                    <a href={item.link || "#"} target={item.link ? "_blank" : undefined} rel={item.link ? "noopener noreferrer" : undefined} className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100 hover:text-[#facc15] transition-all group">
                      <item.icon size={16} className="text-[#facc15] group-hover:scale-110 transition-transform" />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Govt Portals */}
        <div className="pt-8 border-t border-white/10 text-center text-[10px] opacity-40">
          <p>© {new Date().getFullYear()} DakShiksha. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
