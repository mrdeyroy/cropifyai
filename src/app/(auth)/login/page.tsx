'use client';

import { LoginForm } from '@/components/login-form';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  return (
      <div className="w-full max-w-sm">
        <Card>
          <LoginForm />
        </Card>
      </div>
  );
}
