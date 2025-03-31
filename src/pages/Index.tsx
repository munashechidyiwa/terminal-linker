
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">NBS Bank Terminal Management System</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Terminal Dispatch</CardTitle>
            <CardDescription>Manage the dispatch of terminals to branches</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Dispatch terminals to various branches and track their location and status.</p>
          </CardContent>
          <CardFooter>
            <Link to="/dispatch" className="w-full">
              <Button className="w-full">Go to Dispatch</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Terminal Returns</CardTitle>
            <CardDescription>Manage returns of terminals from branches</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Process and track terminals that have been returned from branches.</p>
          </CardContent>
          <CardFooter>
            <Link to="/return" className="w-full">
              <Button className="w-full">Go to Returns</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>View all terminal data and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Access comprehensive reports and statistics about terminal dispatch and returns.</p>
          </CardContent>
          <CardFooter>
            <Link to="/dashboard" className="w-full">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-12 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Hosting on GitHub</h2>
        <div className="text-left bg-gray-50 p-6 rounded-lg shadow-sm">
          <ol className="list-decimal list-inside space-y-3">
            <li><strong>Create a GitHub repository:</strong> Go to GitHub and create a new repository</li>
            <li><strong>Push your code to GitHub:</strong> Follow the instructions provided by GitHub to push your existing code</li>
            <li><strong>Deploy with GitHub Pages:</strong> Enable GitHub Pages in the repository settings</li>
            <li><strong>Alternative deployments:</strong> Consider services like Netlify or Vercel for easier deployment</li>
          </ol>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">Note: For a production environment, you'll need to set up your own Supabase project and update the connection details.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
