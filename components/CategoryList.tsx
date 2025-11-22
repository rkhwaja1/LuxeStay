import React from 'react';
import { ServiceCategory } from '../types';

interface CategoryListProps {
  categories: ServiceCategory[];
  onSelect: (id: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, onSelect }) => {
  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Services in Atlanta</h2>
      <div className="flex gap-8 overflow-x-auto no-scrollbar pb-4">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="flex flex-col gap-2 min-w-[140px] cursor-pointer group"
            onClick={() => onSelect(cat.id)}
          >
            <div className="overflow-hidden rounded-xl shadow-sm aspect-[4/3] bg-gray-200 relative">
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                <p className="text-xs text-gray-500">{cat.availableCount > 0 ? `${cat.availableCount} available` : 'Coming soon'}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryList;