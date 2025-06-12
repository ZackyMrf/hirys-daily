const StreakCounter = ({ currentStreak, bestStreak }) => {
    return (
      <div className="p-2.5 xs:p-3 sm:p-4 border border-gray-700/50 rounded-lg bg-black/30 backdrop-blur-sm flex flex-wrap xs:flex-nowrap justify-between items-center gap-2 xs:gap-3">
        <div className="flex items-center w-full xs:w-auto">
          <div className="text-xl xs:text-2xl sm:text-3xl mr-2 xs:mr-2.5 sm:mr-3">🔥</div>
          <div>
            <div className="text-xs xs:text-sm sm:text-base font-normal text-gray-200">Current Streak</div>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold text-emerald-400">{currentStreak} days</div>
          </div>
        </div>
        <div className="border-t xs:border-l border-t-gray-700/50 xs:border-t-0 pt-2 xs:pt-0 xs:pl-3 xs:ml-3 w-full xs:w-auto flex justify-between xs:block">
          <div className="text-xs xs:text-sm sm:text-base font-normal text-gray-200">Best Streak</div>
          <div className="text-base xs:text-lg sm:text-xl font-bold text-emerald-400">{bestStreak} days</div>
        </div>
      </div>
    );
  };
  
  export default StreakCounter;