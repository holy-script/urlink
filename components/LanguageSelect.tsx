"use client";

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import { Check } from 'lucide-react';

const languages = [
  { value: "EN", label: "English" },
  { value: "IT", label: "Italian" },
  { value: "DE", label: "German" },
  { value: "FR", label: "French" },
  { value: "ES", label: "Spanish" },
];

export const LanguageSelect = () => {
  const [lang, setLang] = useState("EN");
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(lang);

  const handleSelect = (value: string) => {
    setSelectedValue(value); // Update the visual selection immediately

    // Delay closing the dropdown and updating the actual value
    setTimeout(() => {
      setLang(value);
      setOpen(false);
    }, 150); // 150ms delay provides a good balance for visual feedback
  };

  // Reset selectedValue when dropdown opens/closes
  useEffect(() => {
    if (open) {
      setSelectedValue(lang);
    }
  }, [open, lang]);

  return (
    <Select value={lang} onValueChange={setLang} open={open} onOpenChange={setOpen}>
      <SelectTrigger className="bg-[#5e17eb] rounded-lg text-white text-base md:text-xl flex items-center gap-1 md:gap-2 w-[90px] md:w-fit h-9 md:h-10 pl-2 md:pl-4 pr-1 md:pr-2 focus:ring-0 border-white">
        <svg width="20" height="20" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6">
          <path d="M13.0001 25C16.5568 25 19.4401 19.6274 19.4401 13C19.4401 6.37258 16.5568 1 13.0001 1C9.44334 1 6.56006 6.37258 6.56006 13C6.56006 19.6274 9.44334 25 13.0001 25Z" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 17.8H24M2 8.2H24M13 1V25" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 25C19.6274 25 25 19.6274 25 13C25 6.37258 19.6274 1 13 1C6.37258 1 1 6.37258 1 13C1 19.6274 6.37258 25 13 25Z" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-bold text-sm md:text-base">{lang}</span>
      </SelectTrigger>
      <SelectContent className="rounded-xl md:rounded-2xl shadow-lg mt-1 md:mt-2 bg-white p-1 md:p-2 z-30 min-w-[150px] md:min-w-[200px]">
        {languages.map(({ value, label }) => (
          <div
            key={value}
            className={`flex items-center justify-between px-2 py-1 cursor-pointer rounded-md transition-colors duration-150 ${value === selectedValue
              ? "bg-[rgb(94,23,235,0.15)] text-[#5e17eb]"
              : "text-[#4f4f4f] hover:bg-[#f7f7f7]"
              }`}
            onClick={() => handleSelect(value)}
          >
            <div className="flex items-center gap-1 md:gap-2 text-base md:text-xl">
              <span className="font-bold">{value}</span>
              <span className="text-sm md:text-base">- {label}</span>
            </div>
            {value === selectedValue && (
              <Check size={16} className="ml-2" />
            )}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
};
