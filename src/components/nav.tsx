'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutGrid,
  ListChecks,
  AreaChart,
  Settings,
  Stethoscope,
  Bell,
  Landmark,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { useLanguage } from '@/hooks/use-language';

export function Nav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutGrid },
    { href: '/farms', label: t('nav.myFarms'), icon: ListChecks },
    {
      href: '/disease-detection',
      label: t('nav.diseaseDetection'),
      icon: Stethoscope,
    },
    { href: '/market-watch', label: t('nav.marketWatch'), icon: AreaChart },
    { href: '/financial-overview', label: t('nav.financials'), icon: Landmark },
    { href: '/notifications', label: t('nav.notifications'), icon: Bell },
    { href: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
            variant={pathname === item.href ? 'outline' : 'default'}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
