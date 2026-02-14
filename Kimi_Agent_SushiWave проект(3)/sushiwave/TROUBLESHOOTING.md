# Устранение неполадок

## Backend не запускается на Render

### Проблема: "Cannot find module"
```bash
# Решение: Пересоберите проект
rm -rf node_modules dist
npm install
npm run build
```

### Проблема: "DATABASE_URL is not set"
```bash
# Проверьте что DATABASE_URL добавлен в Environment Variables
# Dashboard → Web Service → Environment
```

### Проблема: "JWT_SECRET must be at least 32 characters"
```bash
# Сгенерируйте длинный секрет:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Frontend не собирается на Netlify

### Проблема: "Module not found"
```bash
# Очистите кэш и пересоберите
rm -rf node_modules .next dist
npm install
npm run build
```

### Проблема: "NEXT_PUBLIC_API_URL is not defined"
```bash
# Добавьте в Netlify Environment Variables:
# Site Settings → Environment Variables
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Проблема: "Build failed"
```bash
# Проверьте логи сборки в Netlify Dashboard
# Убедитесь что base directory = frontend
```

## CORS ошибки

### Проблема: "CORS policy: No 'Access-Control-Allow-Origin'"
```bash
# В backend .env:
FRONTEND_URL=https://your-frontend.netlify.app
# БЕЗ слеша в конце!
```

## База данных

### Проблема: "Migration failed"
```bash
# На Render Shell:
npx prisma migrate reset --force
npx prisma migrate deploy
npx prisma db seed
```

### Проблема: "Connection refused"
```bash
# Проверьте DATABASE_URL
# Убедитесь что PostgreSQL запущена
```

## Автоматический деплой

### GitHub Actions не работает
```bash
# Проверьте Secrets:
# Settings → Secrets and variables → Actions

# Проверьте логи:
# Actions → выберите workflow
```

## Полезные команды

```bash
# Проверить backend
curl https://your-backend.onrender.com/health

# Проверить переменные окружения
printenv | grep -E "(DATABASE_URL|JWT_SECRET|FRONTEND_URL)"

# Перезапустить сервис на Render
# Dashboard → Web Service → Manual Deploy → Deploy latest commit
```