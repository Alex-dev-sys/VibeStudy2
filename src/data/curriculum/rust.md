# Rust - 30-дневный курс

## Неделя 1: Основы Rust

### День 1: Введение в Rust
- Философия Rust: безопасность и производительность
- Установка rustup
- Cargo: пакетный менеджер
- Hello, World!

### День 2: Переменные и изменяемость
- let и изменяемость (mut)
- Константы (const)
- Shadowing
- Типы данных

### День 3: Скалярные типы
- Целые числа (i8, i32, u64...)
- Числа с плавающей точкой
- Булевы значения
- Символы (char)

### День 4: Составные типы
- Кортежи (Tuples)
- Массивы
- Деструктуризация
- Доступ к элементам

### День 5: Функции
- Определение функций
- Параметры
- Возвращаемые значения
- Выражения vs операторы

### День 6: Управление потоком
- if/else
- Циклы: loop, while, for
- break и continue
- Возврат значений из циклов

### День 7: Практика недели 1
- Мини-проект: Угадай число
- Повторение основ
- Решение задач

---

## Неделя 2: Ownership и References

### День 8: Ownership - основы
- Что такое ownership
- Правила ownership
- Move семантика
- Copy trait

### День 9: References и Borrowing
- Иммутабельные ссылки (&)
- Мутабельные ссылки (&mut)
- Правила borrowing
- Dangling references

### День 10: Slices
- String slices (&str)
- Array slices
- Работа со срезами
- Методы срезов

### День 11: Структуры
- Определение структур
- Создание экземпляров
- Tuple structs
- Unit-like structs

### День 12: Методы структур
- impl блоки
- self параметр
- Ассоциированные функции
- Несколько impl блоков

### День 13: Enums
- Определение enum
- Варианты с данными
- Option<T>
- match с enum

### День 14: Практика недели 2
- Мини-проект: Структура данных
- Повторение ownership
- Решение задач

---

## Неделя 3: Обработка ошибок и коллекции

### День 15: Pattern Matching
- match выражения
- if let
- while let
- Паттерны в let

### День 16: Обработка ошибок
- panic! макрос
- Result<T, E>
- ? оператор
- unwrap и expect

### День 17: Векторы
- Создание Vec<T>
- push, pop
- Итерация
- Методы векторов

### День 18: Строки
- String vs &str
- Создание строк
- Конкатенация
- Итерация по символам

### День 19: HashMap
- Создание HashMap
- Вставка и доступ
- entry API
- Итерация

### День 20: Модули
- mod keyword
- pub для видимости
- use для импорта
- Организация кода

### День 21: Практика недели 3
- Мини-проект: Менеджер задач
- Повторение коллекций
- Решение задач

---

## Неделя 4: Generics и Traits

### День 22: Generics
- Generic функции
- Generic структуры
- Generic enums
- Generic методы

### День 23: Traits - основы
- Определение traits
- Реализация traits
- Default реализации
- Traits как параметры

### День 24: Traits - продвинуто
- Trait bounds
- where clause
- Возврат traits
- Blanket implementations

### День 25: Lifetime - основы
- Что такое lifetimes
- Аннотации lifetime
- Lifetime в функциях
- Lifetime elision

### День 26: Lifetime - продвинуто
- Lifetime в структурах
- Static lifetime
- Сложные случаи
- Common patterns

### День 27: Iterators
- Iterator trait
- Создание итераторов
- Adapters: map, filter
- Consumers: collect, sum

### День 28: Практика недели 4
- Мини-проект: Generic библиотека
- Повторение generics
- Решение задач

---

## Финальная неделя

### День 29: Concurrency
- Threads
- Message passing
- Shared state
- Send и Sync traits

### День 30: Финальный проект
- CLI приложение
- Структура проекта
- Error handling
- Следующие шаги
