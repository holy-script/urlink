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

const faqItems = [
  {
    question: "How do I create a deep link?",
    answer: "Simply paste your URL in the link generator, and we'll automatically create a deep link that works across all platforms. We support major platforms like Instagram, TikTok, YouTube, and more."
  },
  {
    question: "What's included in the free plan?",
    answer: "The free plan includes 500 clicks per month, unlimited link creation, and basic analytics. You can track clicks, geographic data, and device types without any cost."
  },
  {
    question: "How does the pay-per-click billing work?",
    answer: "You only pay for clicks beyond your free monthly limit. Each additional click costs €0.003, and you're billed monthly only for what you use. No fixed fees or hidden costs."
  },
  {
    question: "Can I customize my deep links?",
    answer: "Yes! You can add UTM parameters, customize fallback URLs, and set specific behaviors for different platforms. This helps you track campaign performance and improve user experience."
  },
  {
    question: "What happens if I reach my click limit?",
    answer: "If you're on the free plan and reach 500 clicks, you'll need to upgrade to continue receiving clicks. For paid users, you'll be billed automatically for additional clicks at the end of your billing cycle."
  },
  {
    question: "How do I track link performance?",
    answer: "Your dashboard shows real-time analytics including total clicks, geographic distribution, device types, and conversion rates. You can export data and integrate with popular analytics platforms."
  }
];

export default function FAQ() {
  const handleOpenTicket = () => {
    window.location.href = 'mailto:support@urlink.io?subject=Support%20Request';
  };

  return (
    <div className="w-full p-4 mx-auto">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
        Frequently Asked Questions
      </h1>

      <Card className="bg-white p-6 mb-12">
        <Accordion type="single" collapsible className="space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border rounded-lg px-4 py-2 border-gray-200"
            >
              <AccordionTrigger className="text-base lg:text-lg font-medium text-gray-900 hover:text-[#5e17eb]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      {/* Support Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-none">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white rounded-full">
              <Mail className="w-6 h-6 text-[#5e17eb]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">Need help?</h2>
              <p className="mt-2 text-gray-600">
                Our support team is here to help you get the most out of URLINK.
                Reach out anytime or browse our resources below.
              </p>
              <Button
                onClick={handleOpenTicket}
                className="mt-4 bg-[#5e17eb] hover:bg-[#4e13c4]"
              >
                Open a support ticket
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
