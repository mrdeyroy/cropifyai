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
import { LanguageProvider } from '@/hooks/use-language';
import { AuthProvider } from '@/hooks/use-auth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SidebarProvider>
          <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader className="items-center justify-center p-4">
              <Link href="/dashboard" className="flex items-center gap-2">
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
              <UserNav />
            </header>
            <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
