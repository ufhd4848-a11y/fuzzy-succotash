# SushiWave - E-commerce Platform for Sushi Delivery

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js 14">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/Docker-24.0-blue?style=for-the-badge&logo=docker" alt="Docker">
</p>

## Описание

SushiWave - это полнофункциональная платформа электронной коммерции для доставки суши и японской кухни. Проект включает в себя современный веб-интерфейс, мощный бэкенд API и полную интеграцию с базой данных.

## Функциональность

### Клиентская часть (Frontend)
- 🎨 Современный адаптивный дизайн с темной/светлой темой
- 🔍 Поиск и фильтрация товаров
- 🛒 Корзина покупок с синхронизацией
- 👤 Личный кабинет пользователя
- 📜 История заказов
- 💳 Оформление заказа
- ⭐ Отзывы и рейтинги

### Административная панель
- 📊 Управление товарами (CRUD)
- 📁 Управление категориями
- 📦 Управление заказами
- 👥 Управление пользователями
- 📈 Статистика продаж

### Бэкенд (Backend)
- 🔐 JWT аутентификация с refresh токенами
- 🛡️ Защита API endpoints
- 📧 Email уведомления
- 🖼️ Загрузка и обработка изображений
- 📝 Валидация данных
- 🚀 Оптимизированные запросы к БД

## Технологический стек

### Frontend
- **Next.js 14** - React фреймворк с App Router
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **Zustand** - Управление состоянием
- **React Hook Form** - Формы
- **Zod** - Валидация
- **Framer Motion** - Анимации
- **Axios** - HTTP клиент

### Backend
- **Node.js** - Runtime
- **Express** - Web фреймворк
- **TypeScript** - Типизация
- **Prisma ORM** - Работа с БД
- **PostgreSQL** - База данных
- **JWT** - Аутентификация
- **bcrypt** - Хеширование паролей
- **Winston** - Логирование

### DevOps
- **Docker** - Контейнеризация
- **Docker Compose** - Оркестрация

## Установка и запуск

### Предварительные требования
- Node.js 18+
- Docker и Docker Compose
- Git

### Локальная разработка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/sushiwave.git
cd sushiwave
```

2. Создайте файл окружения:
```bash
cp .env.example .env
```

3. Запустите с Docker Compose:
```bash
docker-compose up -d
```

4. Инициализируйте базу данных:
```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

5. Откройте приложение:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Ручная установка

#### Backend
```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Структура проекта

```
sushiwave/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Конфигурация
│   │   ├── controllers/    # Контроллеры
│   │   ├── middleware/     # Middleware
│   │   ├── routes/         # Маршруты
│   │   ├── services/       # Сервисы
│   │   ├── utils/          # Утилиты
│   │   ├── types/          # TypeScript типы
│   │   └── seeds/          # Seed данные
│   ├── prisma/
│   │   └── schema.prisma   # Схема БД
│   └── Dockerfile
├── frontend/               # Frontend приложение
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # React компоненты
│   │   ├── lib/           # Утилиты и API
│   │   ├── store/         # Zustand store
│   │   └── types/         # TypeScript типы
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/refresh` - Обновление токена
- `POST /api/auth/logout` - Выход
- `GET /api/auth/me` - Текущий пользователь

### Пользователи
- `GET /api/users` - Список пользователей (admin)
- `GET /api/users/:id` - Получить пользователя
- `PUT /api/users/profile` - Обновить профиль
- `PUT /api/users/password` - Изменить пароль

### Категории
- `GET /api/categories` - Список категорий
- `GET /api/categories/:slug` - Получить категорию
- `POST /api/categories` - Создать категорию (admin)
- `PUT /api/categories/:id` - Обновить категорию (admin)
- `DELETE /api/categories/:id` - Удалить категорию (admin)

### Товары
- `GET /api/products` - Список товаров
- `GET /api/products/featured` - Рекомендуемые товары
- `GET /api/products/slug/:slug` - Получить товар по slug
- `GET /api/products/:id` - Получить товар по ID
- `POST /api/products` - Создать товар (admin)
- `PUT /api/products/:id` - Обновить товар (admin)
- `DELETE /api/products/:id` - Удалить товар (admin)

### Заказы
- `GET /api/orders` - Список заказов (admin)
- `GET /api/orders/my-orders` - Мои заказы
- `GET /api/orders/:id` - Получить заказ
- `POST /api/orders` - Создать заказ
- `PUT /api/orders/:id` - Обновить заказ (admin)
- `POST /api/orders/:id/cancel` - Отменить заказ
- `POST /api/orders/:id/pay` - Оплатить заказ

### Корзина
- `POST /api/cart` - Получить корзину
- `POST /api/cart/validate` - Валидировать корзину
- `POST /api/cart/totals` - Получить суммы

## Переменные окружения

### Backend
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/sushiwave
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=SushiWave
```

## Деплой

### Vercel (Frontend)
1. Подключите репозиторий к Vercel
2. Установите переменные окружения
3. Настройте домен

### Railway/Render (Backend)
1. Создайте новый проект
2. Подключите репозиторий
3. Установите переменные окружения
4. Добавьте PostgreSQL базу данных

### Supabase/Neon (Database)
1. Создайте проект
2. Получите строку подключения
3. Обновите DATABASE_URL

## Тестовые данные

После seed'а базы данных доступны следующие аккаунты:

**Администратор:**
- Email: admin@sushiwave.com
- Password: admin123

**Пользователь:**
- Email: user@example.com
- Password: user123

## Лицензия

MIT License - см. [LICENSE](LICENSE) файл

## Авторы

- **SushiWave Team** - *Initial work*

## Поддержка

Если у вас есть вопросы или предложения, пожалуйста, создайте issue в репозитории.

---

<p align="center">
  Сделано с ❤️ командой SushiWave
</p>