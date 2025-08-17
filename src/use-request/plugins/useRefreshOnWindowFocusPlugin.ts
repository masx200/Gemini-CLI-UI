import { useUnmount } from 'ahooks';
import { useEffect, useRef } from 'react';

import type { Plugin } from '../type.ts';
import limit from '../utils/limit.ts';
import subscribeFocus from '../utils/subscribeFocus.ts';

const useRefreshOnWindowFocusPlugin: Plugin<any, any[]> = (
  fetchInstance,
  { focusTimespan = 5000, refreshOnWindowFocus }
) => {
  const unsubscribeRef = useRef<() => void>(null);

  const stopSubscribe = () => {
    unsubscribeRef.current?.();
  };

  useEffect(() => {
    if (refreshOnWindowFocus) {
      const limitRefresh = limit(fetchInstance.refresh.bind(fetchInstance), focusTimespan);
      //@ts-ignore
      unsubscribeRef.current = subscribeFocus(() => {
        limitRefresh();
      });
    }
    return () => {
      stopSubscribe();
    };
  }, [refreshOnWindowFocus, focusTimespan]);

  useUnmount(() => {
    stopSubscribe();
  });

  return {};
};

export default useRefreshOnWindowFocusPlugin;
