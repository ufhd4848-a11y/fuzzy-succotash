# 🚀 Деплой SushiWave (Бесплатно)

## Быстрый старт (5 минут)

### Шаг 1: Форк репозитория
```bash
# На GitHub нажмите Fork или:
git clone https://github.com/yourusername/sushiwave.git
cd sushiwave
```

### Шаг 2: Деплой Backend на Render

**Через Dashboard:**
1. Перейдите на [render.com](https://render.com)
2. Нажмите "New +" → "Web Service"
3. Connect GitHub repo → Выберите `sushiwave`
4. Настройки:
   - **Name**: `sushiwave-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Plan**: `Free`
5. Нажмите "Create Web Service"

**Добавьте PostgreSQL:**
1. "New +" → "PostgreSQL"
2. **Name**: `sushiwave-db`
3. **Plan**: `Free`
4. Скопируйте "Internal Database URL"

**Environment Variables:**
В Dashboard вашего сервиса → Environment:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://... (вставьте из PostgreSQL)
JWT_SECRET=your-32-char-secret-key-here!!!
JWT_REFRESH_SECRET=your-32-char-refresh-key-here!!!
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://sushiwave.netlify.app
COOKIE_DOMAIN=onrender.com
```

**Примените миграции:**
```bash
# В Render Dashboard → Shell
npx prisma migrate deploy
npx prisma db seed
```

### Шаг 3: Деплой Frontend на Netlify

**Через Dashboard:**
1. Перейдите на [netlify.com](https://netlify.com)
2. "Add new site" → "Import an existing project"
3. Выберите GitHub → `sushiwave`
4. Настройки сборки:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. "Deploy site"

**Environment Variables:**
Site settings → Environment variables:
```
NEXT_PUBLIC_API_URL=https://sushiwave-backend.onrender.com
NEXT_PUBLIC_APP_NAME=SushiWave
```

---

## Автоматический деплой через GitHub Actions

### 1. Добавьте Secrets в GitHub

Перейдите в Settings → Secrets and variables → Actions:

```
# Render
RENDER_SERVICE_ID=your-render-service-id
RENDER_API_KEY=your-render-api-key
BACKEND_URL=https://sushiwave-backend.onrender.com

# Netlify
NETLIFY_AUTH_TOKEN=your-netlify-token
NETLIFY_SITE_ID=your-netlify-site-id

# Database
DATABASE_URL=your-database-url
```

### 2. Как получить токены

**Render API Key:**
```bash
# Dashboard → Account Settings → API Keys
# Создайте новый ключ
```

**Netlify Token:**
```bash
# Dashboard → User Settings → Applications
# Personal Access Tokens → New access token
```

**Netlify Site ID:**
```bash
# Site Settings → General → Site details
# Скопируйте Site ID
```

### 3. Готово!

Теперь при каждом push в `main`:
1. Backend автоматически деплоится на Render
2. Frontend автоматически деплоится на Netlify
3. Миграции применяются автоматически

---

## Ручной деплой через CLI

### Установите CLI инструменты
```bash
# Render CLI (через Railway)
npm install -g @railway/cli

# Netlify CLI
npm install -g netlify-cli
```

### Деплой Backend
```bash
# Логин
railway login

# В папке backend
railway link
railway up

# Миграции
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

### Деплой Frontend
```bash
# Логин
netlify login

# В папке frontend
npm install
npm run build

# Деплой
netlify deploy --prod --dir=dist
```

---

## Деплой через скрипт

```bash
# Дайте права на выполнение
chmod +x deploy.sh

# Запустите
./deploy.sh

# Выберите опцию:
# 1. Deploy Backend to Render
# 2. Deploy Frontend to Netlify
# 3. Deploy Both
```

---

## Важные моменты

### Render Free Tier
- ⚠️ Спит через 15 минут неактивности
- 💡 Решение: Используйте UptimeRobot для пинга

**Настройка UptimeRobot:**
1. Перейдите на [uptimerobot.com](https://uptimerobot.com)
2. "Add New Monitor"
3. **Monitor Type**: HTTP(s)
4. **Friendly Name**: SushiWave Backend
5. **URL**: `https://sushiwave-backend.onrender.com/health`
6. **Monitoring Interval**: 5 minutes

### Netlify Free Tier
- ✅ 100GB bandwidth/месяц
- ✅ Бесплатный SSL
- ✅ Автоматический деплой из GitHub

### База данных
**Supabase (альтернатива Render Postgres):**
1. [supabase.com](https://supabase.com) → New Project
2. Settings → Database → Connection String
3. Используйте в `DATABASE_URL`

---

## Проверка деплоя

```bash
# Проверьте backend
curl https://sushiwave-backend.onrender.com/health

# Должно вернуть:
# {"success":true,"message":"SushiWave API is running"}

# Откройте frontend
# https://sushiwave-xxx.netlify.app
```

---

## Устранение неполадок

### Backend не запускается
```bash
# Проверьте логи в Render Dashboard
# Убедитесь что DATABASE_URL правильный
# Проверьте что JWT_SECRET минимум 32 символа
```

### Frontend не собирается
```bash
# Проверьте NEXT_PUBLIC_API_URL
# Убедитесь что backend уже деплоен
# Проверьте логи сборки в Netlify
```

### CORS ошибки
```bash
# Убедитесь что FRONTEND_URL в backend env правильный
# Должен совпадать с Netlify URL
```

---

## Итоговые URL

| Сервис | URL |
|--------|-----|
| Frontend | `https://sushiwave-xxx.netlify.app` |
| Backend API | `https://sushiwave-backend.onrender.com` |
| Health Check | `https://sushiwave-backend.onrender.com/health` |

---

## Полезные ссылки

- [Render Docs](https://render.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

**Готово!** 🎉 Ваш SushiWave работает в интернете!