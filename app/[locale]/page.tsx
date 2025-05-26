import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Menu } from "lucide-react";
import { SignupModal } from "@/components/SignupModal";
import { LanguageSelect } from "@/components/LanguageSelect";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Fragment } from "react";
import LogoCarousel from "@/components/LogoCarousel";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";

// ************ SECTION COMPONENTS ************

function HeaderSection() {
  const t = useTranslations('LandingPage.header');

  return (
    <header className="flex justify-between items-center px-4 sm:px-8 md:px-16 lg:px-36 pb-4">
      <div className="flex items-center">
        <img className="h-16 md:h-auto" alt="Group" src="/urlinklogo-white.svg" />
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-4">
        <Button variant="ghost" className="text-white text-xl hover:bg-[#5418CD] hover:text-white">
          <Link href="#faq">
            {t('faq')}
          </Link>
        </Button>
        <div className="relative">
          <LanguageSelect />
        </div>
        <Button variant="ghost" className="bg-[#5e17eb] text-white text-xl hover:bg-[#5418CD] hover:text-white">
          <Link href="/login">
            {t('login')}
          </Link>
        </Button>
        <Button variant="outline" className="border-white text-white text-xl hover:bg-white hover:text-[#5e17eb]">
          <Link href="/signup">
            {t('register')}
          </Link>
        </Button>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-4">
        <LanguageSelect />
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="border border-white h-9 px-1 text-white">
                <Menu size={22} color="white" />
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-fit bg-white text-[#5e17eb] rounded-xl">
                <div className="flex flex-col py-2 gap-2 w-fit px-4">
                  <NavigationMenuLink href="#faq" className={"border-none text-md  text-[#5e17eb] w-full bg-transparent text-center rounded-md border-2 px-6 py-1 focus:bg-[#5418CD] focus:text-white"}>
                    {t('faq')}
                  </NavigationMenuLink>
                  <NavigationMenuLink href="/login" className={"border-none text-md  text-[#5e17eb] w-full bg-transparent text-center rounded-md border-2 px-6 py-1 focus:bg-[#5418CD] focus:text-white"}>
                    {t('login')}
                  </NavigationMenuLink>
                  <NavigationMenuLink href="/signup" className={"border-[#5317eb] text-md  text-[#5e17eb] w-full bg-[rgb(94,23,235,0.15)] text-center rounded-md border-2 text-nowrap px-6 py-1 focus:bg-[#5418CD] focus:text-white"}>
                    {t('register')}
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

    </header>
  );
}

function UrlShortenerForm() {
  const t = useTranslations('LandingPage.hero.form');

  return (
    <div className="flex flex-col items-center mt-8 md:mt-12 px-4">
      <Card className="w-full max-w-4xl mx-auto h-fit bg-white rounded-2xl">
        <CardContent>
          <div className="flex flex-col items-center pt-6 md:px-2">
            <h2 className="font-bold text-[#4e4e4e] text-xl md:text-2xl text-center tracking-[-0.24px]">
              {t('title')}
            </h2>
            <p className="font-light text-[#4e4e4e] text-base md:text-lg text-center tracking-[-0.20px] mt-2">
              <span className="tracking-[-0.04px]">
                {t('subtitle')}
              </span>
            </p>

            <div className="mt-3 w-full relative">
              <Input
                className="h-[60px] md:h-[72px] bg-[#f7f7f7] rounded-2xl pl-6 md:pl-10 text-lg md:text-xl text-[#5e17eb] placeholder:text-[rgb(169,169,169)] border-2 border-[#f7f7f7] focus:border-[#5e17eb] font-normal"
                placeholder={t('placeholder')}
              />
            </div>

            <SignupModal />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HeroSection() {
  const t = useTranslations('LandingPage.hero');
  // Define keys for the benefits items
  const USPKeys = ['0', '1', '2', '3'] as const;

  return (
    <section className="relative w-full h-fit overflow-hidden">
      <div className="w-full h-fit bg-[#5e17eb] rounded-[0px_0px_20px_20px] md:rounded-[0px_0px_40px_40px] py-0 pb-4 md:pb-8">
        <HeaderSection />
        <div className="px-4">
          <h1 className="font-bold text-[#f7f7f7] text-3xl md:text-5xl text-center tracking-[-0.48px] leading-[1.2] md:leading-[64px]">
            <div>
              {t('title.line1')}
            </div>
            <div>
              {t('title.line2')}{" "}
              {/* <span className="relative group">
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
              </span> */}
            </div>
          </h1>
          <div className="mt-4 md:mt-2">
            <p className="font-semibold text-white text-lg md:text-xl text-center tracking-[-0.20px]">
              {t('usp.title')}
            </p>
            <p className="font-light text-white text-base md:text-lg text-center tracking-[-0.20px] mt-2">
              {t('usp.subtitle')}
            </p>
          </div>
        </div>
        <UrlShortenerForm />
        <div className="mt-6 md:mt-10 px-4 flex flex-col items-center">
          <div className="grid grid-cols-2 gap-2 md:gap-4 mt-4 w-fit">
            {USPKeys.map((key) => (
              <div key={key} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 mt-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="bg-white rounded-full">
                    <path d="M6 12.0223L10.1743 17L18 9" stroke="#5e17eb" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="11.5" stroke="#5e17eb" />
                  </svg>
                </div>
                <span className="ml-2 font-light text-white text-lg md:text-xl">
                  {t(`usp.items.${key}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 md:mt-10 w-full flex flex-col justify-center items-center px-4">
          <Image width={14} height={7} className="w-[14px] h-[7px]" alt="Vector" src="/vector-6.svg" />
          <div className="inline-flex items-center gap-3 pl-1 pr-4 py-1 bg-[#f7f7f7] rounded-[56px] w-fit mt-2 max-w-full">
            <Image width={48} height={48} className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full" alt="Image" src="/image.png" />
            <div className="overflow-hidden">
              <p className="font-medium text-[#200062] text-xs md:text-sm tracking-[-0.14px] truncate">
                {t('testimonial.text')}
              </p>
              <p className="font-light text-[#200062] text-xs md:text-sm truncate">
                {t('testimonial.author')}
              </p>
            </div>
          </div>
        </div>
        <LogoCarousel />
      </div>
    </section>
  );
}

function BenefitsSection() {
  const t = useTranslations('LandingPage.benefits');
  // Define keys for the benefits items
  const benefitKeys = ['0', '1', '2', '3'] as const;

  // Get the entire items object
  const benefitItems = t.raw('items');

  return (
    <section className="relative mt-2 md:mt-0 px-4 sm:px-8 md:px-16 lg:px-36">
      <div className="flex flex-col px-4">
        <h2 className="font-extrabold text-[#5e17eb] text-3xl md:text-5xl text-center tracking-[-0.48px] leading-[1.2] md:leading-[64px] mt-4 md:mt-12">
          {t('title')}
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-evenly mt-6 md:mt-12 gap-6">
          <span className="font-bold text-[#4e4e4e] text-6xl md:text-8xl tracking-[-0.96px]">
            🚀
          </span>
          <div>
            <p className="font-light text-[#4e4e4e] text-lg md:text-xl text-center tracking-[-0.20px]">
              {t('subtitle')}
            </p>
            <p className="font-light text-[#4e4e4e] text-lg md:text-xl text-center tracking-[-0.20px]">
              {t('subtitle2')}
            </p>
          </div>
          <span className="font-bold text-[#4e4e4e] text-6xl md:text-8xl tracking-[-0.96px] hidden md:block">
            🤯
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-16 mt-6 md:mt-16">
        {benefitKeys.slice(0, 3).map((key) => (
          <div key={key} className="flex flex-col items-center">
            <span className="font-bold text-[#5e17eb] text-[32px] md:text-[40px] text-center tracking-[-0.40px]">
              {benefitItems[key].id}
            </span>
            <h3 className="font-bold text-[#4e4e4e] text-xl md:text-2xl text-center tracking-[-0.24px] mt-0 md:mt-4">
              {benefitItems[key].title}
            </h3>
            <p className="font-light text-[#4e4e4e] text-base md:text-xl text-center tracking-[-0.20px] mt-4 w-full">
              {benefitItems[key].subtitle}
            </p>
            <p className="font-light text-[#4e4e4e] text-base md:text-xl text-center tracking-[-0.20px]">
              {benefitItems[key].description}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-center items-center mt-8 md:mt-16">
        <div className="inline-flex items-center justify-center p-2 w-fit bg-[#5e17eb] mb-6 md:mb-8 rounded-full">
          <h2 className="font-bold text-[#f7f7f7] text-2xl md:text-[40px] text-center tracking-[-0.40px] px-2">
            {t('specialTip')}
          </h2>
        </div>
        <div className="flex flex-col items-center relative">
          <div className="absolute -top-4 left-0 hidden md:block">
            <svg width="31" height="109" viewBox="0 0 31 109" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M30.4338 1.78853C30.8693 1.54893 31.0281 1.00166 30.7885 0.566165C30.5489 0.130669 30.0017 -0.0281353 29.5662 0.211465L30.4338 1.78853ZM30.3494 104.829C30.8075 104.636 31.0224 104.109 30.8294 103.651L27.6844 96.1861C27.4914 95.728 26.9636 95.5131 26.5055 95.7061C26.0475 95.8991 25.8326 96.4269 26.0256 96.885L28.8212 103.52L22.1861 106.316C21.728 106.509 21.5131 107.036 21.7061 107.494C21.8991 107.953 22.4269 108.167 22.8849 107.974L30.3494 104.829ZM29.5662 0.211465C13.7918 8.89017 2.24749 30.3063 0.369538 51.8053C-1.51306 73.3575 6.30313 95.324 29.6606 104.834L30.3394 103.166C7.94328 94.0483 0.324426 73.0069 2.16271 51.962C4.00563 30.864 15.3381 10.0939 30.4338 1.78853L29.5662 0.211465Z" fill="#5E17EB" />
            </svg>
          </div>
          <div className="absolute -top-4 right-0 hidden md:block">
            <svg width="31" height="109" viewBox="0 0 31 109" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.566166 1.78853C0.130671 1.54893 -0.0281334 1.00166 0.211466 0.566165C0.451067 0.130669 0.998341 -0.0281353 1.43384 0.211465L0.566166 1.78853ZM0.650553 104.829C0.192493 104.636 -0.0223827 104.109 0.170612 103.651L3.31565 96.1861C3.50864 95.728 4.03643 95.5131 4.49449 95.7061C4.95255 95.8991 5.16742 96.4269 4.97443 96.885L2.17884 103.52L8.81395 106.316C9.27201 106.509 9.48688 107.036 9.29389 107.494C9.10089 107.953 8.57311 108.167 8.11505 107.974L0.650553 104.829ZM1.43384 0.211465C17.2082 8.89017 28.7525 30.3063 30.6305 51.8053C32.5131 73.3575 24.6969 95.324 1.33937 104.834L0.660631 103.166C23.0567 94.0483 30.6756 73.0069 28.8373 51.962C26.9944 30.864 15.6619 10.0939 0.566166 1.78853L1.43384 0.211465Z" fill="#5E17EB" />
            </svg>
          </div>
          <span className="font-bold text-[#5e17eb] text-[32px] md:text-[40px] text-center tracking-[-0.40px]">
            4
          </span>
          <h3 className="font-bold text-[#4e4e4e] text-xl md:text-2xl text-center tracking-[-0.24px] mt-0 md:mt-4">
            {benefitItems['3'].title}
          </h3>
          <p className="font-light text-[#4e4e4e] text-base md:text-xl text-center tracking-[-0.20px] mt-4 w-full md:w-[420px]">
            {benefitItems['3'].subtitle}
          </p>
          <p className="font-light text-[#4e4e4e] text-base md:text-xl text-center tracking-[-0.20px] w-full md:w-[420px]">
            {benefitItems['3'].description}
          </p>
        </div>
      </div>
      <div className="flex justify-center mt-8 md:mt-16">
        <Image
          src={'/heart-hands_1faf6.png'}
          alt="Heart Hands"
          width={80}
          height={80}
          className="w-20 h-20 md:w-[100px] md:h-[100px]"
        />
      </div>
    </section>
  );
}

function ComparisonSection() {
  const t = useTranslations('LandingPage.comparison');
  // Define keys for the features
  const featureKeys = ['0', '1', '2', '3', '4', '5'] as const;

  return (
    <section className="mt-8 md:mt-12 sm:px-8 md:px-16 lg:px-36">
      <div className="bg-transparent md:bg-[#f7f7f7] rounded-[16px] md:rounded-[32px] md:p-10 md:pt-6 md:shadow-md">
        <h2 className="font-extrabold text-[#5e17eb] text-2xl md:text-5xl text-center tracking-[-0.48px] leading-[1.2] md:leading-[64px] mb-8 md:mb-6">
          {t('title')}
        </h2>

        {/* Desktop version - Table layout */}
        <div className="hidden md:block">
          <table
            className="w-full border-separate min-w-[600px]"
            style={{ borderSpacing: 0, borderCollapse: "separate" }}
          >
            <thead>
              <tr>
                <th className="w-[396px] text-left pb-4 font-bold text-transparent text-2xl">
                  Feature
                </th>
                <th className="w-[582px] text-left bg-[#5e17eb] rounded-tl-[16px] md:rounded-tl-[32px] rounded-tr-[16px] md:rounded-tr-[32px]">
                  <div className="flex items-center w-full h-full justify-start">
                    <Image
                      className="w-24 md:w-36 ml-4 md:ml-8"
                      width={144}
                      height={36}
                      alt="URLINK Logo"
                      src="/urlinklogo-white.svg"
                    />
                  </div>
                </th>
                <th className="w-[420px] text-left pb-4 pl-4 md:pl-8 font-bold text-[#4e4e4e] text-lg md:text-2xl tracking-[-0.24px]">
                  <div className="flex items-center w-full h-full justify-start">
                    Competitors
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {featureKeys.map((key, index) => {
                const isFirst = index === 0;
                const isLast = index === featureKeys.length - 1;
                // Row divider color
                const borderClass = isFirst
                  ? "border-t-2"
                  : "border-t";
                const borderColor = isFirst
                  ? "border-gray-300"
                  : "border-gray-300";
                // Only apply border-radius on the very first and last rows of the URLINK column (not on the purple divider row)
                const urlinkTdStyle =
                  isLast
                    ? {
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                    }
                    : {};
                return (
                  <tr key={key}>
                    {/* Feature */}
                    <td className={`py-3 md:py-4 ${borderClass} ${borderColor}`}>
                      <span className="font-semibold text-[#4e4e4e] text-base md:text-xl leading-8">
                        {t(`features.${key}.feature`)}
                      </span>
                    </td>
                    {/* URLINK (card column) */}
                    <td
                      className={`py-3 md:py-4 bg-[#5e17eb] ${borderClass} ${borderColor}`}
                      style={urlinkTdStyle}
                    >
                      <div className="pl-4 md:pl-10 flex items-center gap-2 md:gap-4">
                        <span className="font-semibold text-nero text-base md:text-xl leading-8">
                          {t(`features.${key}.URLINK`).split(" ")[0]}
                        </span>
                        <span className="font-light text-white text-base md:text-xl leading-8 pr-2">
                          {t(`features.${key}.URLINK`).split(" ").slice(1).join(" ")}
                        </span>
                      </div>
                    </td>
                    {/* Competitors */}
                    <td className={`py-3 md:py-4 pl-4 md:pl-8 ${borderClass} ${borderColor}`}>
                      <span className="font-semibold text-nero text-base md:text-xl leading-8">
                        {t(`features.${key}.competitors`).split(" ")[0]}
                      </span>
                      <span className="font-light text-[#4e4e4e] text-base md:text-xl leading-8 px-2">
                        {t(`features.${key}.competitors`).split(" ").slice(1).join(" ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              {/* Add a hidden row for the top rounded corners of the card */}
              <tr>
                <td></td>
                <td
                  style={{
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                ></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile version - Arrow tabs on left, cards on right */}
        <div className="md:hidden relative">
          {/* Container for the comparison section */}
          <div className="flex flex-row">
            {/* Left side - Sticky feature column */}
            <div className="absolute top-0 left-0 w-[40vw] h-full bg-transparent">
              <div className="sticky top-8 left-0 pt-[5.5rem] pb-0.5 -mb-1">
                {featureKeys.map((key, index) => (
                  <div
                    key={key}
                    className="feature-tab mb-4 flex items-center justify-start px-8 bg-[#e6e6e6] h-16 w-full"
                    style={{
                      clipPath: 'polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%)',
                    }}
                  >
                    <span className="text-[#4e4e4e] text-md font-semibold leading-tight text-pretty">
                      {t(`features.${key}.feature`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Scrollable cards */}
            <div className="flex flex-col items-center w-full pl-[35vw]">
              {/* Competitors Card */}
              <div className="bg-[#f7f7f7] rounded-l-lg pb-4 -mb-2 w-full border border-[#f7f7f7] shadow-lg">
                <div className="p-4 mt-4 border-b border-gray-300">
                  <span className="font-bold text-[#4e4e4e] text-xl">Others</span>
                </div>

                {featureKeys.map((key, index) => {
                  const isFirst = index === 0;
                  const borderClass = isFirst ? "border-t-2" : "";
                  const borderColor = isFirst ? "border-black" : "";

                  return (
                    <div
                      key={key}
                      className={`px-4 min-h-20 max-h-20 pl-6 ${borderClass} ${borderColor} flex items-center justify-start`}
                    >
                      <div className="flex flex-row gap-2 items-center">
                        <span className="font-semibold text-nero text-md break-words">
                          {t(`features.${key}.competitors`).split(" ")[0]}
                        </span>
                        <span className="font-light text-[#4e4e4e] text-lg break-words text-pretty">
                          {" " + t(`features.${key}.competitors`).split(" ").slice(1).join(" ")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* URLINK Card */}
              <div className="bg-[#5e17eb] border border-gray-300 rounded-l-lg w-full shadow-lg shadow-[#5e17eb]">
                <div className="p-4 border-b border-gray-300">
                  <img
                    className="w-28"
                    alt="URLINK Logo"
                    src="/urlinklogo-white.svg"
                  />
                </div>

                {featureKeys.map((key, index) => {
                  const isFirst = index === 0;
                  const borderClass = isFirst ? "border-t-2" : "";
                  const borderColor = isFirst ? "border-white" : "";

                  return (
                    <div
                      key={key}
                      className={`p-4 pl-6 min-h-20 max-h-20 ${borderClass} ${borderColor} flex items-center justify-start`}
                    >
                      <div className="flex flex-row gap-2 items-center">
                        <span className="font-semibold text-nero text-md break-words">
                          {t(`features.${key}.URLINK`).split(" ")[0]}
                        </span>
                        <span className="font-light text-white text-lg break-words text-pretty">
                          {" " + t(`features.${key}.URLINK`).split(" ").slice(1).join(" ")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-2">
        <Button className="mt-6 md:mt-8 bg-[#42c97a] hover:bg-[#42c97a] text-white text-base md:text-xl flex items-center gap-2 rounded-lg group transition-all duration-500 ease-in-out overflow-hidden hover:pr-10 relative">
          <Link href="/signup">
            <span className="flex items-center">
              {t('cta')}
              <span className="ml-2 overflow-hidden transition-opacity duration-500 ease-in-out delay-250 group-hover:opacity-100 opacity-0 absolute right-4">
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
          </Link>
        </Button>
      </div>
    </section >
  );
}

function VideoSection() {
  const t = useTranslations('LandingPage');

  return (
    <section className="mt-12 md:mt-8 px-4 sm:px-8 md:px-16 lg:px-36">
      <div className="w-full mx-auto relative">
        {/* Video container with relative positioning */}
        <div className="relative w-full max-w-[min(90%,1000px)] mx-auto">
          {/* Caption with arrow - positioned relative to the video container */}
          <div className="absolute -top-8 md:top-20 -left-8 md:-left-20 z-10">
            <p className="font-normal text-black md:max-w-[150px] ml-4 md:-ml-6">
              {t('video.caption')}
            </p>
            <svg className="rotate-45 md:rotate-0" width="64" height="100" viewBox="0 0 64 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.38031 1.68638C4.48328 1.2001 4.17255 0.722425 3.68628 0.619452C3.20001 0.516479 2.72233 0.827204 2.61935 1.31348L4.38031 1.68638ZM63.7002 93.3785C64.046 93.0214 64.0368 92.4516 63.6796 92.1059L57.8603 86.4716C57.5032 86.1259 56.9334 86.1351 56.5876 86.4922C56.2419 86.8493 56.2511 87.4191 56.6082 87.7648L61.781 92.773L56.7728 97.9458C56.427 98.3029 56.4362 98.8727 56.7933 99.2184C57.1504 99.5642 57.7202 99.555 58.066 99.1979L63.7002 93.3785ZM2.61935 1.31348C-1.91787 22.7397 0.630946 45.9811 10.5936 63.8023C20.5798 81.6656 38.0112 94.0573 63.0682 93.6523L63.0391 91.8526C38.7023 92.2459 21.8569 80.2614 12.1647 62.9239C2.4489 45.5443 -0.0822958 22.7602 4.38031 1.68638L2.61935 1.31348Z" fill="#5E17EB" />
            </svg>
          </div>

          {/* Video iframe */}
          <iframe
            className="mx-auto block rounded-[20px] md:rounded-[40px] border-[4px] border-solid border-[#5e17eb] shadow-lg shadow-[#5e17eb] md:shadow-[#5e17eb] md:shadow-lg"
            style={{
              width: "100%",
              aspectRatio: "16/9"
            }}
            src={t('video.embedUrl')}
            title={t('video.title')}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
}

function TestimonialSection({ idx }: { idx: number; }) {
  const t = useTranslations('LandingPage.testimonials');

  return (
    <section className="mt-8 md:mt-8 mb-8 md:mb-8 flex justify-center px-4 md:px-6">
      <div className="flex flex-col md:flex-row max-w-5xl items-center md:items-start gap-6 md:gap-10">
        {/* Image */}
        <Image
          src={`/image-${idx + 2}.png`}
          alt={t(`${idx}.author`)}
          className="w-[120px] h-[120px] md:w-[164px] md:h-[164px] object-cover rounded-[20px]"
          width={120}
          height={120}
        />

        {/* Text Content */}
        <div className="flex flex-col">
          {/* Quote Icon */}
          <span className="hidden md:visible text-[80px] md:text-[124px] text-[#5e17eb] leading-none mb-2 h-8 md:h-12 text-center md:text-left">"</span>

          {/* Main Text */}
          <p className="text-base leading-7 text-[#4e4e4e] max-w-full md:max-w-[35vw] text-center md:text-left">
            <span className="font-bold text-[#5e17eb]">
              {t(`${idx}.highlighted`)}
            </span>{" "}
            {t(`${idx}.content`)}
          </p>

          {/* Author */}
          <p className="mt-2 italic font-medium text-[#4e4e4e] text-center md:text-left">– {t(`${idx}.author`)}</p>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const t = useTranslations('LandingPage.features');
  // Define keys for the accordion items
  const accordionKeys = ['0', '1', '2'] as const;

  return (
    <section className="mt-8 md:mt-16 px-4 sm:px-8 md:px-16 lg:px-36">
      <div>
        <h2 className="font-extrabold text-[#5e17eb] text-3xl md:text-5xl text-center tracking-[-0.48px] leading-[1.2] md:leading-[64px] mb-4">
          {t('title')}
        </h2>
        <div className="font-light text-[#4e4e4e] text-base md:text-xl text-center tracking-[-0.20px] mb-2 md:mb-12">
          {t('subtitle')}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 md:gap-16">
        <div className="w-full md:w-1/2">
          <Accordion type="single" collapsible className="w-full">
            {accordionKeys.map((key, index) => (
              <Fragment key={key}>
                <AccordionItem value={`item-${index + 1}`} className="border-none">
                  <AccordionTrigger className="py-4 font-semibold text-[#4e4e4e] text-lg md:text-xl">
                    {t(`accordion.${key}.title`)}
                  </AccordionTrigger>
                  <AccordionContent className="pl-6 text-[#4e4e4e] text-base">
                    {t(`accordion.${key}.content`)}
                  </AccordionContent>
                </AccordionItem>
                {index < accordionKeys.length - 1 && <Separator className="my-2" />}
              </Fragment>
            ))}
          </Accordion>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <Image width={436} height={436}
            className="w-full max-w-[300px] md:max-w-[436px] h-auto object-cover border-[8px] md:border-[16px] border-[#f7f7f7] rounded-[20px] md:rounded-[40px] shadow-md"
            alt="Ppc concept"
            src="/ppc-concept-illustration-1.png"
          />
        </div>
      </div>
    </section>
  );
}

function DashboardPreviewSection() {
  const t = useTranslations('LandingPage.dashboard');

  return (
    <section className="mt-8 relative">
      <div className="w-full h-fit rounded-[20px_20px_0px_0px] md:rounded-[40px_40px_0px_0px] bg-gradient-to-b from-[#5e17eb] to-white">
        <h2 className="font-extrabold text-[#f7f7f7] text-3xl md:text-5xl text-center tracking-[-0.48px] leading-[1.2] md:leading-[64px] pt-8 md:pt-8 px-4">
          {t('title')}
        </h2>
        <p className="w-full md:w-[586px] font-light text-[#f7f7f7] text-lg md:text-xl text-center tracking-[-0.20px] mx-auto mt-4 px-4">
          {t('subtitle')}
        </p>
        <p className="w-full md:w-[586px] font-light text-[#f7f7f7] text-lg md:text-xl text-center tracking-[-0.20px] mx-auto px-4">
          {t('subtitle2')}
        </p>
        <Image
          width={1200}
          height={600}
          className="w-full md:w-[80vw] mx-auto mt-8 md:mt-6 object-cover px-4"
          alt={t('imageAlt') || "Dashboard preview"}
          src="/dashboard---link-performance-1.png"
        />
        <div className="mt-8 md:mt-4 flex justify-center px-4 pb-8 md:pb-0">
          <Button className="bg-[#42c97a] hover:bg-[#42c97a] text-white text-base md:text-xl flex items-center gap-2 rounded-lg group transition-all duration-500 ease-in-out overflow-hidden hover:pr-10 relative w-full md:w-auto">
            <Link href="/signup" className="w-full text-center">
              <span className="flex items-center justify-center">
                {t('cta')}
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
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const t = useTranslations('LandingPage.cta');
  // Define keys for the card features
  const featureKeys = ['0', '1', '2', '3', '4'] as const;

  return (
    <section className="mt-8 md:mt-8 flex flex-col items-center px-4">
      <h2 className="font-extrabold text-[#5e17eb] text-3xl md:text-5xl text-center tracking-[-0.48px] leading-[1.2] md:leading-[64px] w-full">
        {t('title')}
      </h2>
      <p className="w-full font-light text-[#4e4e4e] text-lg md:text-xl text-center tracking-[-0.20px] mt-4 md:mt-4">
        {t('subtitle')}
      </p>
      <div className="mt-8 md:mt-8 w-full flex justify-center">
        <Card className="w-full md:w-fit h-fit bg-[#5e17eb] rounded-[20px] md:rounded-[40px] border px-4 md:px-32 shadow-lg shadow-[#5e17eb] md:shadow-[#5e17eb] md:shadow-lg relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#f7f7f7] text-[#4e4e4e] text-xs md:text-sm px-4 py-2 rounded-[40px] border border-[#5e17eb] whitespace-nowrap">
            {t('card.badge')}
          </div>
          <CardContent className="flex flex-col items-center pt-8 md:pt-12">
            <h3 className="font-bold text-[#f7f7f7] text-2xl md:text-[40px] text-center tracking-[-0.40px]">
              {t('card.title')}
            </h3>
            <div className="flex flex-col items-center gap-2 mt-4 w-full">
              {featureKeys.map((key) => (
                <div key={key} className="flex items-center w-full justify-start md:justify-center">
                  <div className="flex-shrink-0 w-5 h-5 mt-1 md:mt-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0,0,256,256"
                    >
                      <g
                        fill="#42c97a"
                        fillRule="nonzero"
                        stroke="none"
                        strokeWidth="1"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                        strokeMiterlimit="10"
                        strokeDasharray=""
                        strokeDashoffset="0"
                        fontFamily="none"
                        fontWeight="none"
                        fontSize="none"
                        textAnchor="none"
                        style={{ mixBlendMode: "normal" }}
                      >
                        <g transform="scale(5.12,5.12)">
                          <path d="M25,2c-12.682,0 -23,10.318 -23,23c0,12.683 10.318,23 23,23c12.683,0 23,-10.317 23,-23c0,-12.682 -10.317,-23 -23,-23zM35.827,16.562l-11.511,16.963l-8.997,-8.349c-0.405,-0.375 -0.429,-1.008 -0.053,-1.413c0.375,-0.406 1.009,-0.428 1.413,-0.053l7.29,6.764l10.203,-15.036c0.311,-0.457 0.933,-0.575 1.389,-0.266c0.458,0.31 0.577,0.932 0.266,1.39z"></path>
                        </g>
                      </g>
                    </svg>
                  </div>

                  <span className="font-light text-[#f7f7f7] text-base md:text-xl tracking-[-0.20px] ml-2 md:text-center">
                    {t(`card.features.${key}`)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-center w-full">
              <Button className="mt-8 bg-[#42c97a] hover:bg-[#42c97a] text-white text-base md:text-xl flex items-center gap-2 rounded-lg group transition-all duration-500 ease-in-out overflow-hidden hover:pr-10 relative w-fit md:w-auto shadow-lg shadow-[#42c97a] md:shadow-[#42c97a] md:shadow-lg">
                <Link href="/signup" className="w-full text-center">
                  <span className="flex items-center justify-center">
                    {t('card.button')}
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
                </Link>
              </Button>
            </div>
            <p className="text-[#f7f7f7] text-center tracking-[-0.04px] mt-4 text-sm md:text-base">
              {t('card.disclaimer')}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function FAQSection() {
  const t = useTranslations('LandingPage.faq');
  // Define keys for the FAQ items
  const faqKeys = ['0', '1', '2', '3', '4', '5', '6', '7'] as const;

  return (
    <section id="faq" className="w-full px-4 md:px-[10vw] lg:px-[20vw] mt-12 md:mt-4">
      <span className="font-semibold text-[#5e17eb] text-lg md:text-xl tracking-[-0.20px]">
        {t('title')}
      </span>
      <h2 className="font-bold text-[#4e4e4e] text-2xl md:text-[40px] tracking-[-0.40px] mt-2">
        {t('subtitle')}
      </h2>
      <div className="mt-8 flex flex-col items-center">
        <Accordion type="single" collapsible className="w-full md:w-4/5">
          {faqKeys.map((key) => (
            <AccordionItem
              key={key}
              value={`item-${key}`}
              className="border-b border-[#e5e5e5]"
            >
              <AccordionTrigger className="py-4 font-semibold text-[#4e4e4e] text-base md:text-xl flex justify-between hover:text-[#5e17eb] text-left">
                {t(`items.${key}.question`)}
              </AccordionTrigger>
              <AccordionContent className="text-[#4e4e4e] text-sm md:text-base">
                {t(`items.${key}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FooterSection() {
  const t = useTranslations('LandingPage.footer');
  // Define keys for the footer links
  const usefulLinkKeys = ['0', '1', '2'] as const;
  const legalLinkKeys = ['0', '1', '2'] as const;

  return (
    <footer className="bg-[#5e17eb] rounded-[20px_20px_0px_0px] md:rounded-[40px_40px_0px_0px] py-8 md:py-16 px-4 sm:px-8 md:px-16 lg:px-36 mt-12 md:mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start w-full gap-8 md:gap-0">
        <div className="w-full md:w-1/3 text-left">
          <div className="flex items-start justify-start md:-mt-10">
            <img className="h-16 md:h-auto" alt="Group" src="/urlinklogo-white.svg" />
          </div>
          <p className="font-light text-[#f7f7f7] text-sm md:text-base tracking-[-0.16px] mt-4 md:mt-0">
            {t('description')}
          </p>
        </div>
        <div className="w-full md:w-fit flex flex-col md:flex-row items-start justify-start md:justify-evenly gap-8 md:gap-16">
          <div className="w-full md:w-fit">
            <h3 className="font-semibold text-[#f7f7f7] text-base tracking-[-0.16px] text-left">
              {t('links.useful.title')}
            </h3>
            <ul className="mt-4 space-y-4 text-left">
              {usefulLinkKeys.map((key) => (
                <li key={key}>
                  <Link href="#" className="font-light text-[#f7f7f7] text-sm md:text-base tracking-[-0.16px]">
                    {t(`links.useful.items.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-fit">
            <h3 className="font-semibold text-[#f7f7f7] text-base tracking-[-0.16px] text-left">
              {t('links.legal.title')}
            </h3>
            <ul className="mt-4 space-y-4 text-left">
              {legalLinkKeys.map((key) => (
                <li key={key}>
                  <Link href="#" className="font-light text-[#f7f7f7] text-sm md:text-base tracking-[-0.16px]">
                    {t(`links.legal.items.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-fit md:ml-0 lg:ml-12 text-left">
            <h3 className="font-semibold text-[#f7f7f7] text-base tracking-[-0.16px]">
              {t('links.social.title')}
            </h3>
            <div className="flex items-start justify-start gap-6 mt-4">
              <Link href="https://www.instagram.com/molaroriccardo/" target="_blank" rel="noopener noreferrer">
                <svg width="26" height="27" viewBox="0 0 26 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.66912 13.2605C8.66912 10.8668 10.609 8.9259 13.0026 8.9259C15.3963 8.9259 17.3372 10.8668 17.3372 13.2605C17.3372 15.6541 15.3963 17.595 13.0026 17.595C10.609 17.595 8.66912 15.6541 8.66912 13.2605ZM6.32594 13.2605C6.32594 16.948 9.31509 19.9372 13.0026 19.9372C16.6902 19.9372 19.6793 16.948 19.6793 13.2605C19.6793 9.57291 16.6902 6.58376 13.0026 6.58376C9.31509 6.58376 6.32605 9.5727 6.32605 13.2605M18.3835 6.31902C18.3833 6.62762 18.4747 6.92933 18.6461 7.18599C18.8174 7.44265 19.061 7.64274 19.3461 7.76095C19.6311 7.87916 19.9449 7.91019 20.2476 7.8501C20.5503 7.79002 20.8283 7.64153 21.0466 7.4234C21.2649 7.20527 21.4137 6.92731 21.474 6.62466C21.5343 6.32201 21.5035 6.00827 21.3856 5.72312C21.2676 5.43796 21.0677 5.19419 20.8112 5.02264C20.5546 4.85108 20.253 4.75945 19.9444 4.75933H19.9438C19.5301 4.75952 19.1334 4.92389 18.8409 5.21633C18.5483 5.50877 18.3838 5.90537 18.3835 6.31902ZM7.74958 23.8444C6.48187 23.7867 5.79283 23.5755 5.33493 23.3971C4.72787 23.1608 4.29472 22.8793 3.83932 22.4245C3.38391 21.9697 3.10202 21.537 2.86672 20.9299C2.68822 20.4722 2.47706 19.783 2.41943 18.5153C2.35639 17.1447 2.3438 16.733 2.3438 13.2607C2.3438 9.78834 2.35743 9.37776 2.41943 8.00604C2.47716 6.73833 2.68988 6.05044 2.86672 5.59139C3.10306 4.98433 3.38454 4.55118 3.83932 4.09578C4.2941 3.64037 4.72683 3.35848 5.33493 3.12318C5.79263 2.94468 6.48187 2.73352 7.74958 2.67589C9.12016 2.61285 9.53187 2.60027 13.0026 2.60027C16.4734 2.60027 16.8855 2.61368 18.2573 2.6761C19.525 2.73383 20.2129 2.94655 20.6719 3.12339C21.279 3.35868 21.7121 3.64121 22.1675 4.09599C22.6229 4.55077 22.9038 4.98453 23.1401 5.5916C23.3186 6.0493 23.5298 6.73854 23.5874 8.00625C23.6505 9.37797 23.663 9.78854 23.663 13.2609C23.663 16.7332 23.6505 17.1438 23.5874 18.5155C23.5297 19.7832 23.3175 20.4722 23.1401 20.9301C22.9038 21.5372 22.6223 21.9704 22.1675 22.4247C21.7128 22.8791 21.279 23.161 20.6719 23.3973C20.2142 23.5758 19.525 23.787 18.2573 23.8446C16.8867 23.9076 16.475 23.9202 13.0026 23.9202C9.53031 23.9202 9.11974 23.9076 7.74958 23.8446M7.64191 0.336557C6.25771 0.399593 5.31184 0.619078 4.48581 0.940503C3.63086 1.27244 2.90614 1.71775 2.18247 2.44028C1.45879 3.16281 1.01462 3.88763 0.682691 4.74362C0.361266 5.57017 0.141781 6.51552 0.0787441 7.89973C0.0146671 9.28612 0 9.72936 0 13.2605C0 16.7916 0.0146671 17.2348 0.0787441 18.6212C0.141781 20.0055 0.361266 20.9507 0.682691 21.7773C1.01462 22.6322 1.4589 23.3584 2.18247 24.0806C2.90604 24.8029 3.62982 25.2475 4.48581 25.5804C5.3134 25.9018 6.25771 26.1213 7.64191 26.1844C9.02904 26.2474 9.47154 26.2631 13.0026 26.2631C16.5337 26.2631 16.977 26.2484 18.3634 26.1844C19.7477 26.1213 20.6929 25.9018 21.5195 25.5804C22.3744 25.2475 23.0991 24.8032 23.8228 24.0806C24.5465 23.3581 24.9897 22.6322 25.3226 21.7773C25.644 20.9507 25.8645 20.0054 25.9265 18.6212C25.9896 17.2338 26.0042 16.7916 26.0042 13.2605C26.0042 9.72936 25.9896 9.28612 25.9265 7.89973C25.8635 6.51541 25.644 5.56965 25.3226 4.74362C24.9897 3.88867 24.5454 3.16396 23.8228 2.44028C23.1003 1.71661 22.3744 1.27244 21.5205 0.940503C20.6929 0.619078 19.7476 0.398553 18.3644 0.336557C16.9778 0.273208 16.5348 0.257812 13.0042 0.257812C9.47362 0.257812 9.02956 0.27248 7.64244 0.336557" fill="#F7F7F7" />
                </svg>
              </Link>
              <Link href="https://www.facebook.com">
                <svg width="16" height="29" viewBox="0 0 16 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.6952 16.3695L15.6773 11.0215H9.96107V9.1301C9.96107 6.3042 11.0699 5.2171 13.9392 5.2171C14.8303 5.2171 15.5478 5.2388 15.9608 5.2822V0.4347C15.1782 0.217 13.2651 0 12.1563 0C6.30847 0 3.61277 2.7608 3.61277 8.7171V11.0215H0.00427246V16.3695H3.61277V28.0063C4.96657 28.3423 6.38267 28.5215 7.84007 28.5215C8.55757 28.5215 9.26527 28.4774 9.96037 28.3934V16.3695H14.6945H14.6952Z" fill="#F7F7F7" />
                </svg>
              </Link>
              <Link href="https://www.x.com">
                <svg width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.01998 0.858398L10.427 13.4367L0.960693 23.6632H3.09136L11.3793 14.7096L18.0755 23.6632H25.3258L15.3892 10.3775L24.2005 0.858398H22.0699L14.4373 9.10425L8.27021 0.858398H1.01998ZM4.15322 2.42808H7.48394L22.1921 22.0939H18.8614L4.15322 2.42808Z" fill="#F7F7F7" />
                </svg>
              </Link>
              <Link href="https://www.tiktok.com">
                <svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.39173 12.1265C4.57698 12.1265 3.07898 13.6327 3.07898 15.4475C3.07898 16.711 3.81748 17.8088 4.86515 18.36C4.4749 17.8193 4.24215 17.1572 4.24215 16.4409C4.24215 14.6261 5.71856 13.1497 7.53331 13.1497C7.87223 13.1497 8.19715 13.2057 8.50456 13.302V9.30496C8.18665 9.26179 7.86348 9.23438 7.53331 9.23438C7.47615 9.23438 7.42015 9.23729 7.36298 9.23846H7.34781L7.33731 12.2648C7.0299 12.1685 6.73065 12.126 6.39173 12.126V12.1265Z" fill="#F7F7F7" />
                  <path d="M19.0441 6.19979L19.026 6.19629L19.0248 9.21912C16.9948 9.21912 15.1089 8.55121 13.573 7.44871L13.5742 15.4468C13.5742 19.4205 10.3647 22.6329 6.39101 22.6329C4.85568 22.6329 3.43176 22.1685 2.2616 21.3466C3.57818 22.76 5.45301 23.6461 7.5326 23.6461C11.5063 23.6461 14.7385 20.4133 14.7385 16.4402V8.48412C16.2738 9.58604 18.1551 10.2359 20.1851 10.2359V6.32112C19.7937 6.32112 19.4122 6.27854 19.0441 6.19979Z" fill="#F7F7F7" />
                  <path d="M13.5972 15.4473V7.49117C15.1326 8.59308 17.0138 9.24292 19.0438 9.24292V6.20025C17.8713 5.94942 16.8382 5.31942 16.0776 4.44617C14.8508 3.64642 13.9653 2.36658 13.6894 0.875H10.8229L10.8165 16.5649C10.7506 18.3219 9.30447 19.7318 7.53172 19.7318C6.43389 19.7318 5.46206 19.1893 4.86414 18.3604C3.81647 17.8092 3.09956 16.7113 3.09956 15.4478C3.09956 13.6331 4.57597 12.1567 6.39072 12.1567C6.72964 12.1567 7.05456 12.2127 7.36197 12.3089V9.23942C3.46706 9.33042 0.325806 12.5247 0.325806 16.4412C0.325806 18.3353 1.06139 20.0603 2.26072 21.3477C3.43089 22.1696 4.8548 22.6537 6.39014 22.6537C10.3638 22.6537 13.5961 19.4209 13.5961 15.4478L13.5972 15.4473Z" fill="#F7F7F7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center mt-8 md:mt-16 justify-start">
        <img className="w-8 h-8 rounded-full" alt="Img" src="/img-eb741659992c-1-1.png" />
        <p className="ml-0 md:ml-3 font-light text-[#f7f7f7] text-xs md:text-sm tracking-[-0.14px] text-left mt-2 md:mt-0">
          <span>{t('creator.intro')} </span>
          <span className="font-semibold"><Link href={'https://www.instagram.com/molaroriccardo/'}>{t('creator.name')}</Link></span>
          <span>
            {t('creator.message')}
          </span>
          {' '}
          <span className="font-semibold underline"><Link href={'https://www.instagram.com/molaroriccardo/'}>{t('creator.platform')}</Link></span>
          <span>.</span>
        </p>
      </div>
    </footer>
  );
}


// **************** MAIN ENTRY *****************

export default function LandingPage() {
  return (
    <>
      <div className="bg-white flex flex-row justify-center w-full" data-model-id="1:2">
        <div className="bg-white w-full relative text-pretty">
          <HeroSection />
          <BenefitsSection />
          <ComparisonSection />
          <TestimonialSection idx={0} />
          <VideoSection />
          <FeaturesSection />
          <TestimonialSection idx={0} />
          <DashboardPreviewSection />
          <CTASection />
          <div className="h-4" />
          <TestimonialSection idx={0} />
          <FAQSection />
          <div className="h-4" />
          <TestimonialSection idx={0} />
          <FooterSection />
        </div>
      </div>
    </>
  );
};
