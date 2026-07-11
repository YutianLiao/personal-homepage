import { ref, readonly } from "vue";

const AUTH_KEY = "sudoku-auth";
const AUTH_TOKEN = "ok-v1";

/** SHA-256 of "Hello Sudoku" (UTF-8), hex lowercase — never store plaintext password */
const PASSWORD_HASH =
  "319d5c71a54f1731d03b848c49796023764b53b32b260162eb48c69de2e23984";

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readSession(): boolean {
  try {
    return sessionStorage.getItem(AUTH_KEY) === AUTH_TOKEN;
  } catch {
    return false;
  }
}

const authenticated = ref(typeof window !== "undefined" ? readSession() : false);

export function useSudokuAuth() {
  async function login(password: string): Promise<boolean> {
    const hash = await sha256Hex(password);
    if (hash !== PASSWORD_HASH) {
      return false;
    }
    try {
      sessionStorage.setItem(AUTH_KEY, AUTH_TOKEN);
    } catch {
      /* ignore */
    }
    authenticated.value = true;
    return true;
  }

  function logout() {
    try {
      sessionStorage.removeItem(AUTH_KEY);
    } catch {
      /* ignore */
    }
    authenticated.value = false;
  }

  function refresh() {
    authenticated.value = readSession();
  }

  return {
    authenticated: readonly(authenticated),
    login,
    logout,
    refresh,
  };
}
