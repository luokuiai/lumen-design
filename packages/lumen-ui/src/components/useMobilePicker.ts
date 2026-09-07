import { useEffect, useState } from 'react';

const MOBILE_VIEWPORT_QUERY = '(width < 40rem)';

export const useMobilePicker = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 640);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.(MOBILE_VIEWPORT_QUERY);
    const update = () => setIsMobile(mediaQuery?.matches ?? window.innerWidth < 640);
    update();
    mediaQuery?.addEventListener?.('change', update);
    window.addEventListener('resize', update);
    return () => {
      mediaQuery?.removeEventListener?.('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return isMobile;
};
