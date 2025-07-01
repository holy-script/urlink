"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';

export default function FAQ() {
  const t = useTranslations('FAQ');

  // Define keys for the FAQ items
  const faqKeys = ['0', '1', '2', '3', '4', '5'] as const;

  const handleOpenTicket = () => {
    window.location.href = 'mailto:support@urlink.io?subject=Support%20Request';
  };

  return (
    <div className="w-full p-4 mx-auto">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
        {t('title')}
      </h1>

      <div className='flex flex-col lg:flex-row gap-4'>
        {/* FAQ Accordion Card */}
        <Card className="bg-white p-6 mb-12 lg:mb-0 shadow-lg shadow-[#5e17eb]/20 w-full lg:w-9/12">
          <Accordion type="single" collapsible className="space-y-4">
            {faqKeys.map((key, index) => (
              <AccordionItem
                key={key}
                value={`item-${index}`}
                className="border rounded-lg px-4 py-2 border-gray-200"
              >
                <AccordionTrigger className="text-base lg:text-lg font-medium text-gray-900 hover:text-[#5e17eb] text-left">
                  {t(`items.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2 text-left">
                  {t(`items.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Support Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border border-[#5d17eb] w-full lg:w-3/12">
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white rounded-full">
                <Mail className="w-6 h-6 text-[#5e17eb]" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{t('support.title')}</h2>
                <p className="mt-2 text-gray-600">
                  {t('support.description')}
                </p>
                <Button
                  onClick={handleOpenTicket}
                  className="mt-4 bg-[#5e17eb] hover:bg-[#4e13c4] text-white"
                >
                  {t('support.button')}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
