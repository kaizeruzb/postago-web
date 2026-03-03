"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";

export function FAQ() {
  const faqs = [
    {
      question: "Как долго идет посылка из Кореи?",
      answer: "Авиадоставка занимает от 7 до 14 дней. Железнодорожная доставка — от 15 до 25 дней. Сроки зависят от типа груза и таможенного оформления.",
    },
    {
      question: "Как я могу отследить свою посылку?",
      answer: "После того как посылка будет принята на нашем складе, ей будет присвоен трекинг-номер. Вы сможете отслеживать её статус на главной странице в разделе отслеживания или в личном кабинете.",
    },
    {
      question: "Что делать, если посылка повреждена?",
      answer: "Мы рекомендуем проверять посылку при получении. В случае повреждения, пожалуйста, зафиксируйте его на фото и свяжитесь с нашей службой поддержки для оформления претензии.",
    },
    {
      question: "Какие товары запрещены к пересылке?",
      answer: "К пересылке запрещены опасные вещества, оружие, наркотики, скоропортящиеся продукты и другие товары, ограниченные законодательством стран отправления и назначения.",
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Часто задаваемые вопросы</h2>
          <p className="text-gray-600">Все, что вы хотели знать о нашей работе</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition duration-150"
              >
                <span className="font-bold text-gray-900">{faq.question}</span>
                <span className={cn(
                  "text-2xl transition-transform duration-200",
                  openIdx === idx ? "rotate-45" : "rotate-0"
                )}>+</span>
              </button>
              {openIdx === idx && (
                <div className="p-6 pt-0 text-gray-600 border-t border-gray-50">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
