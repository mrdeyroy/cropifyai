import Link from 'next/link';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Twitter, Linkedin, Facebook } from 'lucide-react';

export function Footer() {
  const quickLinks = [
    { href: '#', label: 'About Us' },
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Terms of Service' },
  ];
  
  const socialLinks = [
    { href: '#', icon: <Twitter className="w-5 h-5" />, label: 'Twitter' },
    { href: '#', icon: <Facebook className="w-5 h-5" />, label: 'Facebook' },
    { href: '#', icon: <Linkedin className="w-5 h-5" />, label: 'LinkedIn' },
  ];

  return (
    <footer id="contact" className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold font-headline text-primary">
                CropifyAI
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md">
              Empowering farmers with data-driven decisions for a sustainable and profitable future.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact & Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>support@cropify.ai</li>
              <li>+91-123-456-7890</li>
              <li className="flex items-center gap-2 pt-2">
                {socialLinks.map(link => (
                  <Button key={link.label} variant="outline" size="icon" asChild>
                    <a href={link.href} aria-label={link.label}>
                      {link.icon}
                    </a>
                  </Button>
                ))}
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CropifyAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
