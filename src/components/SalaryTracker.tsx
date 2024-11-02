/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { CountUp as CountUpType } from 'countup.js';
import Script from 'next/script';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

import BarChartComponent from "@/components/BarChartComponent"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const data = [
  { label: "Item 1", value: 275, color: "#ff5733" },
  { label: "Item 2", value: 200, color: "#33c3ff" },
  { label: "Item 3", value: 187, color: "#85ff33" },
  { label: "Item 4", value: 173, color: "#ff33a1" },
  { label: "Item 5", value: 90, color: "#ffa733" },
]

const currencies = {
  USD: { symbol: '$', label: 'USD' },
  GBP: { symbol: '£', label: 'GBP' },
  EUR: { symbol: '€', label: 'EUR' },
  JPY: { symbol: '¥', label: 'JPY' },
  AUD: { symbol: 'A$', label: 'AUD' },
  CAD: { symbol: 'C$', label: 'CAD' },
  CHF: { symbol: 'CHF', label: 'CHF' },
  CNY: { symbol: '¥', label: 'CNY' },
  INR: { symbol: '₹', label: 'INR' },
  NZD: { symbol: 'NZ$', label: 'NZD' },
  SGD: { symbol: 'S$', label: 'SGD' },
  HKD: { symbol: 'HK$', label: 'HKD' }
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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [salaryFrequency, setSalaryFrequency] = useState<'yearly' | 'monthly' | 'daily' | 'hourly'>('yearly');
  const [countEveryDay, setCountEveryDay] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const savedSalary = localStorage.getItem('salary') || '';
    const savedCurrency = localStorage.getItem('currency') as keyof typeof currencies || 'USD';
    const savedFrequency = localStorage.getItem('salaryFrequency') as 'yearly' | 'monthly' | 'daily' | 'hourly' || 'yearly';
    const savedCountEveryDay = localStorage.getItem('countEveryDay') === 'true';
    setSalary(savedSalary);
    setCurrency(savedCurrency);
    setSalaryFrequency(savedFrequency);
    setCountEveryDay(savedCountEveryDay);
  }, []);

  const updateCounters = useCallback((earnedToday: number, earnedThisMonth: number, earnedThisYear: number) => {
    todayCounter?.update(earnedToday);
    monthCounter?.update(earnedThisMonth);
    yearCounter?.update(earnedThisYear);
  }, [todayCounter, monthCounter, yearCounter]);

  const calculateEarnings = useCallback((now: Date, yearlySalary: number) => {
    // Calculate working days in a year (excluding weekends)
    const WORKING_DAYS_IN_YEAR = 260; // 52 weeks * 5 working days
    const WORKING_DAYS_IN_MONTH = 22; // Average working days in a month

    // Adjust rates based on frequency
    let dailyRate = yearlySalary / WORKING_DAYS_IN_YEAR;
    let monthlyRate = yearlySalary / 12;

    if (salaryFrequency === 'monthly') {
        dailyRate = yearlySalary / WORKING_DAYS_IN_MONTH;
        monthlyRate = yearlySalary;
    } else if (salaryFrequency === 'daily') {
        dailyRate = yearlySalary;
        monthlyRate = dailyRate * WORKING_DAYS_IN_MONTH;
    } else if (salaryFrequency === 'hourly') {
        dailyRate = yearlySalary * 8; // 8 hours per workday
        monthlyRate = dailyRate * WORKING_DAYS_IN_MONTH;
    }

    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Only calculate earnings if it's a weekday (unless countEveryDay is true)
    const isWeekday = countEveryDay || (now.getDay() !== 0 && now.getDay() !== 6);
    const elapsedToday = now.getTime() - startTime.getTime();
    const dayProgress = elapsedToday / (24 * 60 * 60 * 1000);
    const earnedToday = isWeekday ? dailyRate * dayProgress : 0;

    // Calculate working days in current month so far
    const daysIntoMonth = Math.floor((now.getTime() - startOfMonth.getTime()) / (24 * 60 * 60 * 1000));
    const workingDaysInMonth = Array.from({ length: daysIntoMonth + 1 }).filter((_, i) => {
        const date = new Date(startOfMonth);
        date.setDate(date.getDate() + i);
        return countEveryDay || (date.getDay() !== 0 && date.getDay() !== 6);
    }).length - 1; // Subtract 1 to exclude current day
    
    // Add the current day's progress
    const currentDayProgress = dayProgress;
    const earnedThisMonth = (monthlyRate / WORKING_DAYS_IN_MONTH) * 
        (workingDaysInMonth + (isWeekday ? currentDayProgress : 0));

    // Convert input salary to yearly based on frequency
    const annualizedSalary = salaryFrequency === 'monthly' ? yearlySalary * 12
        : salaryFrequency === 'daily' ? yearlySalary * WORKING_DAYS_IN_YEAR
        : salaryFrequency === 'hourly' ? yearlySalary * 8 * WORKING_DAYS_IN_YEAR
        : yearlySalary;

    // Calculate working days in year so far
    const daysIntoYear = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const workingDaysInYear = Array.from({ length: daysIntoYear + 1 }).filter((_, i) => {
        const date = new Date(startOfYear);
        date.setDate(date.getDate() + i);
        return countEveryDay || (date.getDay() !== 0 && date.getDay() !== 6);
    }).length - 1; // Subtract 1 to exclude current day

    const earnedThisYear = (annualizedSalary / WORKING_DAYS_IN_YEAR) * 
        (workingDaysInYear + (isWeekday ? currentDayProgress : 0));

    return { earnedToday, earnedThisMonth, earnedThisYear };
  }, [salaryFrequency, countEveryDay]);

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

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

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

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('salaryFrequency', salaryFrequency);
    }
  }, [salaryFrequency, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('countEveryDay', countEveryDay.toString());
    }
  }, [countEveryDay, isMounted]);

  const handleScriptLoad = () => {
    setIsScriptLoaded(true);
  };

  // const handleStartClick = () => {
  //   const yearlySalary = parseFloat(salary);
  //   if (!yearlySalary || yearlySalary <= 0) {
  //     alert('Please enter a valid yearly salary');
  //     return;
  //   }
  //   startCounter();
  // };

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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
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
              <Select
                value={salaryFrequency}
                onValueChange={(value) => setSalaryFrequency(value as 'yearly' | 'monthly' | 'daily' | 'hourly')}
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Salary Frequency" />
                </SelectTrigger>
                <SelectContent>
                  {['yearly', 'monthly', 'daily', 'hourly'].map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Toggle
                pressed={countEveryDay}
                onPressedChange={setCountEveryDay}
                aria-label="Count every day"
              >
                Count weekends
              </Toggle>
              {/* <Button onClick={handleStartClick}>
                Start Counter
              </Button> */}
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
          {/* <CardContent>
            <BarChartComponent 
              data={data}
              xKey="value" // Key representing values in the chart
              yKey="label" // Key representing labels/categories in the chart
              title="Custom Bar Chart"
              description="Data Representation for Items"
              />
          </CardContent> */}
        </Card>
      </div>

    </>
  );
};

export default SalaryTracker;