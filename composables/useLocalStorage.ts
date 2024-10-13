export function useLocalStorage() {
  const setItem = (key: string, value: string) => {
    if (process.client) {
      localStorage.setItem(key, value);
    }
  };

  const getItem = (key: string) => {
    if (process.client) {
      return localStorage.getItem(key);
    }
    return null;
  };

  const removeItem = (key: string) => {
    if (process.client) {
      localStorage.removeItem(key);
    }
  };

  return {
    setItem,
    getItem,
    removeItem,
  };
}
