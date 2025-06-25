import React from 'react';

interface CategoryCardProps {
  title: string;
  description: string;
  imageUrl: string;
  categoryKey: string;
  onCategoryClick: (category: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  title, 
  description, 
  imageUrl, 
  categoryKey, 
  onCategoryClick 
}) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      onClick={() => onCategoryClick(categoryKey)}
    >
      <div className="h-64 overflow-hidden">
        <img 
          src={imageUrl}
          alt={title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b";
          }}
        />
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onCategoryClick(categoryKey);
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition duration-300"
        >
          Voir les options
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;