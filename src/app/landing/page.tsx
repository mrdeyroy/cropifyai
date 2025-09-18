'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Workflow } from '@/components/landing/workflow';
import { Testimonials } from '@/components/landing/testimonials';
import { Footer } from '@/components/landing/footer';
import { ScrollToTop } from '@/components/landing/scroll-to-top';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LoginForm } from '@/components/login-form';
import { Card } from '@/components/ui/card';

export default function LandingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (searchParams.get('showLogin') === 'true') {
      setShowLogin(true);
    }
  }, [searchParams]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setShowLogin(false);
      // Remove the query parameter from the URL
      const current = new URL(window.location.toString());
      current.searchParams.delete('showLogin');
      router.replace(current.pathname + current.search, { scroll: false });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Workflow />
        <Testimonials />
      </main>
      <Footer />
      <ScrollToTop />
      
      <Dialog open={showLogin} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md p-0">
          <Card className="border-0 shadow-none">
            <LoginForm />
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
}
