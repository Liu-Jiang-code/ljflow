import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">注册</h1>
      <RegisterForm />
    </div>
  );
}
