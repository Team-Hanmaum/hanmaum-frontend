import { useEffect, useState } from "react";

// 목록·홈이 오래 열려 있어도 날짜 경과를 반영한다. 항목의 상태는 변경하지 않는다.
export function useCareNow() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = window.setInterval(update, 60_000);
    window.addEventListener("focus", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, []);
  return now;
}
