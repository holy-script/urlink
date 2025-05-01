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

const featureData = [
  {
    feature: "Free activation",
    urlink: "✅ Yes",
    competitors: "❌ No, often paid",
  },
  {
    feature: "Initial free clicks",
    urlink: "✅ 500",
    competitors: "❌ No free credit",
  },
  {
    feature: "Payment model",
    urlink: "✅ PPC – Pay only for received clicks",
    competitors: "❌ Fixed subscription or hidden costs",
  },
  {
    feature: "Free UTM management",
    urlink: "✅ Included",
    competitors: "❌ Often paid service",
  },
  {
    feature: "Intuitive interface",
    urlink: "✅ Clean and simple design",
    competitors: "❌ Complex or outdated",
  },
  {
    feature: "Marketing optimization",
    urlink: "✅ Advanced and customizable tracking",
    competitors: "❌ Limited or extra cost",
  },
];

const faqData = [
  { question: "Is Urlink really free?" },
  { question: "How does the PPC payment system work?" },
  { question: "Can I track my link performance?" },
  { question: "Does Urlink support deep linking?" },
  { question: "Is there a limit to the number of links I can create?" },
  { question: "Can I customize the generated links?" },
  { question: "Does Urlink work with ad campaigns?" },
  { question: "How can I get started?" },
];

const testimonialData = [
  {
    rating: 5,
    title: "Perfect for marketing campaigns!",
    content:
      '"Finally, a deeplink service that doesn\'t force you to pay a fixed subscription! With Urlink, I can manage my links smartly and pay only for actual clicks. Free UTM management is an incredible added value!"',
    author: "Marco R.",
    position: "CEO of GrowthLab – 200K followers on IG",
    image: "/image-2.png",
  },
  {
    rating: 5,
    title: "Simple, intuitive, and convenient",
    content:
      '"I\'ve tried several similar services, but Urlink is the most intuitive. The platform is clean and easy to use, and the free activation with 500 clicks included is perfect for testing without risks. I recommend it to anyone doing digital marketing!"',
    author: "Giulia M.",
    position: "Founder of SocialBoost – 180K followers on IG",
    image: "/image-3.png",
  },
  {
    rating: 5,
    title: "Finally a transparent service!",
    content:
      '"Unlike competitors, Urlink has no hidden costs or expensive plans. The PPC model lets me control the budget based on real needs. Plus, free UTM analysis helps me optimize campaigns with no extra costs!"',
    author: "Luca D.",
    position: "Digital Strategist – 220K followers on IG",
    image: "/image-4.png",
  },
  {
    rating: 5,
    title: "Great for those wanting immediate results",
    content:
      '"With Urlink I improved conversions without spending a fortune. The advanced tracking and intuitive platform design make everything easier. Perfect for anyone needing a professional service without complications!"',
    author: "Francesca P.",
    position: "E-commerce Expert – 250K followers on IG",
    image: "/image-5.png",
  },
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
      "With Urlink you can create, track and analyze UTMs at no cost, unlike many competitors who charge for this service.",
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
        <Button variant="ghost" className="text-white text-xl">
          FAQ
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            className="bg-[#5e17eb] rounded-lg text-white text-xl flex items-center gap-2"
          >
            <img className="w-[25px] h-[25px]" alt="Group" src="/group-5.png" />
            EN
            <img className="w-3.5 h-[7px]" alt="Vector" src="/vector-2-1.svg" />
          </Button>
        </div>
        <Button variant="ghost" className="bg-[#5e17eb] text-white text-xl">
          Log in
        </Button>
        <Button variant="outline" className="border-white text-white text-xl">
          Register free
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
                className="h-[72px] bg-[#f7f7f7] rounded-2xl pl-10 text-xl text-[#a9a9a9]"
                placeholder="Paste here"
              />
              <img
                className="absolute w-px h-10 top-4 left-5 object-cover"
                alt="Line"
                src="/line-1.svg"
              />
            </div>

            <Button className="mt-8 bg-[#42c97a] hover:bg-[#42c97a] text-white text-xl flex items-center gap-2 rounded-xl">
              <img className="w-6 h-6" alt="Group" src="/group-22.png" />
              Get your new link
            </Button>
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
        <UrlShortenerForm />
        <div className="mt-8">
          <h1 className="font-bold text-[#f7f7f7] text-5xl text-center tracking-[-0.48px] leading-[64px]">
            <div>
              Create your deeplink now and
            </div>
            <div>
              start making <span className="underline">$money</span>🤑
            </div>
          </h1>
        </div>
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
            Urlink makes browsing faster and more effective with <br /> smart deeplinks,
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
          <div className="w-[582px] flex flex-col justify-between pt-11 pb-10">
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
                    {item.urlink.split(" ")[0]}
                  </span>
                  <span className="font-normal text-[#4e4e4e] text-xl leading-8">
                    {item.urlink.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div className="w-[420px] flex flex-col justify-between py-10">
            <div className="font-bold text-[#4e4e4e] text-2xl text-center tracking-[-0.24px]">
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
    </section>
  );
}

function VideoSection() {
  return (
    <section className="mt-[100px] px-36 relative">
      <div className="w-[125px] h-[134px] absolute top-[105px] left-[145px]">
        <img
          className="w-[76px] h-[113px] absolute top-[21px] left-[38px]"
          alt="Vector"
          src="/vector-6-1.svg"
        />
        <div className="absolute top-0 left-0 font-medium text-[#4e4e4e] text-sm tracking-[-0.14px] leading-[14px]">
          <span>urlink</span> in 3 minutes
        </div>
      </div>
      <div className="w-[1178px] h-[734px] bg-[#4e4e4e] rounded-[40px] border-[16px] border-solid border-[#f7f7f7] shadow-ombra relative mx-auto">
        <img
          className="absolute w-[1166px] h-[722px] -top-2 -left-2.5"
          alt="Image"
          src="/image-1.png"
        />
        <img
          className="absolute w-[356px] h-[356px] top-[330px] right-[52px]"
          alt="Img"
          src="/img-8d428958dd17-1-1.png"
        />
        <div className="absolute w-full h-28 bottom-0 bg-[#42c97a] rounded-[40px_40px_24px_24px] rotate-180">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-180">
            <h2 className="font-extrabold text-[#f7f7f7] text-5xl text-center tracking-[-0.48px] leading-[64px]">
              30k in 2 minutes with URLINK 🤯
            </h2>
          </div>
          <img
            className="absolute w-[139px] h-[45px] bottom-4 left-8 rotate-180"
            alt="Group"
            src="/group-25.png"
          />
        </div>
        <div className="absolute w-full h-32 top-0 left-0 rounded-[40px_40px_0px_0px] bg-gradient-to-b from-[rgba(0,0,0,0.6)] to-transparent">
          <div className="flex items-center p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#5e17eb] rounded-full flex items-center justify-center">
                <img className="w-7 h-7" alt="Group" src="/group-3-2.png" />
              </div>
              <span className="ml-4 font-medium text-white text-base tracking-[-0.16px] text-shadow">
                URLINK OFFICIAL
              </span>
            </div>
            <div className="ml-auto flex items-center gap-6">
              <div className="flex flex-col items-center">
                <img className="w-5 h-5" alt="Vector" src="/vector-2.svg" />
                <span className="text-shadow font-medium text-white text-sm tracking-[-0.14px]">
                  Watch Later
                </span>
              </div>
              <div className="flex flex-col items-center">
                <img className="w-[21px] h-[17px]" alt="Vector" src="/vector.svg" />
                <span className="text-shadow font-medium text-white text-sm tracking-[-0.14px]">
                  Share
                </span>
              </div>
            </div>
          </div>
        </div>
        <img
          className="absolute w-[91px] h-16 top-[319px] left-[527px]"
          alt="Group"
          src="/group-26.png"
        />
        <img
          className="absolute w-[19px] h-[23px] top-[260px] left-[672px]"
          alt="Vector"
          src="/vector-1.svg"
        />
      </div>
      <div className="flex justify-center mt-16">
        <Button className="bg-[#42c97a] text-white text-xl">
          Create your free account now
        </Button>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="mt-[100px] px-36">
      <h2 className="font-extrabold text-[#5e17eb] text-5xl text-center tracking-[-0.48px] leading-[64px] mb-16">
        Why choose Urlink?
      </h2>
      <div className="flex gap-16">
        <div className="w-1/2">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="py-4 font-semibold text-[#4e4e4e] text-xl">
                1. 💰 Pay only for clicks
              </AccordionTrigger>
              <AccordionContent className="pl-6 text-[#4e4e4e] text-base">
                Urlink is a PPC service: no subscriptions, you pay only for actual clicks on your links.
              </AccordionContent>
            </AccordionItem>
            <Separator className="my-2" />
            <AccordionItem value="item-2" className="border-none">
              <AccordionTrigger className="py-4 font-semibold text-[#4e4e4e] text-xl">
                2. 📊 Free UTMs & advanced tracking
              </AccordionTrigger>
              <AccordionContent className="pl-6 text-[#4e4e4e] text-base">
                With Urlink you can create, track and analyze UTMs at no extra cost.
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
    <section className="mt-[100px] flex justify-center">
      <Card className="bg-[#f7f7f7] rounded-[40px] shadow-ombra p-8 flex flex-col items-center gap-3">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <img
              key={star}
              className="w-[21px] h-5"
              alt="Star"
              src="/star-2.svg"
            />
          ))}
        </div>
        <h3 className="font-semibold text-[#4e4e4e] text-base text-center">
          {t.title}
        </h3>
        <p className="w-[493px] font-normal text-[#4e4e4e] text-base text-center">
          {t.content}
        </p>
        <div className="flex items-center">
          <img className="w-14 h-14 object-cover" alt="Image" src={t.image} />
          <div className="ml-4">
            <p className="font-medium text-[#4e4e4e] text-base">{t.author}</p>
            <p className="font-normal text-[#4e4e4e] text-sm">{t.position}</p>
          </div>
        </div>
      </Card>
    </section>
  );
}

function DashboardPreviewSection() {
  return (
    <section className="mt-[100px] relative">
      <div className="w-full h-[804px] rounded-[40px_40px_0px_0px] bg-gradient-to-b from-[#5e17eb] to-white">
        <h2 className="font-extrabold text-[#f7f7f7] text-5xl text-center tracking-[-0.48px] leading-[64px] pt-[103px]">
          Why choose Urlink?
        </h2>
        <p className="w-[586px] font-normal text-[#f7f7f7] text-xl text-center tracking-[-0.20px] mx-auto mt-4">
          Discover Urlink's exclusive benefits with a smooth experience optimized for your digital marketing.
        </p>
        <img
          className="w-[1162px] h-[658px] mx-auto mt-[103px] object-cover"
          alt="Dashboard link"
          src="/dashboard---link-performance-1.png"
        />
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
        With Urlink you get free activation, no obligations, and pay only for actual clicks. Why pay more for the same service?
      </p>
      <div className="mt-16 relative">
        <Card className="w-[855px] h-[437px] bg-[#5e17eb] rounded-[40px] border shadow-ombra">
          <Badge className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#f7f7f7] text-[#4e4e4e] text-sm px-4 py-2 rounded-[40px] border border-[#5e17eb]">
            THE WISEST CHOICE
          </Badge>
          <CardContent className="flex flex-col items-center pt-16">
            <h3 className="font-bold text-[#f7f7f7] text-[40px] text-center tracking-[-0.40px]">
              Account
            </h3>
            <div className="flex flex-col items-center gap-2 mt-8">
              {pricingFeatures.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <img className="w-3.5 h-2.5 mr-2" alt="Layer" src="/layer2.svg" />
                  <span className="font-normal text-[#f7f7f7] text-xl text-center tracking-[-0.20px]">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            <Button className="mt-16 bg-[#42c97a] text-white text-xl w-[445px]">
              Create your account now
            </Button>
            <p className="font-normal text-[#f7f7f7] text-sm text-center tracking-[-0.14px] mt-4">
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
    <section className="mt-[100px] px-36">
      <div className="mb-4">
        <span className="font-semibold text-[#5e17eb] text-xl tracking-[-0.20px]">
          FAQ
        </span>
        <p className="font-normal text-[#4e4e4e] text-xl tracking-[-0.20px] mt-2">
          Also known as Frequently Asked Questions 🇮🇹
        </p>
      </div>
      <h2 className="font-bold text-[#4e4e4e] text-[40px] tracking-[-0.40px] mt-8">
        Frequently Asked Questions
      </h2>
      <div className="mt-8">
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index + 1}`}
              className="border-b border-[#e5e5e5]"
            >
              <AccordionTrigger className="py-4 font-semibold text-[#4e4e4e] text-xl flex justify-between">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[#4e4e4e] text-base">
                Answer to question {index + 1}
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
        <img className="w-8 h-8" alt="Img" src="/img-eb741659992c-1-1.png" />
        <p className="ml-3 font-normal text-[#f7f7f7] text-sm tracking-[-0.14px]">
          <span>Hi 👋 I am</span>
          <span className="font-semibold underline"> Riccard</span>
          <span>
            o the creator of Urlink. Follow my other projects on
          </span>
          <span className="font-semibold underline"> Instagram</span>
          <span>.</span>
        </p>
      </div>
    </footer>
  );
}

// **************** MAIN ENTRY *****************

export const LpIta = (): JSX.Element => {
  return (
    <div className="bg-white flex flex-row justify-center w-full" data-model-id="1:2">
      <div className="bg-white w-full max-w-[1728px] relative">
        <HeroSection />
        <BenefitsSection />
        <ComparisonSection />
        <VideoSection />
        <FeaturesSection />
        <TestimonialSection idx={0} />
        <DashboardPreviewSection />
        <div
          className="mt-[260px]"
        >
          <TestimonialSection idx={1} />
        </div>
        <CTASection />
        {/* <TestimonialSection idx={2} /> */}
        <FAQSection />
        {/* <TestimonialSection idx={3} /> */}
        <FooterSection />
      </div>
    </div>
  );
};

export default LpIta;
