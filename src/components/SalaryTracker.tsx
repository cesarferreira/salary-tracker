import { useState, useEffect } from 'react';
import { CountUp as CountUpType } from 'countup.js';

const SalaryTracker = () => {
  const [salary, setSalary] = useState<string>('');
  const [todayCounter, setTodayCounter] = useState<CountUpType | null>(null);
  const [monthCounter, setMonthCounter] = useState<CountUpType | null>(null);
  const [yearCounter, setYearCounter] = useState<CountUpType | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('00:00:00');
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  useEffect(() => {
    // Initialize counters when component mounts
    const options = {
      decimalPlaces: 2,
      duration: 1,
      useEasing: true,
      useGrouping: true,
      separator: ',',
      decimal: '.',
      prefix: '',
      suffix: ''
    };

    const initializeCounter = async () => {
      const countUpModule = await import('countup.js');
      const CountUp = countUpModule.CountUp;

      const today = new CountUp('todayEarnings', 0, options);
      const month = new CountUp('monthEarnings', 0, options);
      const year = new CountUp('yearEarnings', 0, options);

      if (!today.error) {
        today.start();
        month.start();
        year.start();

        setTodayCounter(today);
        setMonthCounter(month);
        setYearCounter(year);
      } else {
        console.error(today.error);
      }
    };

    initializeCounter();
  }, []);

  const startCounter = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    const yearlySalary = parseFloat(salary);
    if (!yearlySalary || yearlySalary <= 0) {
      alert('Please enter a valid yearly salary');
      return;
    }

    // Calculate rates
    const dailyRate = yearlySalary / 365;
    const monthlyRate = yearlySalary / 12;

    // Get current time and start of periods
    const now = new Date();
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const updateCounter = () => {
      const currentTime = new Date();

      // Calculate earnings
      const elapsedToday = currentTime.getTime() - startTime.getTime();
      const dayProgress = elapsedToday / (24 * 60 * 60 * 1000);
      const earnedToday = dailyRate * dayProgress;

      const daysIntoMonth = (currentTime.getTime() - startOfMonth.getTime()) / (24 * 60 * 60 * 1000);
      const earnedThisMonth = (monthlyRate / 30) * daysIntoMonth;

      const daysIntoYear = (currentTime.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000);
      const earnedThisYear = (yearlySalary / 365) * daysIntoYear;

      // Update counters
      todayCounter?.update(earnedToday);
      monthCounter?.update(earnedThisMonth);
      yearCounter?.update(earnedThisYear);

      // Update time display
      const timeString = currentTime.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(timeString);
    };

    // Update immediately and then every second
    updateCounter();
    const newIntervalId = setInterval(updateCounter, 1000);
    setIntervalId(newIntervalId);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Salary Tracker
        </h1>
        
        <div className="flex gap-2 mb-8 justify-center">
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="Enter yearly salary"
            className="px-4 py-2 border rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-lg"
          />
          <button
            onClick={startCounter}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
          >
            Start Counter
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="text-base text-gray-700 font-medium mb-2">Today's Earnings</div>
            <div className="text-4xl font-bold text-green-700">$<span id="todayEarnings">0.00</span></div>
            <div className="text-xl text-gray-700 mt-2">{currentTime}</div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="text-base text-gray-700 font-medium mb-2">This Month's Earnings</div>
            <div className="text-4xl font-bold text-green-700">$<span id="monthEarnings">0.00</span></div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="text-base text-gray-700 font-medium mb-2">This Year's Earnings</div>
            <div className="text-4xl font-bold text-green-700">$<span id="yearEarnings">0.00</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryTracker;