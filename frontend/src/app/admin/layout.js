import AuthProvider from '@/components/AuthProvider';
import SignOutButton from '@/components/SignOutButton';

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <span className="font-semibold text-gray-800">Seminario Reformado — Admin</span>
          <SignOutButton />
        </header>
        <main>{children}</main>
      </div>
    </AuthProvider>
  );
}
