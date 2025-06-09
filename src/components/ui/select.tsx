'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoChevronDown, IoCheckmark } from 'react-icons/io5';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({ value, onValueChange, options, placeholder, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-left
                 flex items-center justify-between group
                 hover:border-blue-400 focus:outline-none focus:border-blue-500 focus:ring-2 
                 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200"
      >
        <span className={`text-sm ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400 group-hover:text-gray-600"
        >
          <IoChevronDown className="h-5 w-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
                     overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onValueChange(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-blue-50 flex items-center
                           justify-between transition-colors duration-150"
                >
                  <span className={`${value === option.value ? 'text-blue-600' : 'text-gray-700'}`}>
                    {option.label}
                  </span>
                  {value === option.value && (
                    <IoCheckmark className="h-5 w-5 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 