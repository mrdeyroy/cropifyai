'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { Nav } from '@/components/nav';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FarmerChatbot } from '@/components/farmer-chatbot';
import { useEffect, useState } from 'react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import React from 'react';

function OnlineStatusIndicator() {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleSyncStart = () => setIsSyncing(true);
    const handleSyncEnd = () => setIsSyncing(false);

    window.addEventListener('sync-start', handleSyncStart);
    window.addEventListener('sync-end', handleSyncEnd);

    return () => {
      window.removeEventListener('sync-start', handleSyncStart);
      window.removeEventListener('sync-end', handleSyncEnd);
    };
  }, []);

  if (isOnline && !isSyncing) {
    return null; // Don't show anything when online and not syncing
  }

  return (
    <Badge variant={isOnline ? 'secondary' : 'destructive'} className="flex items-center gap-2">
      {isOnline ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Syncing...</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline</span>
        </>
      )}
    </Badge>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                    (registration) => {
                        console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    (err) => {
                        console.log('Service Worker registration failed: ', err);
                    }
                );
            });
        }
    }, []);

  return (
      <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
          <SidebarHeader className="items-center justify-center p-4">
            <Link href="/landing" className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="group-data-[collapsible=icon]:size-8"
                aria-label="Home"
              >
                <Logo className="size-6 text-primary" />
              </Button>
              <h1 className="text-xl font-headline font-bold text-primary group-data-[collapsible=icon]:hidden">
                CropifyAI
              </h1>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <Nav />
          </SidebarContent>
          <SidebarFooter>
            {/* Add footer items if needed */}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1" />
            <OnlineStatusIndicator />
            <UserNav />
          </header>
          <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
            {children}
          </main>
          <FarmerChatbot />
        </SidebarInset>
      </SidebarProvider>
  );
}
