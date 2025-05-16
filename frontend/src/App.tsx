import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import Wishlist from './components/Wishlist';
import AuthForm from './components/AuthForm';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { OnboardingOverlay } from './components/onboarding';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, initializing } = useAuth();
  
  // If auth state is still initializing, show a loading indicator instead of redirecting
  if (initializing) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  // Only redirect to auth if we're sure the user is not authenticated
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <OnboardingProvider>
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <Navbar />
            <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  }
                />
                <Route path="/auth" element={<AuthForm />} />
              </Routes>
            </main>
            <footer className="bg-white mt-12 border-t border-gray-200">
              <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="flex items-center mb-4 md:mb-0">
                    <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                      Product Catalog
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Product Catalog. All rights reserved.
                  </div>
                </div>
              </div>
            </footer>
            
            {/* Onboarding overlay */}
            <OnboardingOverlay />
          </div>
        </OnboardingProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
