export function HowItWorks() {
  const steps = [
    {
      title: "Регистрация",
      description: "Зарегистрируйтесь на сайте и получите персональный ID клиента.",
      icon: "👤",
    },
    {
      title: "Покупка",
      description: "Заказывайте товары в интернет-магазинах на адрес нашего склада.",
      icon: "🛒",
    },
    {
      title: "Прием на складе",
      description: "Мы примем вашу посылку, взвесим её и подготовим к отправке.",
      icon: "📦",
    },
    {
      title: "Доставка",
      description: "Отправим посылку выбранным способом и доставим её вам.",
      icon: "✈️",
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Как это работает</h2>
          <p className="text-gray-600">Всего 4 простых шага до получения вашей посылки</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative text-center">
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gray-100 -ml-4 z-0"></div>
              )}
              <div className="relative z-10 w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-blue-50 text-4xl rounded-full border-4 border-white shadow-sm">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
