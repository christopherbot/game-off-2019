export const executeAndDebounce = (func, delay) => {
  let currentTime = 0
  return (...args) => {
    if (Date.now() - currentTime > delay) {
      func(...args)
    }

    currentTime = Date.now()
  }
}
