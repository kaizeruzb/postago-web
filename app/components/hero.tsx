import Link from "next/link";

export function Hero() {
  return (
    <section className="relative py-12 md:py-20 overflow-hidden bg-white">
      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-wrap items-center -mx-4">
          <div className="w-full lg:w-1/2 px-4 mb-10 lg:mb-0">
            <div className="max-w-lg">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
                Доставка из Кореи, Китая, Турции — просто и прозрачно
              </h1>
              <p className="text-base md:text-xl text-gray-600 mb-8 md:mb-10">
                PostaGo — ваш надежный партнер в международной логистике. Мы доставляем ваши посылки быстро, бережно и по лучшим тарифам.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="px-8 py-4 text-center text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-full transition duration-200"
                >
                  Начать пользоваться
                </Link>
                <Link
                  href="#calculator"
                  className="px-8 py-4 text-center text-gray-900 font-bold bg-gray-100 hover:bg-gray-200 rounded-full transition duration-200"
                >
                  Рассчитать стоимость
                </Link>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 px-4">
            <div className="relative max-w-lg mx-auto lg:mr-0">
              <div className="absolute top-0 left-0 w-full h-full bg-blue-100 rounded-3xl transform -rotate-3"></div>
              <div className="relative bg-white p-6 md:p-8 rounded-3xl shadow-xl">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <span className="text-sm font-bold text-blue-600 uppercase">Последние отправления</span>
                  <span className="flex items-center text-sm text-gray-400">
                    <span className="inline-block w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                    В пути
                  </span>
                </div>
                <div className="space-y-3 md:space-y-4">
                  {[
                    { from: "Сеул, Корея", to: "Ташкент, УЗ", status: "В пути" },
                    { from: "Гуанчжоу, Китай", to: "Алматы, КЗ", status: "На таможне" },
                    { from: "Стамбул, Турция", to: "Ташкент, УЗ", status: "Доставлено" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center p-3 md:p-4 bg-gray-50 rounded-2xl">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-bold">
                        {item.from[0]}
                      </div>
                      <div className="ml-3 md:ml-4 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.from} → {item.to}</p>
                        <p className="text-xs text-gray-500">{item.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
