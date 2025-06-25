import React from 'react';
import CategoryCard from './CategoryCard';

interface MainCategoriesProps {
  onCategoryClick: (category: string) => void;
}

const MainCategories: React.FC<MainCategoriesProps> = ({ onCategoryClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <CategoryCard 
        title="Chambres d'Hôtel" 
        description="Nos chambres élégantes et confortables pour un séjour inoubliable."
        imageUrl="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"
        categoryKey="rooms"
        onCategoryClick={onCategoryClick}
      />
      
      <CategoryCard 
        title="Salles de Fête" 
        description="Espaces parfaits pour vos événements, mariages et célébrations."
        imageUrl="https://images.unsplash.com/photo-1555244162-803834f70033"
        categoryKey="event-rooms"
        onCategoryClick={onCategoryClick}
      />
      
      <CategoryCard 
        title="Appartements" 
        description="Appartements spacieux pour des séjours prolongés en toute indépendance."
        imageUrl="https://images.unsplash.com/photo-1566073771259-6a8506099945"
        categoryKey="apartments"
        onCategoryClick={onCategoryClick}
      />
    </div>
  );
};

export default MainCategories;