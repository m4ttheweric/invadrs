/** FNV-1a string hash, finished with murmur3's fmix32 so every output bit
    depends on every input bit. Frozen: changing this changes every avatar,
    so it is a semver-major change. */
export function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/** The seed for an id. The NUL keeps ("ab", "c") and ("a", "bc") apart.
    Frozen with the hash. */
export function seedFor(id: string, salt?: string): number {
  return hashStr(salt ? `${salt}\u0000${id}` : id);
}
