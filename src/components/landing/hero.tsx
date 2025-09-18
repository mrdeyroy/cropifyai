import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  return (
    <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center">
      {heroImage && (
         <Image
            src={heroImage.imageUrl}
            alt="AI in Farming"
            fill
            className="object-cover"
            data-ai-hint={heroImage.imageHint}
            priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20" />
      <div className="relative z-10 container mx-auto text-center text-foreground px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold font-headline leading-tight tracking-tighter drop-shadow-md">
          AI-Powered Farming Decisions, <br/>Made Simple 🌱
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-foreground/90 drop-shadow-sm">
          Get personalized crop recommendations, disease detection, profit tracking, and real-time market prices – all in your local language.
        </p>
        <div className="mt-8 flex justify-center">
          <Button size="lg" asChild className="text-lg">
            <Link href="/signup">
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
