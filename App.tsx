import React, { useState, useEffect } from 'react';
import { getCurrentUser, fetchUserAttributes, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

import Navbar from './components/Navbar';
import CategoryList from './components/CategoryList';
import ServiceSection from './components/ServiceSection';
import AuthModal from './components/AuthModal';
import ProfileSetup from './components/ProfileSetup';
import BookingModal from './components/BookingModal';
import { getConciergeRecommendation } from './services/geminiService';
import { ServiceCategory, ServiceItem, AuthState, UserRole, Booking } from './types';

// --- MOCK DATA ---
const CATEGORIES: ServiceCategory[] = [
  { id: 'photo', name: 'Photography', image: 'https://picsum.photos/seed/photo/400/300', availableCount: 53, slug: 'photography' },
  { id: 'chefs', name: 'Chefs', image: 'https://picsum.photos/seed/chefs/400/300', availableCount: 51, slug: 'chefs' },
  { id: 'meals', name: 'Prepared meals', image: 'https://picsum.photos/seed/meals/400/300', availableCount: 6, slug: 'meals' },
  { id: 'massage', name: 'Massage', image: 'https://picsum.photos/seed/massage/400/300', availableCount: 6, slug: 'massage' },
  { id: 'training', name: 'Training', image: 'https://picsum.photos/seed/training/400/300', availableCount: 1, slug: 'training' },
  { id: 'makeup', name: 'Makeup', image: 'https://picsum.photos/seed/makeup/400/300', availableCount: 4, slug: 'makeup' },
  { id: 'hair', name: 'Hair', image: 'https://picsum.photos/seed/hair/400/300', availableCount: 3, slug: 'hair' },
  { id: 'nails', name: 'Nails', image: 'https://picsum.photos/seed/nails/400/300', availableCount: 0, slug: 'nails' },
];

const SERVICES: ServiceItem[] = [
  // Photography
  { id: 'p1', categoryId: 'photo', title: 'Luxury fashion and portrait sessions', providerName: 'by Allie', price: 450, priceUnit: 'group', rating: 5.0, reviewCount: 12, image: 'https://picsum.photos/seed/p1/500/500' },
  { id: 'p2', categoryId: 'photo', title: 'Portraits in the park', providerName: 'by Tia', price: 48, priceUnit: 'guest', rating: 4.96, reviewCount: 45, image: 'https://picsum.photos/seed/p2/500/500', isPopular: true },
  { id: 'p3', categoryId: 'photo', title: 'Event & Celebration Photography', providerName: 'by Sherri Banks', price: 150, priceUnit: 'group', rating: 4.8, reviewCount: 8, image: 'https://picsum.photos/seed/p3/500/500' },
  { id: 'p4', categoryId: 'photo', title: 'Creative Georgia photography', providerName: 'by Annie', price: 500, priceUnit: 'group', rating: 4.9, reviewCount: 22, image: 'https://picsum.photos/seed/p4/500/500' },
  { id: 'p5', categoryId: 'photo', title: 'Atlanta creative photo and video', providerName: 'by Lance', price: 300, priceUnit: 'group', rating: 4.7, reviewCount: 15, image: 'https://picsum.photos/seed/p5/500/500' },
  
  // Chefs
  { id: 'c1', categoryId: 'chefs', title: 'Fusion flavors from around the world', providerName: 'by Robert', price: 150, priceUnit: 'guest', rating: 4.95, reviewCount: 33, image: 'https://picsum.photos/seed/c1/500/500' },
  { id: 'c2', categoryId: 'chefs', title: 'The 12th of Fraisar and creative flavors', providerName: 'by Jamar', price: 121, priceUnit: 'guest', rating: 4.88, reviewCount: 19, image: 'https://picsum.photos/seed/c2/500/500' },
  { id: 'c3', categoryId: 'chefs', title: 'Eclectic global flavors', providerName: 'by Sam', price: 75, priceUnit: 'guest', rating: 4.7, reviewCount: 5, image: 'https://picsum.photos/seed/c3/500/500' },
  { id: 'c4', categoryId: 'chefs', title: 'Spanish flavor, tapas, and paella', providerName: 'by Pedro', price: 60, priceUnit: 'guest', rating: 4.9, reviewCount: 42, image: 'https://picsum.photos/seed/c4/500/500' },
];

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({ 
    isAuthenticated: false, 
    user: null, 
    isProfileComplete: false 
  });
  const [conciergeMessage, setConciergeMessage] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [bookingService, setBookingService] = useState<ServiceItem | null>(null);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      setAuthState({
        isAuthenticated: true,
        user: {
          email: attributes.email || '',
          name: attributes.name || 'User',
          role: (attributes['custom:role'] as UserRole) || 'GUEST',
          bio: attributes['custom:bio'],
          avatar: attributes.picture
        },
        isProfileComplete: !!attributes['custom:bio']
      });
    } catch (error) {
      console.log('Not signed in');
      setAuthState({ isAuthenticated: false, user: null, isProfileComplete: false });
    }
  };

  useEffect(() => {
    checkUser();
    const listener = Hub.listen('auth', (data) => {
        if (data.payload.event === 'signedIn') {
            checkUser();
        } else if (data.payload.event === 'signedOut') {
            setAuthState({ isAuthenticated: false, user: null, isProfileComplete: false });
        }
    });
    return () => listener();
  }, []);

  const handleAuthSuccess = async () => {
    setIsAuthModalOpen(false);
    await checkUser();
    // If bio is missing, prompt profile setup
    const attributes = await fetchUserAttributes();
    if (!attributes['custom:bio']) {
        setIsProfileSetupOpen(true);
    }
  };

  const handleProfileComplete = async () => {
    await checkUser();
    setIsProfileSetupOpen(false);
  };

  const handleLogout = async () => {
    try {
        await signOut();
        setAuthState({ isAuthenticated: false, user: null, isProfileComplete: false });
    } catch (error) {
        console.error("Error signing out", error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query) return;
    
    setIsThinking(true);
    setConciergeMessage(null);

    // Use Gemini to interpret the search
    const response = await getConciergeRecommendation(query, SERVICES);
    setConciergeMessage(response);
    setIsThinking(false);
  };

  const handleBookService = (service: ServiceItem) => {
    if (!authState.isAuthenticated) {
        setIsAuthModalOpen(true);
        // In a real app, we might save the intended service to open it after login
        return;
    }
    setBookingService(service);
  };

  const handleConfirmBooking = (bookingData: Omit<Booking, 'id' | 'status' | 'timestamp'>) => {
    const newBooking: Booking = {
        ...bookingData,
        id: Math.random().toString(36).substr(2, 9),
        status: 'CONFIRMED',
        timestamp: Date.now(),
    };
    setBookings(prev => [newBooking, ...prev]);
    // Note: Modal handles the success view itself, we just store the data here
  };

  const renderContent = () => {
    if (authState.isAuthenticated && authState.user?.role === 'HOTEL') {
        return (
            <div className="max-w-7xl mx-auto px-8 py-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">Hotel Dashboard</h2>
                    <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-lg font-semibold text-sm">
                        {authState.user.name}
                    </div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border">
                    <p className="text-gray-600">Manage active bookings, approve service providers, and view guest analytics here.</p>
                    
                    {authState.user.bio && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
                            <strong>Your Bio:</strong> {authState.user.bio}
                        </div>
                    )}

                    <div className="mt-6">
                        <h3 className="font-bold text-gray-800 mb-3">Recent Guest Bookings</h3>
                        {bookings.length > 0 ? (
                            <div className="space-y-3">
                                {bookings.map(b => (
                                    <div key={b.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                                        <div>
                                            <p className="font-semibold text-gray-900">{b.serviceTitle}</p>
                                            <p className="text-sm text-gray-500">{b.date} at {b.time}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                            {b.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center text-gray-400">
                                No active bookings yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    if (authState.isAuthenticated && authState.user?.role === 'PROVIDER') {
        return (
            <div className="max-w-7xl mx-auto px-8 py-12">
                <div className="flex items-center gap-4 mb-6">
                    {authState.user.avatar && <img src={authState.user.avatar} className="w-16 h-16 rounded-full object-cover shadow-sm" alt="Profile" />}
                    <div>
                         <h2 className="text-3xl font-bold text-gray-900">Provider Portal</h2>
                         <p className="text-gray-500">Welcome, {authState.user.name}</p>
                    </div>
                </div>
                
                <div className="p-6 bg-white rounded-xl shadow-sm border">
                    <p className="text-gray-600">Manage your services, availability calendar, and pricing.</p>
                    {authState.user.bio && (
                         <p className="mt-2 text-sm text-gray-500 italic">"{authState.user.bio}"</p>
                    )}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="h-32 bg-rose-50 rounded-lg flex flex-col items-center justify-center text-rose-500 font-medium border border-rose-100 p-4 text-center">
                            <span className="text-2xl font-bold">{bookings.length}</span>
                            <span>Total Bookings</span>
                         </div>
                         <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-dashed cursor-pointer hover:bg-gray-100 transition">
                            + Add New Service Listing
                         </div>
                    </div>
                </div>
            </div>
        )
    }

    // GUEST / DEFAULT VIEW
    return (
        <>
             {/* AI Concierge Response Area */}
             {isThinking && (
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center gap-3 text-rose-500 animate-pulse">
                         <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                         <span className="font-medium">Concierge is thinking...</span>
                    </div>
                </div>
             )}
             
             {conciergeMessage && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                             <span className="text-2xl">💁‍♀️</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">Concierge Recommendation</h3>
                            <p className="text-gray-700 leading-relaxed">{conciergeMessage}</p>
                        </div>
                    </div>
                </div>
             )}

            {/* Categories */}
            <CategoryList 
                categories={CATEGORIES} 
                onSelect={(id) => console.log(`Selected category ${id}`)} 
            />

            {/* Sections */}
            <ServiceSection 
                title="Photography" 
                services={SERVICES.filter(s => s.categoryId === 'photo')} 
                onBookService={handleBookService}
            />
            
            <ServiceSection 
                title="Chefs" 
                services={SERVICES.filter(s => s.categoryId === 'chefs')} 
                onBookService={handleBookService}
            />

             {/* Footer / Disclaimer */}
             <div className="max-w-7xl mx-auto px-8 py-12 text-center text-gray-400 text-sm">
                <p>© 2024 LuxeStay. Built with React & Tailwind.</p>
            </div>
        </>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-20 relative">
      <Navbar 
        authState={authState} 
        onOpenAuth={() => setIsAuthModalOpen(true)} 
        onLogout={handleLogout}
        onSearch={handleSearch}
        bookings={bookings}
      />
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <ProfileSetup 
        isOpen={isProfileSetupOpen}
        onComplete={handleProfileComplete}
      />

      <BookingModal
        isOpen={!!bookingService}
        service={bookingService}
        onClose={() => setBookingService(null)}
        onConfirm={handleConfirmBooking}
      />

      <main>
        {renderContent()}
      </main>

    </div>
  );
};

export default App;