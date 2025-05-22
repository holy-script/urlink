"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

interface LogoCarouselProps {
  className?: string;
}

const LogoCarousel: React.FC<LogoCarouselProps> = ({ className = '' }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollerRef.current) return;

    const scroller = scrollerRef.current;
    const scrollerContent = Array.from(scroller.children);

    scrollerContent.forEach(item => {
      const duplicatedItem = item.cloneNode(true);
      scroller.appendChild(duplicatedItem);
    });

    scroller.setAttribute('data-animated', 'true');

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      scroller.setAttribute('data-animated', 'false');
    }
  }, []);

  return (
    <div className={`w-full mt-8 md:mt-14 overflow-hidden ${className}`}>
      <div className="scroller relative flex w-max">
        <div
          ref={scrollerRef}
          className="flex items-center gap-8 md:gap-16 [&[data-animated=true]]:animate-scroll"
          data-animated="false"
        >
          <Image className="h-6 md:h-8 w-auto" alt="Logo 1" src="/group-12.png" width={48} height={32} />
          <Image className="h-6 md:h-8 w-auto" alt="Logo 2" src="/group-14.png" width={48} height={32} />
          <Image className="h-8 md:h-12 w-auto" alt="Logo 3" src="/group-16.png" width={64} height={48} />
          <Image className="h-6 md:h-8 w-auto" alt="Logo 4" src="/group-13.png" width={48} height={32} />
          <Image className="h-8 md:h-10 w-auto" alt="Logo 5" src="/group-15.png" width={64} height={40} />
          <Image className="h-6 md:h-8 w-auto" alt="Logo 6" src="/group-17.png" width={48} height={32} />
        </div>
      </div>
    </div>
  );
};

export default LogoCarousel;
