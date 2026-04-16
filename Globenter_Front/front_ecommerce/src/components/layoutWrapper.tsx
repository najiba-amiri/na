'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from '@/store/store';
import TopNav from '@/components/home/topNav';
import MainNav from '@/components/home/mainNav';
import ListItems from '@/components/home/listItems';
import MobileBottomNav from '@/components/home/mobileBottomNav';
import Footer from '@/components/home/footer';
import { AppDispatch, RootState } from '@/store/store';
import { getUser, logout } from '@/store/slices/authSlice';
import { clearProfile } from '@/store/slices/profileSlice';

interface LayoutWrapperProps {
  children: ReactNode;
  locale: string;
}

export default function LayoutWrapper({ children, locale }: LayoutWrapperProps) {
  const pathname = usePathname();
  // Hide TopNav/MainNav/ListItems/Footer for auth pages AND Manager pages
  const hideLayout = pathname?.includes('/auth') || pathname?.includes('/Manager');

  return (
    <Provider store={store}>
      <AuthBootstrap />
      <div className={`app sidebar-mini overflow-x-hidden ${locale === 'fa' ? 'rtl' : 'ltr'}`}>
        {/* Navigation & sidebar for non-auth and non-manager pages */}
        {!hideLayout && (
          <>
            <TopNav />
            <MainNav />
            <ListItems />
          </>
        )}

        {/* Main content */}
        <main className={`flex-1 ${!hideLayout ? "pb-[88px] md:pb-0" : ""}`}>
          {children}
        </main>

        {/* Footer for non-auth and non-manager pages */}
        {!hideLayout && <Footer />}
        {!hideLayout && <MobileBottomNav />}
      </div>
    </Provider>
  );
}

function AuthBootstrap() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const attempted = useRef(false);
  const { access, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!access || user || attempted.current) return;
    attempted.current = true;

    dispatch(getUser())
      .unwrap()
      .catch(() => {
        dispatch(logout());
        dispatch(clearProfile());
      });
  }, [access, user, dispatch]);

  useEffect(() => {
    if (!pathname?.includes('/Manager')) return;
    if (access) return;
    router.replace('/auth/login');
  }, [pathname, access, router]);

  return null;
}
