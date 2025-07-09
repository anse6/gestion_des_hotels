

// Composant Logo
const Logo = () => {
  return (
    <div className="flex flex-col items-center mb-8 md:mb-0">
      <div className="w-16 h-16 md:w-24 md:h-24 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-purple-800 flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 md:h-8 md:w-8 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#7C3AED" strokeWidth="2" strokeDasharray="5,5" />
          </svg>
        </div>
      </div>
       <span className="hidden sm:inline text-white">
                 Anseehoʊ.t̬əl<span className="text-blue-500">T</span> {/* Signature avec le T stylisé */}
              </span>
              <span className="sm:hidden">
                A<span className="text-blue-500">T</span> {/* Version abrégée */}
              </span>
    </div>
  );
};
export default Logo;