
const Storage = {
  save: (key: string, value: string): void => {
    localStorage.setItem(key, value)
  },
  get: (key: string): string | null => {
    return localStorage.getItem(key)
  },
  getOrEmpty: (key: string): string => {
    const res = localStorage.getItem(key)
    return res === null ? "" : res
  }
}

export const StorageKey = (key: string) => {
  return {
    save: (value: string): void => {
      Storage.save(key, value)
    },
    get: (): string | null => {
      return Storage.get(key)
    },
    getOrEmpty: (): string => {
      const res = Storage.getOrEmpty(key)
      return res === null ? "" : res
    }
  }
}

export default Storage