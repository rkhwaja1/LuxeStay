import React from 'react';
import { Heart, Star } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServiceCardProps {
  service: ServiceItem;
  onBook: (service: ServiceItem) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBook }) => {
  return (
    <div className="min-w-[280px] max-w-[280px] flex flex-col gap-2 group">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200 cursor-pointer">
        <img 
          src={service.image} 
          alt={service.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <button className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform z-10">
            <Heart className="text-white drop-shadow-md hover:fill-rose-500 hover:text-rose-500 transition-colors" size={24} />
        </button>
        {service.isPopular && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold shadow-sm z-10">
                Popular
            </div>
        )}
        
        {/* Overlay Button on Hover (Desktop) / Always visible (Mobile if needed, but standard is hover for desktop apps) */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center items-end h-full pb-6">
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onBook(service);
                }}
                className="bg-white text-gray-900 font-bold py-2 px-6 rounded-full shadow-lg hover:bg-rose-500 hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
             >
                Book Now
             </button>
        </div>
      </div>
      
      <div className="mt-1">
        <div className="flex justify-between items-start">
             <h3 className="font-semibold text-gray-900 leading-tight truncate pr-2">{service.title}</h3>
             <div className="flex items-center gap-1 text-xs font-medium text-gray-800">
                <Star size={12} fill="black" />
                <span>{service.rating}</span>
             </div>
        </div>
        <p className="text-sm text-gray-500 truncate">{service.providerName}</p>
        <div className="mt-1 flex items-center justify-between">
            <div className="text-sm text-gray-900">
                <span className="font-semibold">From ${service.price}</span> 
                <span className="text-gray-500"> / {service.priceUnit}</span>
            </div>
            <button 
                onClick={() => onBook(service)}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 md:hidden border border-rose-200 px-2 py-1 rounded-md"
            >
                Book
            </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;