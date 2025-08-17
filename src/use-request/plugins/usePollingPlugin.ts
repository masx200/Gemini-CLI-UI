import { useUpdateEffect } from 'ahooks';
import { useRef } from 'react';

import type { Plugin, Timeout } from '../type.ts';
import isDocumentVisible from '../utils/isDocumentVisible.ts';
import subscribeReVisible from '../utils/subscribeReVisible.ts';

const usePollingPlugin: Plugin<any, any[]> = (
  fetchInstance,
  { pollingErrorRetryCount = -1, pollingInterval, pollingWhenHidden = true }
) => {
  const timerRef = useRef<Timeout>(null);
  const unsubscribeRef = useRef<() => void>(null);
  const countRef = useRef<number>(0);

  const stopPolling = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    unsubscribeRef.current?.();
  };

  useUpdateEffect(() => {
    if (!pollingInterval) {
      stopPolling();
    }
  }, [pollingInterval]);

  if (!pollingInterval) {
    return {};
  }

  return {
    onBefore: () => {
      stopPolling();
      return null;
    },
    onCancel: () => {
      stopPolling();
    },
    onError: () => {
      countRef.current += 1;
    },
    onFinally: () => {
      if (
        pollingErrorRetryCount === -1 ||
        // When an error occurs, the request is not repeated after pollingErrorRetryCount retries
        (pollingErrorRetryCount !== -1 && countRef.current <= pollingErrorRetryCount)
      ) {
        //@ts-ignore
        timerRef.current = setTimeout(() => {
          // if pollingWhenHidden = false && document is hidden, then stop polling and subscribe revisible
          if (!pollingWhenHidden && !isDocumentVisible()) {
            //@ts-ignore
            unsubscribeRef.current = subscribeReVisible(() => {
              fetchInstance.refresh();
            });
          } else {
            fetchInstance.refresh();
          }
        }, pollingInterval);
      } else {
        countRef.current = 0;
      }
    },
    onSuccess: () => {
      countRef.current = 0;
    }
  };
};

export default usePollingPlugin;
