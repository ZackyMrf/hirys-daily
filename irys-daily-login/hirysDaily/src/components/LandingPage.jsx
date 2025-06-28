const LandingPage = ({ connectWallet, characterUrl, characterLoading }) => {
    return (
      <>
        {/* Floating Particles Background */}
        <div className="particles-bg">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${Math.random() * 10 + 15}s`
              }}
            />
          ))}
        </div>

        {/* Character animation */}
        <div className="absolute z-10 right-3 xs:right-5 sm:right-10 bottom-3 xs:bottom-5 sm:bottom-10 w-20 xs:w-28 sm:w-36 h-20 xs:h-28 sm:h-36 hidden xs:block">
          <div 
            className={`char-enhanced animate-float transition-all duration-500 ${characterLoading ? 'opacity-50 scale-90' : 'opacity-100 scale-100'}`}
            style={{
              backgroundImage: characterUrl ? `url(${characterUrl})` : "url('/assets/char1.png')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}
          ></div>
        </div>
  
        {/* Landing content */}
        <div className="text-center mt-10 xs:mt-16 sm:mt-20 md:mt-24 max-w-[90vw] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl mx-auto relative z-20">
          {/* Hero Icon with Enhanced Animation */}
          <div className="mb-6 xs:mb-8 sm:mb-10 text-4xl xs:text-5xl sm:text-6xl flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-blue-500/30 to-purple-500/30 rounded-full filter blur-xl animate-pulse-slow scale-150"></div>
              <div className="relative flex items-center gap-3">
                {/* Character 1 */}
                <div 
                  className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 transform hover:scale-110 transition-all duration-300 animate-bounce cursor-pointer group-hover:animate-pulse"
                  style={{
                    backgroundImage: "url('/assets/char1.png')",
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3))'
                  }}
                ></div>
                
                {/* Center Diamond */}
                <span className="text-2xl xs:text-3xl sm:text-4xl animate-pulse">💎</span>
                
                {/* Character 2 */}
                <div 
                  className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 transform hover:scale-110 transition-all duration-300 animate-bounce cursor-pointer group-hover:animate-pulse"
                  style={{
                    backgroundImage: "url('/assets/char2.png')",
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))',
                    animationDelay: '0.2s'
                  }}
                ></div>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0 rounded-full filter blur-xl animate-pulse-slow"></div>
            </div>
          </div>
          
          {/* Main Title with Gradient */}
          <h2 className="text-gradient text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mb-3 xs:mb-4 sm:mb-5 animate-fade-in">
            Welcome to Daily Hirys
          </h2>
          
          {/* Subtitle */}
          <p className="text-sm xs:text-base sm:text-lg font-normal text-gray-300/90 mb-6 xs:mb-8 sm:mb-10 leading-relaxed max-w-md mx-auto">
            Connect your wallet and start your daily reward journey on the{' '}
            <span className="text-emerald-400 font-semibold">Irys blockchain</span>
          </p>
          
          {/* CTA Button with Enhanced Design */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <button 
              onClick={connectWallet}
              className="relative btn-primary px-6 xs:px-8 sm:px-10 py-3 xs:py-4 sm:py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg transform hover:-translate-y-1 hover:shadow-2xl text-sm sm:text-base lg:text-lg touch-manipulation min-h-[48px] min-w-[200px] font-bold group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="group-hover:animate-pulse">🚀</span>
                Start Your Hirys Journey!
              </span>
              <span className="ripple-effect"></span>
            </button>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 xs:mt-10 sm:mt-12 max-w-2xl mx-auto">
            <div className="card-enhanced p-4 text-center">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-bold text-sm text-emerald-400 mb-1">Daily Rewards</h3>
              <p className="text-xs text-gray-400">Claim your rewards every 24 hours</p>
            </div>
            <div className="card-enhanced p-4 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="font-bold text-sm text-blue-400 mb-1">Build Streaks</h3>
              <p className="text-xs text-gray-400">Maintain consecutive login streaks</p>
            </div>
            <div className="card-enhanced p-4 text-center">
              <div className="text-2xl mb-2">👥</div>
              <h3 className="font-bold text-sm text-purple-400 mb-1">Leaderboard</h3>
              <p className="text-xs text-gray-400">Compete with other users</p>
            </div>
          </div>
          
          {/* Footer Attribution */}
          <p className="text-xs font-normal text-gray-500/90 mt-8 xs:mt-10 sm:mt-12">
            Powered by{' '}
            <a 
              href="https://irys.xyz" 
              className="underline hover:text-emerald-400 transition-colors duration-300 font-semibold"
              target="_blank" 
              rel="noopener noreferrer"
            >
              Irys Blockchain
            </a>
          </p>
        </div>
      </>
    );
  };
  
  export default LandingPage;