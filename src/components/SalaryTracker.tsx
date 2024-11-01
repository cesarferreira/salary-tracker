import { useState, useEffect } from 'react';
import { CountUp as CountUpType } from 'countup.js';
import Script from 'next/script';

const currencies = {
  USD: { symbol: '$', label: 'USD' },
  GBP: { symbol: '£', label: 'GBP' },
  EUR: { symbol: '€', label: 'EUR' }
};

const getStorageValue = (key: string, defaultValue: string): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    return saved || defaultValue;
  }
  return defaultValue;
};

const SalaryTracker = () => {
  const [salary, setSalary] = useState<string>('');
  const [currency, setCurrency] = useState<keyof typeof currencies>('USD');
  const [todayCounter, setTodayCounter] = useState<CountUpType | null>(null);
  const [monthCounter, setMonthCounter] = useState<CountUpType | null>(null);
  const [yearCounter, setYearCounter] = useState<CountUpType | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('00:00:00');
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setSalary(getStorageValue('salary', ''));
    setCurrency(getStorageValue('currency', 'USD') as keyof typeof currencies);
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('salary', salary);
    }
  }, [salary, isClient]);

  useEffect(() => {
    if (isClient && isScriptLoaded) {
      localStorage.setItem('currency', currency);
      initializeCounters();
    }
  }, [currency, isClient, isScriptLoaded]);

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  const initializeCounters = () => {
    if (typeof window === 'undefined' || !isScriptLoaded) return;

    const options = {
      decimalPlaces: 2,
      duration: 1,
      useEasing: true,
      useGrouping: true,
      separator: ',',
      decimal: '.',
      prefix: currencies[currency].symbol,
      suffix: ''
    };

    const today = new (window as any).countUp.CountUp('todayEarnings', 0, options);
    const month = new (window as any).countUp.CountUp('monthEarnings', 0, options);
    const year = new (window as any).countUp.CountUp('yearEarnings', 0, options);

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

  useEffect(() => {
    if (isClient && isScriptLoaded) {
      initializeCounters();
      if (salary) {
        startCounter();
      }
    }
  }, [isScriptLoaded, isClient]);

  const handleScriptLoad = () => {
    setIsScriptLoaded(true);
  };

  const startCounter = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    const yearlySalary = parseFloat(salary);
    if (!yearlySalary || yearlySalary <= 0) {
      alert('Please enter a valid yearly salary');
      return;
    }

    const dailyRate = yearlySalary / 365;
    const monthlyRate = yearlySalary / 12;

    const now = new Date();
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const updateCounter = () => {
      const currentTime = new Date();

      const elapsedToday = currentTime - startTime;
      const dayProgress = elapsedToday / (24 * 60 * 60 * 1000);
      const earnedToday = dailyRate * dayProgress;

      const daysIntoMonth = (currentTime - startOfMonth) / (24 * 60 * 60 * 1000);
      const earnedThisMonth = (monthlyRate / 30) * daysIntoMonth;

      const daysIntoYear = (currentTime - startOfYear) / (24 * 60 * 60 * 1000);
      const earnedThisYear = (yearlySalary / 365) * daysIntoYear;

      todayCounter?.update(earnedToday);
      monthCounter?.update(earnedThisMonth);
      yearCounter?.update(earnedThisYear);

      const timeString = currentTime.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(timeString);
    };

    updateCounter();
    const newIntervalId = setInterval(updateCounter, 1000);
    setIntervalId(newIntervalId);
  };

  if (!isClient) {
    return null;
  }

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/countup.js/2.8.0/countUp.umd.min.js" 
        onLoad={handleScriptLoad}
        strategy="afterInteractive"
      />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
            Salary Tracker
          </h1>
          
          <div className="flex gap-2 mb-8 justify-center flex-wrap">
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="Enter yearly salary"
              className="px-4 py-2 border rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-lg"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as keyof typeof currencies)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-lg"
            >
              {Object.entries(currencies).map(([code, { label }]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
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
              <div className="text-4xl font-bold text-green-700"><span id="todayEarnings">0.00</span></div>
              <div className="text-xl text-gray-700 mt-2">{currentTime}</div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="text-base text-gray-700 font-medium mb-2">This Month's Earnings</div>
              <div className="text-4xl font-bold text-green-700"><span id="monthEarnings">0.00</span></div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="text-base text-gray-700 font-medium mb-2">This Year's Earnings</div>
              <div className="text-4xl font-bold text-green-700"><span id="yearEarnings">0.00</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalaryTracker;