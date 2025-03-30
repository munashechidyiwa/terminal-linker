
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dispatch', label: 'Dispatch Terminal' },
    { path: '/return', label: 'Return Terminal' },
  ];
  
  return (
    <nav className="bg-white shadow-sm py-4">
      <div className="container px-4 mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/e125de43-aa70-4f7c-8e24-eae100d6bb92.png" 
            alt="NBS Bank Logo" 
            className="h-10" 
          />
          <span className="text-nbsGreen font-semibold hidden md:inline-block">
            Terminal Management
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "nbs-nav-link py-2 text-gray-700 font-medium", 
                location.pathname === link.path && "text-nbsGreen"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMenu}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden py-2 px-4 animate-fade-in">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "py-3 px-4 text-gray-700 font-medium rounded-md transition-colors", 
                  location.pathname === link.path 
                    ? "bg-nbsGreen/10 text-nbsGreen" 
                    : "hover:bg-gray-100"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
