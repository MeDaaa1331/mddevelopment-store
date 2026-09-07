import React, { createContext, useContext, useState, useEffect } from 'react';
import { FilterState, Framework, TebexAccount, TebexCategory, TebexPackage } from '../types';
import { TebexService } from '../services/tebex';
import { TEBEX_CONFIG } from '../config/tebex';

interface StoreContextType {
  account: TebexAccount | null;
  categories: TebexCategory[];
  packages: TebexPackage[];
  filteredPackages: TebexPackage[];
  filters: FilterState;
  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setFramework: (framework: Framework) => void;
  setSortBy: (sortBy: FilterState['sortBy']) => void;
  setOnlyDiscounted: (onlyDiscounted: boolean) => void;
  resetFilters: () => void;
  selectedPackage: TebexPackage | null;
  setSelectedPackage: (pkg: TebexPackage | null) => void;
  isLive: boolean;
  isLoading: boolean;
  refreshStore: () => Promise<void>;
  currentRoute: string;
  navigate: (path: string) => void;
  isWheelOpen: boolean;
  setIsWheelOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialFilters: FilterState = {
  search: '',
  category: 'all',
  framework: 'all',
  sortBy: 'featured',
  onlyDiscounted: false,
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<TebexAccount | null>(null);
  const [categories, setCategories] = useState<TebexCategory[]>([]);
  const [packages, setPackages] = useState<TebexPackage[]>([]);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedPackage, setSelectedPackage] = useState<TebexPackage | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isWheelOpen, setIsWheelOpen] = useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin')) return '/admin';
      if (path.startsWith('/devtools')) return '/devtools';
      if (path.startsWith('/docs')) return '/docs';
      return '/';
    }
    return '/';
  });

  const navigate = (path: string) => {
    const lower = path.toLowerCase();
    let target = '/';
    if (lower.startsWith('/admin')) {
      target = '/admin';
    } else if (lower.startsWith('/devtools')) {
      target = '/devtools';
    } else if (lower.startsWith('/docs')) {
      target = '/docs';
    }

    const fullTarget = lower.startsWith('/docs') && path.includes('?') ? path : target;

    if (window.location.pathname + window.location.search !== fullTarget) {
      window.history.pushState({}, '', fullTarget);
    }
    setCurrentRoute(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin')) {
        setCurrentRoute('/admin');
      } else if (path.startsWith('/devtools')) {
        setCurrentRoute('/devtools');
      } else if (path.startsWith('/docs')) {
        setCurrentRoute('/docs');
      } else {
        setCurrentRoute('/');
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentRoute === '/') {
        document.title = 'MD Development | FiveM Scripts & Free FiveM Developer Tools Hub';
        const canonicalEl = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
        if (canonicalEl) canonicalEl.setAttribute('href', 'https://www.mddevelopment.store/');
        const ogUrl = document.querySelector<HTMLMetaElement>("meta[property='og:url']");
        if (ogUrl) ogUrl.setAttribute('content', 'https://www.mddevelopment.store/');
      } else if (currentRoute === '/admin') {
        document.title = 'Admin Analytics Dashboard | MD Development';
      } else if (currentRoute === '/docs') {
        document.title = 'Documentation Hub | MD Development';
      }
    }
  }, [currentRoute]);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await TebexService.fetchStoreData();
      setAccount(data.account);
      setCategories(data.categories);
      setPackages(data.packages);
      setIsLive(data.isLive);
    } catch (error) {
      console.error('[Tebex AutoSync] Failed to load store data:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const intervalMs = (TEBEX_CONFIG.autoSyncIntervalMinutes || 5) * 60 * 1000;
    const interval = setInterval(() => {
      loadData(true);
    }, intervalMs);

    return () => clearInterval(interval);
  }, []);

  const setSearch = (search: string) => setFilters(prev => ({ ...prev, search }));
  const setCategory = (category: string) => setFilters(prev => ({ ...prev, category }));
  const setFramework = (framework: Framework) => setFilters(prev => ({ ...prev, framework }));
  const setSortBy = (sortBy: FilterState['sortBy']) => setFilters(prev => ({ ...prev, sortBy }));
  const setOnlyDiscounted = (onlyDiscounted: boolean) => setFilters(prev => ({ ...prev, onlyDiscounted }));
  const resetFilters = () => setFilters(initialFilters);

  const packageOrderMap = React.useMemo(() => {
    const map = new Map<number, number>();
    packages.forEach((p, idx) => map.set(p.id, idx));
    return map;
  }, [packages]);

  const filteredPackages = packages.filter(pkg => {

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchName = pkg.name.toLowerCase().includes(q);
      const matchDesc = pkg.description.toLowerCase().includes(q);
      const matchCategory = pkg.category_name?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCategory) return false;
    }

    if (filters.category && filters.category !== 'all') {
      const cat = filters.category.toLowerCase();
      if (cat === 'paid') {
        if (pkg.category_type !== 'paid') return false;
      } else if (cat === 'deals') {
        if (pkg.category_type !== 'deals') return false;
      } else if (cat === 'opensource') {
        if (pkg.category_type !== 'opensource') return false;
      } else if (cat === 'free') {
        if (pkg.category_type !== 'free') return false;
      } else {
        const matchesCategory = pkg.category_name?.toLowerCase().includes(cat) || pkg.slug?.toLowerCase().includes(cat);
        if (!matchesCategory) return false;
      }
    }

    if (filters.onlyDiscounted && (!pkg.discount || pkg.discount <= 0)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return b.id - a.id;
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'featured':
      default:
        if (typeof a.order === 'number' && typeof b.order === 'number' && a.order !== b.order) {
          return a.order - b.order;
        }
        return (packageOrderMap.get(a.id) ?? 0) - (packageOrderMap.get(b.id) ?? 0);
    }
  });

  return (
    <StoreContext.Provider
      value={{
        account,
        categories,
        packages,
        filteredPackages,
        filters,
        setSearch,
        setCategory,
        setFramework,
        setSortBy,
        setOnlyDiscounted,
        resetFilters,
        selectedPackage,
        setSelectedPackage,
        isLive,
        isLoading,
        refreshStore: () => loadData(false),
        currentRoute,
        navigate,
        isWheelOpen,
        setIsWheelOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
