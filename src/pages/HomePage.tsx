
import { Link } from 'react-router-dom';
import { ArrowRight, Box, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-nbsGreen">
              Merchant Services Terminal Management System
            </h1>
            <p className="text-lg text-gray-600">
              Efficiently manage the dispatched terminals to different business units as well as recalled terminals.
            </p>
            <Button asChild size="lg" className="bg-nbsGreen hover:bg-nbsGreen-dark text-white">
              <Link to="/dashboard">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="relative rounded-lg bg-gradient-to-br from-nbsGreen/10 to-nbsLime/20 p-8 shadow-xl animate-slide-in">
            <div className="absolute -top-4 -left-4 h-24 w-24 bg-nbsLime/30 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-nbsGreen/30 rounded-full blur-2xl"></div>
            <img 
              src="/lovable-uploads/e125de43-aa70-4f7c-8e24-eae100d6bb92.png" 
              alt="NBS Bank Logo" 
              className="mx-auto h-24 mb-6"
            />
            <div className="text-center text-gray-800">
              <h3 className="text-xl font-semibold mb-2">National Building Society</h3>
              <p className="text-sm text-gray-600">Build, Bank & Go Beyond</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12 text-nbsGreen">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="nbs-card-hover">
            <CardHeader>
              <Box className="h-10 w-10 text-nbsGreen mb-2" />
              <CardTitle>Dispatched Terminals</CardTitle>
              <CardDescription>
                Dispatch POS Terminals to different Business Units
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Capture and update records of all POS terminals dispatched to business units and merchant details.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link to="/dispatch">Dispatch Terminal</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="nbs-card-hover">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-nbsGreen mb-2" />
              <CardTitle>Terminal Dashboard</CardTitle>
              <CardDescription>
                Track and manage all POS terminals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View, search, and filter POS terminal inventory on the comprehensive dashboard.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="nbs-card-hover">
            <CardHeader>
              <RefreshCw className="h-10 w-10 text-nbsGreen mb-2" />
              <CardTitle>Returned Terminals</CardTitle>
              <CardDescription>
                Process returned terminal easily
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Mark terminals as returned and keep track of their status in the system.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link to="/return">Return Terminal</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 mt-8">
        <div className="bg-gradient-to-r from-nbsGreen to-nbsGreen-dark rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Ready to simplify terminal management?
          </h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            This system helps you keep track of all your POS terminals efficiently, reducing loss and improving accountability.
          </p>
          <Button asChild size="lg" className="bg-white text-nbsGreen hover:bg-nbsLime hover:text-nbsGreen-dark">
            <Link to="/dashboard">
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
