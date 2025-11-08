import { useCallback, useEffect, useRef, useState } from "react";

/** 공통: 비동기 실행 헬퍼 (로딩/에러/데이터 + 실행자 반환) */
export function useAsyncFn<T, A extends any[] = any[]>(
  fn: (...args: A) => Promise<T>,
  options?: { immediateArgs?: A; auto?: boolean }
) {
  const isMounted = useRef(true);
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (...args: A) => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await fn(...args);
        if (isMounted.current) setData(result);
        return result;
      } catch (e: any) {
        if (isMounted.current) setError(e?.message ?? "Unknown error");
        throw e;
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [fn]
  );

  useEffect(() => {
    isMounted.current = true;
    if (options?.auto && options.immediateArgs) {
      run(...options.immediateArgs);
    }
    return () => {
      isMounted.current = false;
    };
  }, [options?.auto, JSON.stringify(options?.immediateArgs), run]);

  return { data, error, loading, run, setData } as const;
}

/** 공통: 단순 fetch 패턴 (auto=true이면 mount 시 실행) */
export function useFetch<T>(fetcher: () => Promise<T>, auto = true) {
  const { data, error, loading, run, setData } = useAsyncFn<T, []>(fetcher, {
    auto,
    immediateArgs: [],
  });
  return { data, error, loading, refetch: run, setData } as const;
}
