import { useState } from "react";

const features = [
  {
    number: "01",
    title: "유연한 레이아웃",
    description: "모바일부터 데스크톱까지 자연스럽게.",
  },
  {
    number: "02",
    title: "선명한 첫인상",
    description: "색상과 여백으로 담백하게.",
  },
  {
    number: "03",
    title: "작은 인터랙션",
    description: "버튼을 눌러 변화를 확인해보세요.",
  },
];

function App() {
  const [hearts, setHearts] = useState(0);

  return (
    <div className="min-h-screen bg-stone-50 font-sans break-keep text-stone-900 antialiased">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <header className="flex items-center justify-between border-b border-stone-200 py-6">
          <div className="flex items-center gap-3">
            <span
              className="flex size-10 items-center justify-center rounded-2xl bg-emerald-950 text-lg font-bold text-lime-200"
              aria-hidden="true"
            >
              h.
            </span>
            <span className="text-lg font-bold tracking-tight">한마음</span>
          </div>
          <span className="text-xs font-medium tracking-widest text-stone-500">
            UI PREVIEW
          </span>
        </header>

        <main className="py-12 sm:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <section aria-labelledby="welcome-title">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                <span
                  className="size-1.5 rounded-full bg-emerald-600"
                  aria-hidden="true"
                />
                작은 시작, 새로운 가능성
              </span>
              <h1
                id="welcome-title"
                className="mt-6 text-4xl leading-tight font-bold tracking-tight sm:text-6xl"
              >
                한마음,
                <br />
                <span className="text-emerald-700">여기서 시작해요.</span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-8 text-stone-600 sm:text-lg">
                색상부터 간격, 반응형 레이아웃까지.
                <br />
                Tailwind CSS로 구성한 한마음의 첫 예시 화면입니다.
              </p>
              <div
                className="mt-8 flex flex-wrap gap-2"
                aria-label="사용 기술"
              >
                {["React", "TypeScript", "Tailwind CSS"].map((name) => (
                  <span
                    key={name}
                    className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </section>

            <section
              aria-labelledby="hearts-title"
              className="w-full max-w-md justify-self-center overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl shadow-emerald-950/5 lg:justify-self-end"
            >
              <div
                className="flex h-48 items-center justify-center bg-emerald-950 sm:h-56"
                aria-hidden="true"
              >
                <div className="flex size-36 items-center justify-center rounded-full border border-emerald-800 bg-emerald-900">
                  <div className="flex size-24 items-center justify-center rounded-full bg-lime-200 text-emerald-950">
                    <svg
                      className="size-12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 21s-8-4.7-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.3-8 11-8 11Z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <h2
                    id="hearts-title"
                    className="text-lg font-bold"
                  >
                    지금까지 모인 마음
                  </h2>
                  <span className="rounded-full bg-lime-100 px-2.5 py-1 text-xs font-semibold text-emerald-900">
                    DEMO
                  </span>
                </div>
                <p
                  className="mt-5 flex items-baseline gap-2"
                  role="status"
                  aria-atomic="true"
                >
                  <span className="text-6xl font-bold tracking-tight text-emerald-950 tabular-nums">
                    {hearts}
                  </span>
                  <span className="text-sm text-stone-500">개의 마음</span>
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-500">
                  버튼을 눌러 작은 마음을 더해보세요.
                </p>
                <button
                  type="button"
                  onClick={() => setHearts((count) => count + 1)}
                  className="mt-6 w-full cursor-pointer rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 active:bg-emerald-950 motion-reduce:transition-none"
                >
                  마음 더하기 +
                </button>
                <div className="mt-4 flex items-center justify-between gap-4 text-xs">
                  <span className="text-stone-500">
                    새로고침하면 처음으로 돌아가요.
                  </span>
                  <button
                    type="button"
                    onClick={() => setHearts(0)}
                    disabled={hearts === 0}
                    className="shrink-0 cursor-pointer rounded px-1 py-1 font-medium text-stone-600 underline-offset-4 hover:text-emerald-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:text-stone-400 disabled:no-underline"
                  >
                    초기화
                  </button>
                </div>
              </div>
            </section>
          </div>

          <section
            aria-label="화면 구성 예시"
            className="mt-16 grid gap-8 border-t border-stone-200 pt-8 sm:mt-20 sm:grid-cols-3"
          >
            {features.map(({ number, title, description }) => (
              <div key={number}>
                <span className="text-xs font-semibold tracking-widest text-emerald-700">
                  {number}
                </span>
                <h2 className="mt-3 text-sm font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  {description}
                </p>
              </div>
            ))}
          </section>
        </main>

        <footer className="border-t border-stone-200 py-6 text-xs tracking-wide text-stone-500">
          HANMAUM · 함께 만드는 첫 번째 화면
        </footer>
      </div>
    </div>
  );
}

export default App;
