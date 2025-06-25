"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail, CreditCard } from 'lucide-react';

const supportTopics = [
  {
    title: 'How to use deeplinks?',
    content: `
• Deeplinks are smart URLs that open content directly in apps
• To create one:
  - Paste your URL in the link generator
  - Choose your target platform (auto or manual)
  - Customize settings if needed
  - Copy and share your deeplink`
  },
  {
    title: 'How to upgrade?',
    content: `
• Go to Billing & Subscription
• Click "Change Plan"
• Add your payment method
• Start using premium features immediately`
  },
  {
    title: 'Where can I find my invoices?',
    content: `
• Visit the Billing & Subscription page
• Scroll to Billing History
• Click "View" next to any invoice to download
• We also email invoices monthly to your registered email`
  }
];

export default function Support() {
  const handleOpenTicket = () => {
    window.location.href = 'mailto:support@smarturlink.com?subject=Support%20Request';
  };

  return (
    <div className="w-full p-4 mx-auto space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
        Support & Help Center
      </h1>

      <div className='flex flex-col lg:flex-row gap-4 w-full'>
        <div className="w-full lg:w-9/12 space-y-6">
          {/* Common Support Topics */}
          <Card className="bg-white shadow-lg shadow-[#5e17eb]/20">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Common Support Topics</h2>
              <Accordion type="single" collapsible className="w-full">
                {supportTopics.map((topic, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-b last:border-b-0"
                  >
                    <AccordionTrigger className="text-left text-gray-700 hover:text-[#5e17eb]">
                      {topic.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 whitespace-pre-line">
                      {topic.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Card>

          {/* Contact Options */}
          <Card className='bg-white shadow-lg shadow-[#5e17eb]/20'>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Options</h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Mail
                      className="text-gray-400 w-5 h-5"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <a
                      href="mailto:support@smarturlink.com"
                      className="text-[#5e17eb] hover:underline"
                    >
                      support@smarturlink.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <CreditCard
                      className="text-gray-400 w-5 h-5"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Billing Support</p>
                    <p className="text-gray-600">
                      For billing issues, please include your account email and invoice number
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="w-full lg:w-3/12 space-y-6">
          {/* Need Help Card */}
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border border-[#5d17eb] h-full">
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
                    className="mt-4 bg-[#5e17eb] hover:bg-[#4e13c4] text-white"
                  >
                    Open a support ticket
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
