import { useCallback } from 'react';
import { useNavigate, type NavigateOptions } from 'react-router-dom';
import { to } from './paths';

/** navigate() that understands shared (Direction 01-style) paths. */
export function useNav() {
  const navigate = useNavigate();
  return useCallback(
    (path: string | number, options?: NavigateOptions) => {
      if (typeof path === 'number') navigate(path);
      else navigate(to(path), options);
    },
    [navigate],
  );
}
