"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { CountUp as CountUpType } from 'countup.js';
import Script from 'next/script';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const currencies = {
  USD: { symbol: '$', label: 'USD' },
  GBP: { symbol: '£', label: 'GBP' },
  EUR: { symbol: '€', label: 'EUR' }
};

const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const SalaryTracker = () => {
  const [salary, setSalary] = useState<string>('');
  const [currency, setCurrency] = useState<keyof typeof currencies>('USD');
  const [todayCounter, setTodayCounter] = useState<CountUpType | null>(null);
  const [monthCounter, setMonthCounter] = useState<CountUpType | null>(null);
  const [yearCounter, setYearCounter] = useState<CountUpType | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const timerRef = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const savedSalary = localStorage.getItem('salary') || '';
    const savedCurrency = localStorage.getItem('currency') as keyof typeof currencies || 'USD';
    setSalary(savedSalary);
    setCurrency(savedCurrency);
  }, []);

  const updateCounters = useCallback((earnedToday: number, earnedThisMonth: number, earnedThisYear: number) => {
    todayCounter?.update(earnedToday);
    monthCounter?.update(earnedThisMonth);
    yearCounter?.update(earnedThisYear);
  }, [todayCounter, monthCounter, yearCounter]);

  const calculateEarnings = useCallback((now: Date, yearlySalary: number) => {
    const dailyRate = yearlySalary / 365;
    const monthlyRate = yearlySalary / 12;
    const daysInCurrentMonth = getDaysInMonth(now);

    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const elapsedToday = now.getTime() - startTime.getTime();
    const dayProgress = elapsedToday / (24 * 60 * 60 * 1000);
    const earnedToday = dailyRate * dayProgress;

    const daysIntoMonth = (now.getTime() - startOfMonth.getTime()) / (24 * 60 * 60 * 1000);
    const earnedThisMonth = (monthlyRate / daysInCurrentMonth) * daysIntoMonth;

    const daysIntoYear = (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000);
    const earnedThisYear = (yearlySalary / 365) * daysIntoYear;

    return { earnedToday, earnedThisMonth, earnedThisYear };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const startCounter = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const yearlySalary = parseFloat(salary);
    if (!yearlySalary || yearlySalary <= 0) {
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const { earnedToday, earnedThisMonth, earnedThisYear } = calculateEarnings(now, yearlySalary);
      updateCounters(earnedToday, earnedThisMonth, earnedThisYear);
      setCurrentTime(formatTime(now));
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [salary, updateCounters, calculateEarnings]);

  const initializeCounters = useCallback(() => {
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

    try {
      const CountUp = (window as any).countUp.CountUp;
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
      }
    } catch (error) {
      console.error('Error initializing counters:', error);
    }
  }, [currency, isScriptLoaded]);

  useEffect(() => {
    if (isScriptLoaded && isMounted) {
      initializeCounters();
    }
  }, [isScriptLoaded, initializeCounters, isMounted]);

  useEffect(() => {
    if (todayCounter && salary && isScriptLoaded && isMounted) {
      return startCounter();
    }
  }, [todayCounter, salary, isScriptLoaded, startCounter, isMounted]);

  useEffect(() => {
    if (isMounted && salary) {
      localStorage.setItem('salary', salary);
    }
  }, [salary, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('currency', currency);
    }
  }, [currency, isMounted]);

  const handleScriptLoad = () => {
    setIsScriptLoaded(true);
  };

  const handleStartClick = () => {
    const yearlySalary = parseFloat(salary);
    if (!yearlySalary || yearlySalary <= 0) {
      alert('Please enter a valid yearly salary');
      return;
    }
    startCounter();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/countup.js/2.8.0/countUp.umd.min.js" 
        onLoad={handleScriptLoad}
        strategy="afterInteractive"
      />
      <div className="min-h-screen bg-gray-100/40 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Salary Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-8 justify-center flex-wrap">
              <Input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Enter yearly salary"
                className="w-56"
              />
              <Select
                value={currency}
                onValueChange={(value) => setCurrency(value as keyof typeof currencies)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currencies).map(([code, { label }]) => (
                    <SelectItem key={code} value={code}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleStartClick}>
                Start Counter
              </Button>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-base text-muted-foreground font-medium mb-2">
                    Today's Earnings
                  </div>
                  <div className="text-4xl font-bold text-green-700">
                    <span id="todayEarnings">0.00</span>
                  </div>
                  <div className="text-xl text-muted-foreground mt-2">
                    {currentTime}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-base text-muted-foreground font-medium mb-2">
                    This Month's Earnings
                  </div>
                  <div className="text-4xl font-bold text-green-700">
                    <span id="monthEarnings">0.00</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-base text-muted-foreground font-medium mb-2">
                    This Year's Earnings
                  </div>
                  <div className="text-4xl font-bold text-green-700">
                    <span id="yearEarnings">0.00</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SalaryTracker;