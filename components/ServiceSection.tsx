import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ServiceItem } from '../types';
import ServiceCard from './ServiceCard';

interface ServiceSectionProps {
  title: string;
  services: ServiceItem[];
  onBook?: (serviceId: string) => void;
}

const ServiceSection: React.FC<ServiceSectionProps> = ({ title, services, onBook }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (services.length === 0) return null;

  return (
    <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-1 cursor-pointer hover:text-rose-500 transition-colors">
            {title} <ChevronRight size={20} />
        </h2>
        
        <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="p-1.5 rounded-full border border-gray-300 hover:bg-gray-100 hover:shadow-sm disabled:opacity-30">
                <ChevronLeft size={16} />
            </button>
            <button onClick={() => scroll('right')} className="p-1.5 rounded-full border border-gray-300 hover:bg-gray-100 hover:shadow-sm">
                <ChevronRight size={16} />
            </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4"
      >
        {services.map(service => (
            <div 
                key={service.id} 
                className="snap-start"
                onClick={() => onBook && onBook(service.id)}
            >
                <ServiceCard service={service} />
            </div>
        ))}
      </div>
    </section>
  );
};

export default ServiceSection;