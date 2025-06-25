// ========== COMPOSANT LOGO ==========


const Logo = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="bg-indigo-600 text-white p-2 rounded-lg">
        <span className="font-bold text-xl">AD</span>
      </div>
      <span className="font-bold text-lg text-gray-800 dark:text-black">AdminDash</span>
    </div>
  );
};

export default Logo;