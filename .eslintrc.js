export default {
  env: {
    browser: true, // Определяет, что код будет выполняться в браузере
    es2021: true, // Использует ES2021
  },
  extends: [
    'eslint:recommended', // Рекомендуемые правила ESLint
    'plugin:vue/vue3-recommended', // Рекомендуемые правила для Vue
    'plugin:prettier/recommended', // Интеграция с Prettier
  ],
  parserOptions: {
    ecmaVersion: 12, // Использует ES2021
    sourceType: 'module', // Использует модули
  },
  rules: {
    'no-console': 'warn', // Предупреждение при использовании console.log
    'no-unused-vars': 'warn', // Предупреждение о неиспользуемых переменных
    eqeqeq: 'error', // Используйте строгое равенство (===)
    curly: 'error', // Обязательно использовать фигурные скобки для всех блоков
    semi: ['error', 'always'], // Обязательно использовать точки с запятой
    quotes: ['error', 'single'], // Используйте одинарные кавычки
    indent: ['error', 2], // Используйте 2 пробела для отступов
    'max-len': ['warn', { code: 80 }], // Максимальная длина строки 80 символов
    'no-multiple-empty-lines': ['error', { max: 1 }], // Максимум 1 пустая строка
    'prefer-const': 'error', // Используйте const, если переменная не переопределяется
  },
};
