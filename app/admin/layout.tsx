'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r shadow-sm">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">くまセーフティゾーン 管理</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            href="/admin"
            className={`block px-4 py-2 rounded-md ${pathname === '/admin' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            ダッシュボード
          </Link>
          <Link
            href="/admin/reports"
            className={`block px-4 py-2 rounded-md ${pathname.startsWith('/admin/reports') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            レポート
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 mt-8 text-red-600 hover:bg-red-50 rounded-md"
          >
            ログアウト
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
