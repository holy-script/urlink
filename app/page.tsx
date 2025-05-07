import React, { JSX } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { SignupModal } from "@/components/SignupModal";

const featureData = [
  {
    feature: "Free activation",
    URLINK: "✅ Yes",
    competitors: "❌ No, often paid",
  },
  {
    feature: "Initial free clicks",
    URLINK: "✅ 500",
    competitors: "❌ No free credit",
  },
  {
    feature: "Payment model",
    URLINK: "✅ PPC – Pay only for received clicks",
    competitors: "❌ Fixed subscription or hidden costs",
  },
  {
    feature: "Free UTM management",
    URLINK: "✅ Included",
    competitors: "❌ Often paid service",
  },
  {
    feature: "Intuitive interface",
    URLINK: "✅ Clean and simple design",
    competitors: "❌ Complex or outdated",
  },
  {
    feature: "Marketing optimization",
    URLINK: "✅ Advanced and customizable tracking",
    competitors: "❌ Limited or extra cost",
  },
];

const faqData = [
  {
    question: "Is URLINK really free?",
    answer: "Yes! Start with 500 free clicks and only pay for additional clicks when you need them. No subscription required."
  },
  {
    question: "How does the PPC payment system work?",
    answer: "Pay-per-click means you only pay for actual clicks beyond your free limit. Each additional click costs €0.003, billed monthly."
  },
  {
    question: "Can I track my link performance?",
    answer: "Yes! Get detailed analytics including click counts, geographic data, and device types in real-time."
  },
  {
    question: "Does URLINK support deep linking?",
    answer: "Yes, we support deep linking for major platforms including Instagram, TikTok, YouTube, and more."
  },
  {
    question: "Is there a limit to the number of links I can create?",
    answer: "No, create unlimited links! You only pay for clicks, not link creation."
  },
  {
    question: "Can I customize the generated links?",
    answer: "Yes, customize your links with UTM parameters and set specific behaviors for different platforms."
  },
  {
    question: "Does URLINK work with ad campaigns?",
    answer: "Absolutely! URLINK is perfect for tracking and optimizing ad campaigns across all platforms."
  },
  {
    question: "How can I get started?",
    answer: "Simply sign up for free, paste your first link, and start tracking! No credit card required."
  },
];

const testimonialData = [
  {
    highlighted: "Finally a deeplink service that doesn’t force you into a fixed subscription!",
    content: " With Urlink, I can manage my links smartly and only pay for actual clicks. The free UTM management is an incredible added value!",
    author: "Marco R.",
    image: "/image-2.png"
  }
];

const benefitsData = [
  {
    id: 1,
    title: "Better user experience",
    description:
      "Take users directly to the desired content inside an app or site, reducing unnecessary steps and increasing engagement.",
  },
  {
    id: 2,
    title: "Higher conversions",
    description:
      "Easier access to specific pages, such as products or promotions, improving purchase or action completion rates.",
  },
  {
    id: 3,
    title: "Marketing optimization",
    description:
      "Track user behavior and optimize ads, emails, or push notifications with direct and personalized links.",
  },
  {
    id: 4,
    title: "Free UTM management",
    description:
      "With URLINK you can create, track and analyze UTMs at no cost, unlike many competitors who charge for this service.",
  },
];

const pricingFeatures = [
  "Free activation",
  "500 initial free clicks",
  "UTM management included and free",
  "You pay only for received clicks",
  "Simple and fast interface",
];

// ************ SECTION COMPONENTS ************

function HeaderSection() {
  return (
    <header className="flex justify-between items-center px-36">
      <div className="flex items-center">
        <img className="w-12 h-12" alt="Group" src="/group-3.png" />
        <span className="ml-4 font-['Verdana-Bold'] font-bold text-white text-[41px] tracking-[-0.41px]">
          URLINK
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" className="text-white text-xl hover:bg-[#5418CD]">
          FAQ
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            className="bg-[#5e17eb] rounded-lg text-white text-xl flex items-center gap-2"
          >
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.0001 25C16.5568 25 19.4401 19.6274 19.4401 13C19.4401 6.37258 16.5568 1 13.0001 1C9.44334 1 6.56006 6.37258 6.56006 13C6.56006 19.6274 9.44334 25 13.0001 25Z" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17.8H24M2 8.2H24M13 1V25" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13 25C19.6274 25 25 19.6274 25 13C25 6.37258 19.6274 1 13 1C6.37258 1 1 6.37258 1 13C1 19.6274 6.37258 25 13 25Z" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            EN
            <img className="w-3.5 h-[7px]" alt="Vector" src="/vector-2-1.svg" />
          </Button>
        </div>
        <Button variant="ghost" className="bg-[#5e17eb] text-white text-xl hover:bg-[#5418CD]">
          Log in
        </Button>
        <Button variant="outline" className="border-white text-white text-xl hover:bg-white hover:text-[#5e17eb]">
          <Link href="/signup">
            Register free
          </Link>
        </Button>
      </div>
    </header>
  );
}

function UrlShortenerForm() {
  return (
    <div className="flex flex-col items-center mt-24">
      <Card className="w-1/2 h-fit bg-white rounded-2xl shadow-ombra">
        <CardContent>
          <div className="flex flex-col items-center pt-12 px-8">
            <h2 className="font-bold text-[#4e4e4e] text-2xl text-center tracking-[-0.24px]">
              Paste your loooong link below.
            </h2>
            <p className="font-normal text-[#4e4e4e] text-xl text-center tracking-[-0.20px] mt-2">
              <span className="tracking-[-0.04px]">
                We’ll shorten it for you.{" "}
              </span>
              <span className="tracking-[-0.04px] underline">Free</span>
              <span className="tracking-[-0.04px]">.</span>
            </p>

            <div className="mt-8 w-full relative">
              <Input
                className="h-[72px] bg-[#f7f7f7] rounded-2xl pl-10 text-xl text-[#5e17eb] placeholder:text-[#a9a9a9] border-2 border-[#f7f7f7] focus:border-[#5e17eb]"
                placeholder="Paste here"
              />
              {/* <img
                className="absolute w-px h-10 top-4 left-5 object-cover"
                alt="Line"
                src="/line-1.svg"
              /> */}
            </div>

            <SignupModal />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative w-full h-[1489px]">
      <div className="w-full h-fit bg-[#5e17eb] rounded-[0px_0px_40px_40px] py-16">
        <HeaderSection />
        <div className="mt-8">
          <h1 className="font-bold text-[#f7f7f7] text-5xl text-center tracking-[-0.48px] leading-[64px]">
            <div>
              Create your deeplink now and
            </div>
            <div>
              start making{" "}
              <span className="relative group">
                <span className="relative z-10">
                  <span className="relative"></span>
                  $money
                  <div
                    className="absolute bottom-0 left-1 w-full h-[2px] bg-white transition-[height,background-color] duration-300 ease-in-out group-hover:h-[5px] group-hover:bg-[#42c97a]"
                  />
                </span>
                <span className="ml-2 inline-block group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300 ease-in-out">
                  🤑
                </span>
              </span>
            </div>
          </h1>
        </div>
        <UrlShortenerForm />
        <div className="mt-10">
          <p className="font-semibold text-white text-xl text-center tracking-[-0.20px]">
            Sign up for free and get:
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-xl border border-[#42c97a] flex items-center justify-center">
                <img className="w-3.5 h-2.5" alt="Layer" src="/layer2.svg" />
              </div>
              <span className="ml-2 font-light text-white text-xl">
                Unlimited links
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-xl border border-[#42c97a] flex items-center justify-center">
                <img className="w-3.5 h-2.5" alt="Layer" src="/layer2.svg" />
              </div>
              <span className="ml-2 font-light text-white text-xl">
                500 free clicks
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-xl border border-[#42c97a] flex items-center justify-center">
                <img className="w-3.5 h-2.5" alt="Layer" src="/layer2.svg" />
              </div>
              <span className="ml-2 font-light text-white text-xl">
                UTMs included
              </span>
            </div>
          </div>
        </div>
        <div className="mt-10 w-full flex flex-col justify-center items-center">
          <Image width={14} height={7} className="w-[14px] h-[7px]" alt="Vector" src="/vector-6.svg" />
          <div className="inline-flex items-center gap-3 pl-1 pr-4 py-1 bg-[#f7f7f7] rounded-[56px] w-fit mt-2">
            <Image width={48} height={48} className="w-12 h-12 object-cover rounded-full" alt="Image" src="/image.png" />
            <div>
              <p className="font-medium text-[#200062] text-sm tracking-[-0.14px]">
                Best deeplink tool I’ve ever used. Well done 👏
              </p>
              <p className="font-normal text-[#200062] text-sm">
                Antonio M. - NoProb CEO
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center w-full mt-14 px-36">
          <img className="h-8" alt="Group" src="/group-12.png" />
          <img className="h-8" alt="Group" src="/group-14.png" />
          <img className="h-12" alt="Group" src="/group-16.png" />
          <img className="h-8" alt="Group" src="/group-13.png" />
          <img className="h-10" alt="Group" src="/group-15.png" />
          <img className="h-8" alt="Group" src="/group-17.png" />
        </div>
      </div>
      {/* Floating callout text and emoji */}
      <div className="flex flex-col">
        <h2 className="font-extrabold text-[#5e17eb] text-5xl text-center tracking-[-0.48px] leading-[64px] mt-24">
          Ok, but what are the <br /> benefits of URLINK?
        </h2>
        <div className="flex flex-row items-center justify-evenly mt-12">
          <span className="font-bold text-[#4e4e4e] text-8xl tracking-[-0.96px]">
            🚀
          </span>
          <p className="font-normal text-[#4e4e4e] text-xl text-center tracking-[-0.20px]">
            URLINK makes browsing faster and more effective with <br /> smart deeplinks,
            improving user experience, <br /> conversions, and marketing campaigns.
          </p>
          <span className="font-bold text-[#4e4e4e] text-8xl tracking-[-0.96px]">
            🤯
          </span>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="relative mt-14 px-36">
      <div className="grid grid-cols-3 gap-16 mt-16">
        {benefitsData.slice(0, 3).map((benefit) => (
          <div key={benefit.id} className="flex flex-col items-center">
            <span className="font-bold text-[#5e17eb] text-[40px] text-center tracking-[-0.40px]">
              {benefit.id}
            </span>
            <h3 className="font-bold text-[#4e4e4e] text-2xl text-center tracking-[-0.24px] mt-4">
              {benefit.title}
            </h3>
            <p className="font-normal text-[#4e4e4e] text-xl text-center tracking-[-0.20px] mt-4">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-center items-center mt-16">
        <div className="inline-flex items-center justify-center p-2 w-fit bg-[#5e17eb] mb-8">
          <h2 className="font-bold text-[#f7f7f7] text-[40px] text-center tracking-[-0.40px]">
            Here’s a special tip for you
          </h2>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-[#5e17eb] text-[40px] text-center tracking-[-0.40px]">
            4
          </span>
          <h3 className="font-bold text-[#4e4e4e] text-2xl text-center tracking-[-0.24px] mt-4">
            {benefitsData[3].title}
          </h3>
          <p className="font-normal text-[#4e4e4e] text-xl text-center tracking-[-0.20px] mt-4 w-[420px]">
            {benefitsData[3].description}
          </p>
        </div>
      </div>
      <div className="flex justify-center mt-16">
        <span className="font-bold text-[#4e4e4e] text-8xl text-center tracking-[-0.96px]">
          🫶
        </span>
      </div>
      {/* <div className="flex justify-center mt-16">
        <Button className="bg-[#42c97a] text-white text-xl">
          Create your free account now
        </Button>
      </div> */}
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="mt-[100px] px-36">
      <div className="bg-[#f7f7f7] rounded-[32px] shadow-ombra p-10">
        <h2 className="font-extrabold text-[#5e17eb] text-5xl text-center tracking-[-0.48px] leading-[64px] mb-16">
          How does URLINK differ from competitors?
        </h2>
        <div className="flex">
          <div className="w-[396px] flex flex-col justify-between py-10">
            <div className="font-bold text-transparent text-2xl">
              Feature
            </div>
            {featureData.map((item, index) => (
              <React.Fragment key={index}>
                <Separator className="my-4" />
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-[#4e4e4e] text-xl leading-8">
                    {item.feature}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div className="w-[582px] bg-white rounded-[32px] shadow-lg flex flex-col justify-between p-10 pt-11">
            <div className="flex items-center h-[32px]">
              <img className="w-[31px] h-[31px]" alt="Group" src="/group-3-1.png" />
              <span className="ml-2 font-['Verdana-Bold'] font-bold text-[#5e17eb] text-[26.3px] tracking-[-0.26px]">
                URLINK
              </span>
            </div>
            {featureData.map((item, index) => (
              <React.Fragment key={index}>
                <Separator className="my-4" />
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-nero text-xl leading-8">
                    {item.URLINK.split(" ")[0]}
                  </span>
                  <span className="font-normal text-[#4e4e4e] text-xl leading-8">
                    {item.URLINK.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div className="w-[420px] flex flex-col justify-between py-10 ml-8">
            <div className="font-bold text-[#4e4e4e] text-2xl text-left tracking-[-0.24px]">
              Competitors
            </div>
            {featureData.map((item, index) => (
              <React.Fragment key={index}>
                <Separator className="my-4" />
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-nero text-xl leading-8">
                    {item.competitors.split(" ")[0]}
                  </span>
                  <span className="font-normal text-[#4e4e4e] text-xl leading-8">
                    {item.competitors.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <Button className="mt-8 bg-[#42c97a] hover:bg-[#42c97a] text-white text-xl flex items-center gap-2 rounded-lg group transition-all duration-500 ease-in-out overflow-hidden hover:pr-10 relative">
          <span className="flex items-center">
            Create your free account now
            <span
              className="ml-2 overflow-hidden transition-opacity duration-500 ease-in-out delay-250 group-hover:opacity-100 opacity-0 absolute right-4"
            >
              <svg
                width="19"
                height="16"
                viewBox="0 0 19 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.7086 8.70711C19.0991 8.31658 19.0991 7.68342 18.7086 7.29289L12.3446 0.928932C11.9541 0.538408 11.3209 0.538408 10.9304 0.928932C10.5399 1.31946 10.5399 1.95262 10.9304 2.34315L16.5873 8L10.9304 13.6569C10.5399 14.0474 10.5399 14.6805 10.9304 15.0711C11.3209 15.4616 11.9541 15.4616 12.3446 15.0711L18.7086 8.70711ZM0.00146484 9H18.0015V7H0.00146484V9Z"
                  fill="white"
                />
              </svg>
            </span>
          </span>
        </Button>
      </div>
    </section>
  );
}

function VideoSection() {
  return (
    <section className="mt-[100px] px-36 relative">
      <div className="w-full max-w-[1178px] mx-auto">
        <iframe
          className="w-full h-[734px] rounded-[40px] border-[2px] border-solid border-[#5e17eb] shadow-md"
          style={{
            border: "2px solid #5e17eb",
            boxShadow: "0 0 0 16px #f7f7f7",
          }}
          src="https://www.youtube.com/embed/23ZUf8QFHxY"
          title="URLINK in 3 minutes"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="mt-[100px] px-36">
      <div>
        <h2 className="font-extrabold text-[#5e17eb] text-5xl text-center tracking-[-0.48px] leading-[64px] mb-4">
          Why choose URLINK?
        </h2>
        <div className="font-normal text-[#4e4e4e] text-xl text-center tracking-[-0.20px] mb-12">
          Discover the exclusive benefits of URLINK with <br /> a smooth experience optimized for your digital <br /> marketing.
        </div>
      </div>
      <div className="flex gap-16">
        <div className="w-1/2">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="py-4 font-semibold text-[#4e4e4e] text-xl">
                1. 💰 Pay only for clicks
              </AccordionTrigger>
              <AccordionContent className="pl-6 text-[#4e4e4e] text-base">
                URLINK is a PPC service: no subscriptions, you pay only for actual clicks on your links.
              </AccordionContent>
            </AccordionItem>
            <Separator className="my-2" />
            <AccordionItem value="item-2" className="border-none">
              <AccordionTrigger className="py-4 font-semibold text-[#4e4e4e] text-xl">
                2. 📊 Free UTMs & advanced tracking
              </AccordionTrigger>
              <AccordionContent className="pl-6 text-[#4e4e4e] text-base">
                With URLINK you can create, track and analyze UTMs at no extra cost.
              </AccordionContent>
            </AccordionItem>
            <Separator className="my-2" />
            <AccordionItem value="item-3" className="border-none">
              <AccordionTrigger className="py-4 font-semibold text-[#4e4e4e] text-xl">
                3. ⚡ Intuitive and fast platform
              </AccordionTrigger>
              <AccordionContent className="pl-6 text-[#4e4e4e] text-base">
                Simple and fast interface to manage all your links.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="w-1/2 flex justify-center">
          <Image width={436} height={436}
            className="w-[436px] h-[436px] object-cover border-[16px] border-[#f7f7f7] rounded-[40px] shadow-md"
            alt="Ppc concept"
            src="/ppc-concept-illustration-1.png"
          />
        </div>
      </div>
    </section>
  );
}

function TestimonialSection({ idx }: { idx: number; }) {
  const t = testimonialData[idx];
  return (
    <section className="mt-[144px] mb-[200px] flex justify-center px-6">
      <div className="flex max-w-5xl items-start gap-10">
        {/* Image */}
        <img
          src={t.image}
          alt={t.author}
          className="w-[164px] h-[164px] object-cover rounded-[20px] mt-4"
        />

        {/* Text Content */}
        <div className="flex flex-col">
          {/* Quote Icon */}
          <span className="text-[124px] text-[#5e17eb] leading-none mb-2 h-12
          ">”</span>

          {/* Main Text */}
          <p className="text-base leading-7 text-[#4e4e4e] max-w-[35vw]">
            <span className="font-bold text-[#5e17eb]">
              {t.highlighted}
            </span>{" "}
            {t.content}
          </p>

          {/* Author */}
          <p className="mt-2 italic font-medium text-[#4e4e4e]">– {t.author}</p>
        </div>
      </div>
    </section>
  );
}

function DashboardPreviewSection() {
  return (
    <section className="mt-[100px] relative">
      <div className="w-full h-[804px] rounded-[40px_40px_0px_0px] bg-gradient-to-b from-[#5e17eb] to-white">
        <h2 className="font-extrabold text-[#f7f7f7] text-5xl text-center tracking-[-0.48px] leading-[64px] pt-[103px]">
          Why choose URLINK?
        </h2>
        <p className="w-[586px] font-normal text-[#f7f7f7] text-xl text-center tracking-[-0.20px] mx-auto mt-4">
          Discover URLINK's exclusive benefits with a smooth experience optimized for your digital marketing.
        </p>
        <img
          className="w-[80vw] mx-auto mt-[103px] object-cover"
          alt="Dashboard link"
          src="/dashboard---link-performance-1.png"
        />
      </div>
      <div className="mt-[403px] flex justify-center">
        <Button className="bg-[#42c97a] hover:bg-[#42c97a] text-white text-xl flex items-center gap-2 rounded-lg group transition-all duration-500 ease-in-out overflow-hidden hover:pr-10 relative">
          <span className="flex items-center">
            Create your free account now
            <span
              className="ml-2 overflow-hidden transition-opacity duration-500 ease-in-out delay-250 group-hover:opacity-100 opacity-0 absolute right-4"
            >
              <svg
                width="19"
                height="16"
                viewBox="0 0 19 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.7086 8.70711C19.0991 8.31658 19.0991 7.68342 18.7086 7.29289L12.3446 0.928932C11.9541 0.538408 11.3209 0.538408 10.9304 0.928932C10.5399 1.31946 10.5399 1.95262 10.9304 2.34315L16.5873 8L10.9304 13.6569C10.5399 14.0474 10.5399 14.6805 10.9304 15.0711C11.3209 15.4616 11.9541 15.4616 12.3446 15.0711L18.7086 8.70711ZM0.00146484 9H18.0015V7H0.00146484V9Z"
                  fill="white"
                />
              </svg>
            </span>
          </span>
        </Button>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="mt-[100px] flex flex-col items-center">
      <h2 className="font-extrabold text-[#5e17eb] text-5xl text-center tracking-[-0.48px] leading-[64px] w-[856px]">
        Choose the most convenient and transparent solution for your business!
      </h2>
      <p className="w-[598px] font-normal text-[#4e4e4e] text-xl text-center tracking-[-0.20px] mt-8">
        With URLINK you get free activation, no obligations, and pay only for actual clicks. Why pay more for the same service?
      </p>
      <div className="mt-16 relative">
        <Card className="w-[855px] h-fit bg-[#5e17eb] rounded-[40px] border shadow-ombra">
          <Badge className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#f7f7f7] text-[#4e4e4e] text-sm px-4 py-2 rounded-[40px] border border-[#5e17eb]">
            THE WISEST CHOICE
          </Badge>
          <CardContent className="flex flex-col items-center pt-12">
            <h3 className="font-bold text-[#f7f7f7] text-[40px] text-center tracking-[-0.40px]">
              Account
            </h3>
            <div className="flex flex-col items-center gap-2 mt-4">
              {pricingFeatures.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <img className="w-3.5 h-2.5 mr-2" alt="Layer" src="/layer2.svg" />
                  <span className="font-normal text-[#f7f7f7] text-xl text-center tracking-[-0.20px]">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Button className="mt-8 bg-[#42c97a] hover:bg-[#42c97a] text-white text-xl flex items-center gap-2 rounded-lg group transition-all duration-500 ease-in-out overflow-hidden hover:pr-10 relative">
                <span className="flex items-center">
                  Create your free account now
                  <span
                    className="ml-2 overflow-hidden transition-opacity duration-500 ease-in-out delay-250 group-hover:opacity-100 opacity-0 absolute right-4"
                  >
                    <svg
                      width="19"
                      height="16"
                      viewBox="0 0 19 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18.7086 8.70711C19.0991 8.31658 19.0991 7.68342 18.7086 7.29289L12.3446 0.928932C11.9541 0.538408 11.3209 0.538408 10.9304 0.928932C10.5399 1.31946 10.5399 1.95262 10.9304 2.34315L16.5873 8L10.9304 13.6569C10.5399 14.0474 10.5399 14.6805 10.9304 15.0711C11.3209 15.4616 11.9541 15.4616 12.3446 15.0711L18.7086 8.70711ZM0.00146484 9H18.0015V7H0.00146484V9Z"
                        fill="white"
                      />
                    </svg>
                  </span>
                </span>
              </Button>
            </div>
            <p className="text-[#f7f7f7] text-center tracking-[-0.04px] mt-4">
              Free forever. No hidden costs. Ever.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="mt-[100px] px-[20vw]">
      <span className="font-semibold text-[#5e17eb] text-xl tracking-[-0.20px]">
        FAQ
      </span>
      <h2 className="font-bold text-[#4e4e4e] text-[40px] tracking-[-0.40px] mt-2">
        Frequently Asked Questions
      </h2>
      <div className="mt-8 flex flex-col items-center">
        <Accordion type="single" collapsible className="w-4/5">
          {faqData.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index + 1}`}
              className="border-b border-[#e5e5e5]"
            >
              <AccordionTrigger className="py-4 font-semibold text-[#4e4e4e] text-xl flex justify-between hover:text-[#5e17eb]">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[#4e4e4e] text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="mt-[100px] bg-[#5e17eb] rounded-[40px_40px_0px_0px] py-16 px-36">
      <div className="flex">
        <div className="w-1/3">
          <div className="flex items-center">
            <img className="w-9 h-9" alt="Group" src="/group-3-3.png" />
            <span className="ml-2 font-['Verdana-Bold'] font-bold text-[#f7f7f7] text-[30.8px] tracking-[-0.31px]">
              URLINK
            </span>
          </div>
          <p className="font-normal text-[#f7f7f7] text-base tracking-[-0.16px] mt-8 w-[255px]">
            The smart solution for your links. Manage, track, and optimize your links with ease. You pay only for clicks received, no hidden costs. 🚀
          </p>
        </div>
        <div className="w-1/6">
          <h3 className="font-semibold text-[#f7f7f7] text-base tracking-[-0.16px]">
            Useful Links
          </h3>
          <ul className="mt-4 space-y-4">
            <li>
              <a href="#" className="font-normal text-[#f7f7f7] text-base tracking-[-0.16px]">
                Support
              </a>
            </li>
            <li>
              <a href="#" className="font-normal text-[#f7f7f7] text-base tracking-[-0.16px]">
                Pricing
              </a>
            </li>
            <li>
              <a href="#" className="font-normal text-[#f7f7f7] text-base tracking-[-0.16px]">
                Affiliate
              </a>
            </li>
          </ul>
        </div>
        <div className="w-1/6">
          <h3 className="font-semibold text-[#f7f7f7] text-base tracking-[-0.16px]">
            Legal Links
          </h3>
          <ul className="mt-4 space-y-4">
            <li>
              <a href="#" className="font-normal text-[#f7f7f7] text-base tracking-[-0.16px]">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="#" className="font-normal text-[#f7f7f7] text-base tracking-[-0.16px]">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="font-normal text-[#f7f7f7] text-base tracking-[-0.16px]">
                Cookie Policy
              </a>
            </li>
          </ul>
        </div>
        <div className="w-1/3">
          <h3 className="font-semibold text-[#f7f7f7] text-base tracking-[-0.16px]">
            Social Links
          </h3>
          <div className="flex items-center gap-6 mt-4">
            <img className="w-[26px] h-[26.01px]" alt="Group" src="/group-537.png" />
            <img className="w-[15.96px] h-[28.52px]" alt="Logo" src="/logo.png" />
            <div className="w-[24.37px] h-[22.8px] bg-[url(/layer1.png)] bg-[100%_100%]" />
            <img className="w-[35px] h-[24.5px]" alt="Group" src="/group.png" />
            <div className="w-[19.86px] h-[22.77px] bg-[url(/group-1.png)] bg-[100%_100%]" />
          </div>
        </div>
      </div>
      <div className="flex items-center mt-32">
        <img className="w-8 h-8 rounded-full border-2 border-[#f7f7f7]" alt="Img" src="/img-eb741659992c-1-1.png" />
        <p className="ml-3 font-normal text-[#f7f7f7] text-sm tracking-[-0.14px]">
          <span>Hi 👋 I am{' '}</span>
          <span className="font-semibold underline"><Link href={'https://www.instagram.com/molaroriccardo/'}>Riccardo</Link></span>
          <span>
            ,{' '}the creator of URLINK. Follow my other projects on{' '}
          </span>
          <span className="font-semibold underline"><Link href={'https://www.instagram.com/molaroriccardo/'}>Instagram</Link></span>
          <span>.</span>
        </p>
      </div>
    </footer>
  );
}

// **************** MAIN ENTRY *****************

export default function LpIta() {
  return (
    <div className="bg-white flex flex-row justify-center w-full" data-model-id="1:2">
      <div className="bg-white w-full max-w-[1728px] relative">
        <HeroSection />
        <BenefitsSection />
        <ComparisonSection />
        <TestimonialSection idx={0} />
        <VideoSection />
        <FeaturesSection />
        <TestimonialSection idx={0} />
        <DashboardPreviewSection />
        <div
          className="mt-[144px]"
        >
        </div>
        <CTASection />
        <TestimonialSection idx={0} />
        <FAQSection />
        <TestimonialSection idx={0} />
        <FooterSection />
      </div>
    </div>
  );
};
