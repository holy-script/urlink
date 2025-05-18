"use client";

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import { Check } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';

// Define language mapping between locale codes and display values
// Only including English and Italian
const languages = [
  { value: "en", label: "English", display: "EN" },
  { value: "it", label: "Italian", display: "IT" },
];

export const LanguageSelect = () => {
  // Get the current locale from next-intl
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Find the display value for the current locale
  const currentLanguage = languages.find(lang => lang.value === locale) || languages[0];

  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(currentLanguage.display);

  // Update selectedValue when locale changes
  useEffect(() => {
    const lang = languages.find(lang => lang.value === locale);
    if (lang) {
      setSelectedValue(lang.display);
    }
  }, [locale]);

  const handleSelect = (displayValue: string) => {
    setSelectedValue(displayValue); // Update the visual selection immediately

    // Find the locale code that corresponds to the selected display value
    const selectedLang = languages.find(lang => lang.display === displayValue);

    if (selectedLang) {
      // Delay closing the dropdown and updating the actual value
      setTimeout(() => {
        // Navigate to the same pathname but with the new locale
        router.push(pathname, { locale: selectedLang.value });
        setOpen(false);
      }, 150);
    }
  };

  return (
    <Select
      value={currentLanguage.display}
      onValueChange={(value) => handleSelect(value)}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger className="bg-[#5e17eb] rounded-lg text-white text-base md:text-xl flex items-center gap-1 md:gap-2 w-[90px] md:w-fit h-9 md:h-10 pl-2 md:pl-4 pr-1 md:pr-2 focus:ring-0 border-white">
        <svg width="20" height="20" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6">
          <path d="M13.0001 25C16.5568 25 19.4401 19.6274 19.4401 13C19.4401 6.37258 16.5568 1 13.0001 1C9.44334 1 6.56006 6.37258 6.56006 13C6.56006 19.6274 9.44334 25 13.0001 25Z" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 17.8H24M2 8.2H24M13 1V25" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 25C19.6274 25 25 19.6274 25 13C25 6.37258 19.6274 1 13 1C6.37258 1 1 6.37258 1 13C1 19.6274 6.37258 25 13 25Z" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-bold text-sm md:text-base">{currentLanguage.display}</span>
      </SelectTrigger>
      <SelectContent className="rounded-xl md:rounded-2xl shadow-lg mt-1 md:mt-2 bg-white p-1 md:p-2 z-30 min-w-[150px] md:min-w-[200px]">
        {languages.map(({ value, label, display }) => (
          <div
            key={value}
            className={`flex items-center justify-between px-2 py-1 cursor-pointer rounded-md transition-colors duration-150 ${display === selectedValue
              ? "bg-[rgb(94,23,235,0.15)] text-[#5e17eb]"
              : "text-[#4f4f4f] hover:bg-[#f7f7f7]"
              }`}
            onClick={() => handleSelect(display)}
          >
            <div className="flex items-center gap-1 md:gap-2 text-base md:text-xl">
              <span className="font-bold">{display}</span>
              <span className="text-sm md:text-base">- {label}</span>
            </div>
            {display === selectedValue && (
              <Check size={16} className="ml-2" />
            )}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
};
