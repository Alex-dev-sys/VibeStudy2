# 🐙 Настройка GitHub OAuth для VibeStudy

## Предварительные требования
- Аккаунт GitHub
- Supabase проект

---

## Шаг 1: Создание OAuth App на GitHub

1. Перейди в **[GitHub Developer Settings](https://github.com/settings/developers)**
2. Нажми **OAuth Apps** в левом меню
3. Нажми **New OAuth App**

---

## Шаг 2: Заполнение формы

| Поле | Значение |
|------|----------|
| Application name | `VibeStudy` |
| Homepage URL | `http://localhost:5174` |
| Application description | `AI-powered IT education platform` |
| Authorization callback URL | `https://ohaiwgftivxgpqldqsud.supabase.co/auth/v1/callback` |

> ⚠️ **Важно**: Authorization callback URL должен быть именно Supabase callback, не localhost!

4. Нажми **Register application**

---

## Шаг 3: Получение ключей

1. После создания приложения ты увидишь **Client ID** — скопируй его
2. Нажми **Generate a new client secret**
3. **Скопируй Client Secret сразу** — он показывается только один раз!

---

## Шаг 4: Настройка в Supabase

1. Перейди в **[Supabase Dashboard](https://supabase.com/dashboard)**
2. Открой свой проект
3. Перейди в **Authentication → Providers**
4. Найди **GitHub** и нажми на него
5. Включи **Enable Sign in with GitHub**
6. Вставь:
   - **Client ID** — из GitHub
   - **Client Secret** — из GitHub
7. Нажми **Save**

---

## Шаг 5: Проверка

1. Открой приложение: `http://localhost:5174`
2. Нажми кнопку **GitHub** на странице авторизации
3. Должен появиться GitHub popup для авторизации

---

## Возможные ошибки

### "The redirect_uri is not valid"
→ Проверь что callback URL в GitHub точно совпадает:
```
https://ohaiwgftivxgpqldqsud.supabase.co/auth/v1/callback
```

### "Bad credentials"
→ Проверь что Client Secret скопирован правильно и без пробелов

### "Application suspended"
→ GitHub заблокировал приложение. Проверь email на уведомления

---

## Продакшн

Для продакшена обнови в GitHub OAuth App:
- **Homepage URL**: `https://your-domain.com`
- **Authorization callback URL**: оставь тот же Supabase callback URL (он не меняется)

---

## Дополнительные scopes (опционально)

По умолчанию GitHub OAuth предоставляет:
- `read:user` — базовая информация о пользователе
- `user:email` — email пользователя

Если нужен доступ к репозиториям, добавь scopes в Supabase:
```
repo, read:org
```
