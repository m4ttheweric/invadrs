# invadrs 1.0: fewer duplicate avatars

## Problem

Production users with stable ids keep landing on the same creature and color.
The library spreads stable ids evenly, but `invadr` only has 16 creatures x 6
colors = 96 pairs, so a group of a dozen users is more likely than not to show
a duplicate. Separately, the FNV-1a hash's low 4 bits depend only on the low 4
bits of each character, so ids that differ only by characters sharing a low
nibble (`matt` / `Matt` / `MATT`, `user_1` / `user_a`) always share a creature.

## Goals

- A known group of up to 96 ids (the largest group the app shows at once) gets
  guaranteed-distinct creature + color pairs.
- The hash's low bits depend on every input bit.
- Apps can shift every avatar with a salt.
- Optional extra variety (accent color, background tint) for apps that want it.

## Non-goals

- Global uniqueness across all users. `spawn()` already covers that need.
- A legacy-hash mode. Apps that need old avatars pin `0.3.x`.
- Assigning accent or tint in `distinctAvatars`.
- A React group component or hook.

## Design

### 1. Seed, hash and salt

- `hashStr` keeps FNV-1a and passes the result through murmur3's `fmix32`
  finalizer:
  ```ts
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16; return h >>> 0;
  ```
- This changes every `invadr` and `spawn` output. That is the major break.
- New option `salt?: string` on `invadr`, `spawn`, their React components and
  `distinctAvatars`. The seed is `hashStr(id)` when `salt` is undefined or empty and
  `hashStr(salt + "\u0000" + id)` otherwise. The NUL separator keeps
  `("ab", "c")` and `("a", "bc")` apart. A shared `seedFor(id, salt?)` helper
  owns this rule.
- Each attribute reads its own bit range of the seed:

  | Attribute | Rule |
  |---|---|
  | creature | `seed % 16` |
  | color | `(seed >>> 4) % n` |
  | accent | `(seed >>> 12) % (n - 1)`, mapped over the colors other than the body color |
  | tint | `(seed >>> 20) % n` |

  `n` is the resolved palette's color count.

### 2. `color` option and `distinctAvatars`

- New option `color?: number` on `invadr` and `spawn` (and the React
  components). It is a palette index, wrapped with
  `((Math.trunc(c) % n) + n) % n` exactly like `sprite`, and overrides the
  hash-picked color. Works with every palette including `css-vars`.
- `distinctAvatars(ids, { palette?, salt? }): Map<string, { sprite: number; color: number }>`.
  Capacity is `16 * n` pairs (96 for the default palette).
- Assignment walks `ids` in order, keeping a set of taken pairs:
  1. A repeated id keeps its first assignment.
  2. Natural pair (from `seedFor(id, salt)`) free: take it.
  3. Else keep the natural creature and take the first free color for it.
  4. Else keep the natural color and take the first free creature for it.
  5. Else take the first free pair (creature-major order).
  6. All pairs taken: use the natural pair.
- Appending ids never changes earlier assignments.
- Usage: `invadr(id, { palette, salt, ...avatars.get(id) })`.
- `distinctSprites` is removed. `spriteIndex` stays internal to the module.

### 3. Variety options (off by default)

- `accent?: boolean`: enclosed holes (empty cells not reachable from the grid
  edge by a 4-way flood fill) are drawn as extra `<rect>`s in the accent color.
  The accent never equals the body color. When a palette has only one color,
  `accent` draws nothing.
- `tint?: boolean`: a full-bleed background `<rect>` in the tint color with
  `fill-opacity="0.18"`. An explicit `background` (option or palette) wins
  over `tint`. Works with `css-vars` because opacity is an attribute, not part
  of the color string.
- `ResolvedSprite` gains `accent?: { color: string; cells: [x, y][] }` and
  `tint?: string`. `renderSvg` and the React `svgFrom` render both the same way.

### 4. Release and migration

- Version `1.0.0`.
- README: rewrite the stability contract (frozen: FNV-1a + fmix32, salt format,
  bit ranges, sprite set and order, spawn generator, css-vars order); document
  `distinctAvatars`, `color`, `salt`, `accent`, `tint`; add "Upgrading from
  0.x" (every avatar changes; `distinctSprites` -> `distinctAvatars(...).get(id).sprite`).
- Regenerate snapshots after reviewing the diff; regenerate
  `assets/preview.png`; update Storybook stories and add a 96-avatar group
  story and an accent/tint story.

## Testing

- Hash: `matt`, `Matt`, `MATT` no longer share a creature; known-value tests
  for `hashStr` and `seedFor` with and without salt.
- `distinctAvatars`: 96 ids -> 96 distinct pairs; append-stability; repeated
  ids; salt changes natural pairs; 12-color palette gives 192; past capacity
  falls back to natural pairs.
- `color`: wraps negatives and out-of-range values; overrides hash color.
- `accent`: hole detection on two known creatures; accent never equals body
  color across many seeds; one-color palette draws no accent.
- `tint`: rendered with opacity; explicit `background` wins.
- React output matches the SVG string output for every new option.
- UI: the new Storybook stories rendered in Fast Browser and screenshotted in
  light and dark schemes.
