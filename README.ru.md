# eslint-plugin-comment-policy

[English version](./README.md)

Правила ESLint 9 (flat-config), которые применяют **политику комментариев** в
редакторе и в CI: ограничивают прозу, не пускают историю изменений в
комментарии, запрещают код-сниппеты и декоративные маркеры, требуют блочные
комментарии. Политика видна по мере набора, а не только при отдельном прогоне.

Неймспейс: `comment-policy/`. Scope плагина (`meta.name`): `cyberash`.

## Правила

| Правило | Что ловит | Автофикс |
|---|---|---|
| `comment-policy/max-comment-lines` | блок комментария, где прозаических строк больше капа (для анкорных блоков кап ниже) | нет |
| `comment-policy/no-comment-narrative` | change-narrative / историю (`renamed from`, `previously`, `v1.2`, голые ISO-даты, …) | нет |
| `comment-policy/no-comment-code-snippet` | код-сниппет (пример использования) внутри комментария | да (только если блок целиком код) |
| `comment-policy/no-decorative-comment` | декоративные / секционные маркеры (`=====`, `#region`, `===text===`) | да |
| `comment-policy/no-line-comment` | любой `//`; требует `/* */` | да (конвертация и склейка подряд идущих `//`) |

**Блок комментария** — подряд идущие full-line `//`, разделённые только
пробелами (без пустой строки). **Прозаическая строка** — строка комментария, в
которой после снятия маркеров комментария и protected-маркеров остаётся реальное
слово (≥3 букв); поэтому чисто анкорные/маркерные строки в кап не идут.

## Установка

```sh
npm install --save-dev eslint-plugin-comment-policy
```

## Использование

`eslint.config.mjs` — готовый конфиг:

```js
import commentPolicy from "eslint-plugin-comment-policy";

export default [commentPolicy.configs.recommended];
```

`recommended` включает все пять правил на `error` с дефолтами. Есть также конфиг
`sdd` с дефолтными `protectedPatterns` для spec-driven проектов (анкоры
`partition:TYPE-NNN`, `@covers`, short-id, milestone):

```js
import commentPolicy from "eslint-plugin-comment-policy";

export default [commentPolicy.configs.sdd];
```

Либо подключить плагин и включить правила вручную:

```js
import commentPolicy from "eslint-plugin-comment-policy";

export default [
	{
		plugins: { "comment-policy": commentPolicy },
		rules: {
			"comment-policy/max-comment-lines": ["error", { max: 4, anchoredMax: 3 }],
			"comment-policy/no-comment-narrative": "error",
			"comment-policy/no-comment-code-snippet": "error",
			"comment-policy/no-decorative-comment": "error",
			"comment-policy/no-line-comment": "error",
		},
	},
];
```

## Опции

### `protectedPatterns`

Общая для `max-comment-lines`, `no-comment-narrative`,
`no-comment-code-snippet`, `no-decorative-comment` и `no-line-comment`. Массив
**строк-исходников** регулярных выражений. Блок, совпавший с любым паттерном,
считается «защищённым»: получает пониженный кап в `max-comment-lines` и
исключается из `no-comment-narrative` / `no-comment-code-snippet` /
`no-decorative-comment`.

Порядок важен: более длинный/специфичный паттерн ставьте раньше, чтобы маркер
снимался целиком до более короткого паттерна, который является его суффиксом.

### `max-comment-lines`

```js
["error", { max: 4, anchoredMax: 3, protectedPatterns: [] }]
```

- `max` (деф. `4`) — кап прозаических строк для обычного блока.
- `anchoredMax` (деф. `3`) — кап для защищённого (анкорного) блока.

### `no-comment-narrative`

```js
["error", { protectedPatterns: [], extraPatterns: [] }]
```

- `extraPatterns` — дополнительные narrative-паттерны (строки-исходники) к
  встроенному набору.

### `no-comment-code-snippet`, `no-decorative-comment`, `no-line-comment`

```js
["error", { protectedPatterns: [] }]
```

`no-comment-code-snippet` удаляет блок автофиксом только если он целиком код
(каждая непустая строка код-подобна) и занимает целые строки. `no-line-comment`
конвертирует подряд идущие `//` в один блок `/* */`; комментарий остаётся
нетронутым, если его проза содержит `*/` (это преждевременно закрыло бы блок).

## Замечания

- `no-decorative-comment` детектит маркеры по содержимому в обеих формах
  (`//` и `/* */`).
- ESLint применяет непересекающиеся фиксы за проход и перезапускает линт, поэтому
  блок, который одновременно код-сниппет и line-комментарий, разрешается за
  несколько проходов.

## Разработка

- `npm run build` — tsdown, dual ESM + CJS + `.d.ts` в `dist/` (в gitignore).
- `npm test` — наборы `RuleTester` через `tsx` (сборка не нужна).
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — self-lint `typescript-eslint` по исходникам.
