const LandingPage = ({ connectWallet, characterUrl, characterLoading }) => {
    return (
      <>
        {/* Character animation */}
        <div className="absolute z-10 right-3 xs:right-5 sm:right-10 bottom-3 xs:bottom-5 sm:bottom-10 w-16 xs:w-24 sm:w-32 h-16 xs:h-24 sm:h-32 hidden xs:block">
          <div 
            className={`char-1 animate-float ${characterLoading ? 'opacity-50' : 'opacity-100'}`}
            style={{
              backgroundImage: characterUrl ? `url(${characterUrl})` : "none"
            }}
          ></div>
        </div>
  
        {/* Landing content */}
        <div className="text-center mt-10 xs:mt-16 sm:mt-20 md:mt-24 max-w-[90vw] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl mx-auto relative">
          <div className="mb-4 xs:mb-6 sm:mb-8 text-3xl xs:text-4xl sm:text-5xl flex justify-center">
            <div className="relative">
              <span className="animate-pulse inline-block transform hover:scale-110 transition-transform duration-300">🔥</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 rounded-full filter blur-xl animate-pulse-slow -z-10"></div>
            </div>
          </div>
          
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold mb-2 xs:mb-3 sm:mb-4 text-emerald-400">Welcome to Daily Hirys</h2>
          <p className="text-xs xs:text-sm sm:text-base font-normal text-gray-300/90 mb-4 xs:mb-6 sm:mb-8 leading-relaxed">
            Connect your wallet and say Hirys!
          </p>
          <button 
            onClick={connectWallet}
            className="px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-lg transform hover:-translate-y-1 text-sm sm:text-base touch-manipulation min-h-[44px] min-w-[180px] font-bold"
          >
            Start Your Hirys!
          </button>
          <p className="text-xs font-normal text-gray-500/90 mt-6 xs:mt-8 sm:mt-12">
            Powered by <a href="https://irys.xyz" className="underline hover:text-emerald-400">Irys</a>
          </p>
        </div>
      </>
    );
  };
  
  export default LandingPage;