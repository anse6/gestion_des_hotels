import React from 'react';
import Slider from 'react-slick';
import image from "../../assets/venise.png";
import Logo from "./Logo";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
///import ForgotPasswordForm from './ForgotPasswordForm';
//import VerifyCodeForm from './RegisterForm';
import RegisterForm from './RegisterForm';

const LoginLayoutrestcover: React.FC = () => {
  // Configuration du carrousel
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    fade: true
  };

  // Tableau d'images pour le carrousel
  const carouselImages = [
    { src: image, alt: "Illustration 1" },
    { src: image, alt: "Illustration 2" },
    { src: image, alt: "Illustration 3" }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      <div className="w-full md:w-1/2 flex items-center justify-center py-8 md:py-0 px-4 sm:px-6">
        <RegisterForm />
      </div>
      

      <div className="hidden md:flex md:w-1/2 bg-indigo-800 flex-col items-center justify-center p-8 relative">
        <div className="absolute top-8 right-8 z-10">
          <Logo />
        </div>
        
        <div className="text-center max-w-md mb-8 z-10">
         <p className="text-lg font-medium text-white">
            Gérez facilement vos chambres, réservations,<br />
            clients et paiements depuis une seule plateforme.
            </p>

        </div>
        
   
        <div className="w-full max-w-lg">
          <Slider {...sliderSettings}>
            {carouselImages.map((img, index) => (
              <div key={index} className="outline-none">
                <img 
                  src={img.src} 
                  alt={img.alt}
                  className="max-w-full h-auto max-h-64 lg:max-h-96 object-contain mx-auto"
                />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default LoginLayoutrestcover;