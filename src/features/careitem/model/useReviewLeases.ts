import { useEffect, useRef, useState } from "react";
import {
  acquireEditLease,
  releaseEditLease,
  renewEditLease,
} from "../api/editLockApi";
import type { AcquiredLease } from "../api/editLockTypes";
export type LeaseTarget = { itemId: string; version: string };
type LeaseState = {
  key: string;
  leases: AcquiredLease[];
  error: unknown;
  ready: boolean;
};
export function useReviewLeases(
  space: string,
  targets: LeaseTarget[],
  enabled: boolean,
) {
  const key = JSON.stringify([space, targets, enabled]);
  const [state, setState] = useState<LeaseState>({
    key: "",
    leases: [],
    error: null,
    ready: false,
  });
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const expireCurrent = useRef<(() => void) | null>(null);
  const releaseCurrent = useRef<(() => Promise<void>) | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let invalidated = false;
    const current = () => active && !invalidated;
    const targets: LeaseTarget[] = JSON.parse(key)[1];
    let timer: ReturnType<typeof setTimeout> | undefined;
    const leases: AcquiredLease[] = [];
    const previous = queue.current;
    const release = async () => {
      await Promise.allSettled(
        leases
          .splice(0)
          .map((lease) =>
            releaseEditLease(space, lease.itemId, lease.leaseToken),
          ),
      );
    };
    const fail = (error: unknown) => {
      invalidated = true;
      if (timer) clearTimeout(timer);
      if (active) setState({ key, leases: [], error, ready: false });
    };
    const expire = () => {
      fail(
        new Error(
          "편집 확인 시간이 만료됐어요. 최신 내용을 다시 확인해 주세요.",
        ),
      );
      void release();
    };
    expireCurrent.current = expire;
    const publish = () => {
      if (!current()) return false;
      if (leases.some((lease) => Date.parse(lease.expiresAt) <= Date.now())) {
        expire();
        return false;
      }
      const ready =
        leases.length === targets.length &&
        targets.every((target) =>
          leases.some((lease) => lease.itemId === target.itemId),
        );
      setState({ key, leases: [...leases], error: null, ready });
      return ready;
    };
    const schedule = () => {
      if (!current() || !leases.length) return;
      timer = setTimeout(
        () => void renew(),
        Math.max(
          1000,
          Math.min(...leases.map((l) => l.renewAfterSeconds)) * 1000,
        ),
      );
    };
    const renew = async () => {
      if (!current()) return;
      if (document.visibilityState === "hidden") {
        schedule();
        return;
      }
      try {
        for (let i = 0; i < leases.length; i++) {
          const lease = leases[i];
          if (Date.parse(lease.expiresAt) <= Date.now())
            throw new Error(
              "편집 확인 시간이 만료됐어요. 최신 내용을 다시 확인해 주세요.",
            );
          const renewed = await renewEditLease(
            space,
            lease.itemId,
            lease.leaseToken,
          );
          if (!current()) return;
          leases[i] = { ...renewed, leaseToken: lease.leaseToken };
        }
        if (publish()) schedule();
      } catch (error) {
        fail(error);
        await release();
      }
    };
    const start = (async () => {
      await previous;
      if (!current()) return;
      try {
        if (new Set(targets.map((t) => t.itemId)).size !== targets.length)
          throw new Error("같은 돌봄 항목의 제안은 하나씩 반영해 주세요.");
        for (const target of targets) {
          const lease = await acquireEditLease(
            space,
            target.itemId,
            target.version,
          );
          // 만료·언마운트 이후 도착한 획득 응답은 상태에 넣지 않고 반환한다.
          if (!current()) {
            await releaseEditLease(space, lease.itemId, lease.leaseToken);
            return;
          }
          leases.push(lease);
        }
        if (publish()) schedule();
      } catch (error) {
        fail(error);
        await release();
      }
    })();
    queue.current = start;
    const releaseBeforeRestart = async () => {
      invalidated = true;
      if (timer) clearTimeout(timer);
      await start;
      await release();
    };
    releaseCurrent.current = releaseBeforeRestart;
    const visible = () => {
      if (
        document.visibilityState === "visible" &&
        leases.some((l) => Date.parse(l.expiresAt) <= Date.now())
      ) {
        expire();
      }
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      active = false;
      if (expireCurrent.current === expire) expireCurrent.current = null;
      if (releaseCurrent.current === releaseBeforeRestart)
        releaseCurrent.current = null;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", visible);
      queue.current = start.then(release);
    };
  }, [space, key, enabled]);
  return {
    release: () => releaseCurrent.current?.() ?? Promise.resolve(),
    ready: !targets.length || (state.key === key && state.ready),
    ensureCurrent: () => {
      if (!targets.length) return true;
      if (state.key !== key || !state.ready) return false;
      if (state.leases.every((l) => Date.parse(l.expiresAt) > Date.now()))
        return true;
      expireCurrent.current?.();
      return false;
    },
    error: state.key === key ? state.error : null,
    leases: state.key === key ? state.leases : [],
  };
}
