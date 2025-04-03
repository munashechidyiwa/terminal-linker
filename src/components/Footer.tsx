
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-nbsGreen text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-nbsLime font-semibold text-lg mb-4">NBS Bank</h3>
            <p className="text-white/80 text-sm">
              National Building Society - Build, Bank & Go Beyond
            </p>
          </div>
          
          <div>
            <h3 className="text-nbsLime font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/80 hover:text-white text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-white/80 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dispatch" className="text-white/80 hover:text-white text-sm transition-colors">
                  Dispatch Terminal
                </Link>
              </li>
              <li>
                <Link to="/return" className="text-white/80 hover:text-white text-sm transition-colors">
                  Returned Terminal
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-nbsLime font-semibold text-lg mb-4">Contact</h3>
            <p className="text-white/80 text-sm mb-2">
              NBS Bank Headquarters
            </p>
            <p className="text-white/80 text-sm mb-2">
              SSC Building 14th Floor
            </p>
            <p className="text-white/80 text-sm">
              alternativechannels@nbs.co.zw
            </p>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-6 text-center">
          <p className="text-white/80 text-sm">
            &copy; {new Date().getFullYear()} NBS Bank. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
