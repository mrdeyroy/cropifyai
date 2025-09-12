'use client';

import { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, LogOut, User as UserIcon } from 'lucide-react';
import { LanguageSelector } from '@/components/language-selector';
import { useLanguage } from '@/hooks/use-language';
import { useUser } from '@/hooks/use-user';
import Link from 'next/link';

export function UserNav() {
  const { t } = useLanguage();
  const { user } = useUser();
  const [isLanguageSelectorOpen, setLanguageSelectorOpen] = useState(false);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${user.email}`} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{t('userNav.profile')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setLanguageSelectorOpen(true)}>
              <Globe className="mr-2 h-4 w-4" />
              <span>{t('userNav.language')}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('userNav.logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <LanguageSelector isOpen={isLanguageSelectorOpen} onOpenChange={setLanguageSelectorOpen} />
    </>
  );
}
