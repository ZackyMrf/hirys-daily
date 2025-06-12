const Footer = () => {
    return (
      <footer className="w-full backdrop-blur-md bg-black/10 border-t border-gray-700/30">
        <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4 sm:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-3 xs:mb-4">
            <div className="mb-3 xs:mb-4 md:mb-0 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start">
                <span className="text-base xs:text-lg sm:text-xl font-bold text-emerald-400">Hirys!</span>
                <span className="text-xs sm:text-sm ml-2 font-normal text-gray-300/90">Your daily onchain</span>
              </div>
              <p className="text-xs font-normal text-gray-400/90 mt-1 xs:mt-1.5 sm:mt-2">
                don't forget to say Hirys!
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <div className="flex space-x-2 xs:space-x-3 sm:space-x-4 mb-1.5 xs:mb-2">
                <a href="https://x.com/zackymrf_" className="text-xs sm:text-sm font-normal text-gray-300/90 hover:text-emerald-400 transition-colors touch-manipulation px-1.5 py-1" target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href="https://discord.com/zackymrf" className="text-xs sm:text-sm font-normal text-gray-300/90 hover:text-emerald-400 transition-colors touch-manipulation px-1.5 py-1" target="_blank" rel="noopener noreferrer">Discord</a>
                <a href="https://github.com/zackymrf" className="text-xs sm:text-sm font-normal text-gray-300/90 hover:text-emerald-400 transition-colors touch-manipulation px-1.5 py-1" target="_blank" rel="noopener noreferrer">GitHub</a>
              </div>
              <div className="flex items-center">
                <span className="text-xs sm:text-sm font-normal text-gray-300/90">Created by</span>
                <span className="text-xs sm:text-sm ml-2 text-emerald-400 font-bold">Zackymrf</span>
              </div>
            </div>
          </div>
          <div className="text-center border-t border-gray-700/30 pt-2.5 xs:pt-3 sm:pt-4">
            <p className="text-xs font-normal text-gray-400/90">
              Powered by <a href="https://irys.xyz" className="text-gray-300/90 hover:text-emerald-400 transition-colors touch-manipulation" target="_blank" rel="noopener noreferrer">Irys</a> • © {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;