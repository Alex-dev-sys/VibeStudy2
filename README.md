# VibeStudy 2.0

VibeStudy — учебная платформа для практического изучения программирования: карьерные треки, ежедневные уроки, браузерный редактор, AI-подсказки и проверка решений.

## Что входит

- React 19, TypeScript, Vite и Tailwind CSS.
- Supabase Auth, Postgres/RLS и Edge Functions.
- Серверная генерация уроков через OpenAI: ключ провайдера не попадает в браузер.
- Бесплатный тариф: один выбранный трек, первые 3 дня и 3 AI-подсказки в день.
- Pro на 30 или 90 дней через одноразовую оплату Binance Pay без автопродления.
- Атомарные серверные лимиты, проверка срока подписки и кэш уроков.

## Локальный запуск

Требования: Node.js 20+, npm и Supabase CLI (CLI можно запускать через `npx`).

```bash
git clone https://github.com/Alex-dev-sys/VibeStudy2.git
cd VibeStudy2
npm ci
cp .env.example .env
npm run dev
```

В `.env` укажите публичные `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`. Секреты OpenAI и Binance Pay хранятся только в Supabase Edge Functions.

## Проверки

```bash
npm run lint
npm run test:unit
npx playwright install chromium
npm run test:e2e
npm run build
npm audit
```

Для авторизованных E2E-тестов задайте `E2E_AUTH_STORAGE_STATE` с путём к Playwright storage state.

## Supabase

Привяжите проект и примените все миграции:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Добавьте секреты Edge Functions:

```text
OPENAI_API_KEY
APP_BASE_URL
BINANCE_PAY_API_KEY
BINANCE_PAY_SECRET_KEY
BINANCE_PAY_BASE_URL
BINANCE_PAY_CURRENCY
BINANCE_PAY_ORDER_EXPIRE_MINUTES
BINANCE_PAY_PRO_MONTHLY_AMOUNT
BINANCE_PAY_PRO_THREE_MONTH_AMOUNT
```

Затем разверните пользовательские функции и webhook:

```bash
npx supabase functions deploy generate-lesson
npx supabase functions deploy create-checkout-session
npx supabase functions deploy billing-webhook
npx supabase functions deploy reset-user-state
```

`APP_BASE_URL` должен быть доверенным origin приложения, например `https://app.example.com`. Webhook Binance Pay должен указывать на `/functions/v1/billing-webhook`.

Перед production-запуском пройдите [чек-лист](docs/LAUNCH_CHECKLIST.md).

## Лицензия

MIT — см. [LICENSE](LICENSE).
