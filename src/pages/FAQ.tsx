import React from 'react';
import { Theme } from '../types';
import { cn } from '../lib/utils';
import { Leaf } from 'lucide-react';

interface FAQProps {
  theme: Theme;
}

export function FAQ({ theme }: FAQProps) {
  const faqs = [
    {
      q: "How much does it cost to post a job?",
      a: "Flat-rate pricing for studios: $30 in 2026, and $50 in 2027. It's the same for everyone. No bidding to the top, no premium placements."
    },
    {
      q: "What is a Talent Passport?",
      a: "A free, beautiful, shareable profile page for candidates. You can showcase up to 6 project images, your bio, and link your external portfolio."
    },
    {
      q: "What are Cre8tiv Exclusives?",
      a: "These are direct, spam-free listings from studios that are only posted on our board. You won't find them buried under 500 promoted ads on LinkedIn."
    },
    {
      q: "Why are you doing this?",
      a: "Because the creative industry deserves better than beige, corporate job boards that prioritize ad spend over talent. We want to connect real makers with real studios."
    },
    {
      q: "Who is Carlos?",
      a: "Carlos is a Chihuahua and our Chief Morale Officer. He approves all major design decisions and requires a steady stream of treats (funded by 33% of our revenue)."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-24">
      <div className="text-center space-y-6">
        <h1 className={cn(
          "text-5xl md:text-7xl",
          theme === 'neo' && "font-display-neo uppercase",
          theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
          theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43]"
        )}>
          {theme === 'neo' && "How It Works"}
          {theme === 'cottagecore' && "Frequently Asked Questions"}
          {theme === 'lame' && "Information Resources"}
        </h1>
        {theme === 'cottagecore' && <Leaf className="w-8 h-8 mx-auto text-[#8a9a5b]" />}
      </div>

      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <div key={i} className={cn(
            "p-8 transition-all",
            theme === 'neo' && "bg-white border-4 border-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
            theme === 'cottagecore' && "bg-[#fdfbf7] rounded-2xl border border-[#d2c5b3] hover:shadow-md",
            theme === 'lame' && "bg-white rounded-lg border border-[#D9E2EC] shadow-sm hover:border-[#00FFFF]"
          )}>
            <h3 className={cn(
              "text-2xl mb-4",
              theme === 'neo' && "font-display-neo uppercase",
              theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
              theme === 'lame' && "font-display-lame font-bold text-[#102A43]"
            )}>
              {faq.q}
            </h3>
            <p className={cn(
              "text-lg",
              theme === 'neo' && "font-mono text-gray-700",
              theme === 'cottagecore' && "font-serif text-[#c86b5e]",
              theme === 'lame' && "font-display-lame text-[#486581]"
            )}>
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
