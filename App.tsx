import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CategoryList from './components/CategoryList';
import ServiceSection from './components/ServiceSection';
import AuthModal from './components/AuthModal';
import ProfileSetup from './components/ProfileSetup';
import BookingModal from './components/BookingModal';
import { getConciergeRecommendation } from './services/geminiService';
import { ServiceCategory, ServiceItem, AuthState, UserRole, Booking } from './types';
import { getCurrentUser, fetchUserAttributes, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

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

// --- COMPONENT ---

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({ 
    isAuthenticated: false, 
    user: null, 
    isProfileComplete: false 
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [conciergeMessage, setConciergeMessage] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  
  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<ServiceItem | null>(null);

  // --- AMPLIFY AUTH LISTENER ---
  useEffect(() => {
    checkUser();

    const hubListener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkUser();
          break;
        case 'signedOut':
          setAuthState({ isAuthenticated: false, user: null, isProfileComplete: false });
          break;
      }
    });

    return () => hubListener();
  }, []);

  const checkUser = async () => {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      const role = (attributes['custom:role'] as UserRole) || 'GUEST';
      const bio = attributes['custom:bio'] as string;
      
      setAuthState({
        isAuthenticated: true,
        user: {
          email: attributes.email || '',
          name: attributes.name || user.username,
          role,
          bio,
          avatar: '' // In a real app, fetch from S3 or use attribute 'picture'
        },
        isProfileComplete: !!bio
      });

      // Check if profile is incomplete
      if (!bio) {
          setIsProfileSetupOpen(true);
      }

    } catch (err) {
      // Not signed in
      setAuthState({ isAuthenticated: false, user: null, isProfileComplete: false });
    }
  };

  const handleLogout = async () => {
    try {
        await signOut();
    } catch (error) {
        console.error("Error signing out", error);
    }
  };

  const handleProfileComplete = (bio: string, avatar: string) => {
    // Optimistically update state
    if (authState.user) {
        setAuthState(prev => ({
            ...prev,
            user: { ...prev.user!, bio, avatar },
            isProfileComplete: true
        }));
    }
    setIsProfileSetupOpen(false);
  };

  const handleSearch = async (query: string) => {
    if (!query) return;
    
    setIsThinking(true);
    setConciergeMessage(null);

    const response = await getConciergeRecommendation(query, SERVICES);
    setConciergeMessage(response);
    setIsThinking(false);
  };

  const handleInitiateBooking = (serviceId: string) => {
    if (!authState.isAuthenticated) {
        setIsAuthModalOpen(true);
        return;
    }
    const service = SERVICES.find(s => s.id === serviceId);
    if (service) {
        setSelectedServiceForBooking(service);
        setIsBookingModalOpen(true);
    }
  };

  const handleConfirmBooking = (date: string, time: string, notes: string) => {
    if (!selectedServiceForBooking) return;

    const newBooking: Booking = {
        id: Math.random().toString(36).substr(2, 9),
        serviceTitle: selectedServiceForBooking.title,
        date,
        time,
        status: 'CONFIRMED',
        timestamp: Date.now()
    };

    setBookings(prev => [newBooking, ...prev]);
    setIsBookingModalOpen(false);
    setSelectedServiceForBooking(null);
    
    // Simple confirmation alert
    alert(`Booking Confirmed!\n${newBooking.serviceTitle}\n${date} at ${time}`);
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

                    <div className="mt-4 p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center text-gray-400">
                        Dashboard UI Placeholders
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
                         <div className="h-32 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500 font-medium border border-rose-100">
                            New Request: Massage (Room 402)
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
                onBook={handleInitiateBooking}
            />
            
            <ServiceSection 
                title="Chefs" 
                services={SERVICES.filter(s => s.categoryId === 'chefs')} 
                onBook={handleInitiateBooking}
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
        onLoginSuccess={() => {
            setIsAuthModalOpen(false);
            checkUser(); // Refresh state immediately
        }}
      />

      <ProfileSetup 
        isOpen={isProfileSetupOpen}
        onComplete={handleProfileComplete}
      />

      <BookingModal 
        isOpen={isBookingModalOpen}
        serviceTitle={selectedServiceForBooking?.title || ''}
        price={selectedServiceForBooking?.price || 0}
        onClose={() => setIsBookingModalOpen(false)}
        onConfirm={handleConfirmBooking}
      />

      <main>
        {renderContent()}
      </main>

    </div>
  );
};

export default App;