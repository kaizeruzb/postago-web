import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 md:py-20 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full lg:w-1/3 px-4 mb-12 lg:mb-0">
            <Link href="/" className="inline-block text-2xl font-bold text-blue-600 mb-6">
              PostaGo
            </Link>
            <p className="text-gray-500 max-w-sm">
              Ваш персональный сервис доставки товаров из Кореи, Китая и Турции. Мы делаем международные покупки доступными для каждого.
            </p>
          </div>
          <div className="w-full sm:w-1/2 lg:w-1/6 px-4 mb-12 sm:mb-0">
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-6">Компания</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600">О нас</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600">Контакты</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600">Новости</Link></li>
            </ul>
          </div>
          <div className="w-full sm:w-1/2 lg:w-1/6 px-4 mb-12 sm:mb-0">
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-6">Сервис</h3>
            <ul className="space-y-4">
              <li><Link href="#calculator" className="text-sm text-gray-500 hover:text-blue-600">Калькулятор</Link></li>
              <li><Link href="#tariffs" className="text-sm text-gray-500 hover:text-blue-600">Тарифы</Link></li>
              <li><Link href="/track" className="text-sm text-gray-500 hover:text-blue-600">Отследить</Link></li>
            </ul>
          </div>
          <div className="w-full sm:w-1/2 lg:w-1/6 px-4 mb-12 sm:mb-0">
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-6">Правовая информация</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600">Условия использования</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600">Конфиденциальность</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600">Публичная оферта</Link></li>
            </ul>
          </div>
          <div className="w-full sm:w-1/2 lg:w-1/6 px-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-6">Поддержка</h3>
            <div className="text-sm text-gray-500">
              <p className="mb-2">info@postago.uz</p>
              <p className="mb-2">+998 71 000 00 00</p>
              <p>Пн-Сб, 9:00 - 18:00</p>
            </div>
          </div>
        </div>
        <div className="pt-10 md:pt-20 text-center">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} PostaGo. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
