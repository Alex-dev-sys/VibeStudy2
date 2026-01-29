# 🔐 Настройка Google OAuth для VibeStudy

## Предварительные требования
- Аккаунт Google
- Доступ к [Google Cloud Console](https://console.cloud.google.com)
- Supabase проект

---

## Шаг 1: Создание проекта в Google Cloud

1. Перейди на **[console.cloud.google.com](https://console.cloud.google.com)**
2. Нажми на селектор проектов вверху → **New Project**
3. Введи название: `VibeStudy`
4. Нажми **Create**

---

## Шаг 2: OAuth Consent Screen

1. В левом меню: **APIs & Services → OAuth consent screen**
2. Выбери **External** → нажми **Create**
3. Заполни обязательные поля:

| Поле | Значение |
|------|----------|
| App name | `VibeStudy` |
| User support email | Твой email |
| Developer contact | Твой email |

4. Нажми **Save and Continue**
5. На странице **Scopes** нажми **Add or Remove Scopes**
6. Добавь:
   - `email`
   - `profile`
   - `openid`
7. **Save and Continue** → **Save and Continue** → **Back to Dashboard**

---

## Шаг 3: Создание OAuth Client ID

1. В левом меню: **APIs & Services → Credentials**
2. Нажми **+ CREATE CREDENTIALS → OAuth client ID**
3. Заполни:

| Поле | Значение |
|------|----------|
| Application type | `Web application` |
| Name | `VibeStudy Web Client` |

4. **Authorized JavaScript origins** — добавь:
```
http://localhost:5173
http://localhost:5174
```

5. **Authorized redirect URIs** — добавь:
```
https://ohaiwgftivxgpqldqsud.supabase.co/auth/v1/callback
```

6. Нажми **Create**
7. **Скопируй Client ID и Client Secret** — они понадобятся на следующем шаге!

---

## Шаг 4: Настройка в Supabase

1. Перейди в **[Supabase Dashboard](https://supabase.com/dashboard)**
2. Открой свой проект
3. Перейди в **Authentication → Providers**
4. Найди **Google** и нажми на него
5. Включи **Enable Sign in with Google**
6. Вставь:
   - **Client ID** — из Google Console
   - **Client Secret** — из Google Console
7. Нажми **Save**

---

## Шаг 5: Проверка

1. Открой приложение: `http://localhost:5174`
2. Нажми кнопку **Google** на странице авторизации
3. Должен появиться Google popup для входа

---

## Возможные ошибки

### "Redirect URI mismatch"
→ Проверь что Redirect URI в Google Console точно совпадает с Supabase callback URL

### "Access blocked: App not verified"
→ Это нормально для development. Нажми **Continue** (небезопасно) или пройди верификацию Google

### "Error 400: invalid_request"
→ Проверь что Client ID и Secret скопированы без пробелов

---

## Продакшн

Для продакшена добавь в Google Console:
- **Authorized JavaScript origins**: `https://your-domain.com`
- **Authorized redirect URIs**: оставь тот же Supabase callback URL
