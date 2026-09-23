/** Document chrome mode: signed-in shell vs signed-out scroll (html[data-app-chrome]). */

import { useLayoutEffect } from "react"

export const APP_CHROME_SHELL = "shell"
export const APP_CHROME_SCROLL = "scroll"

const ATTR = "data-app-chrome"

export function setAppDocumentChrome(mode) {
  if (typeof document === "undefined") return
  document.documentElement.setAttribute(ATTR, mode === APP_CHROME_SHELL ? APP_CHROME_SHELL : APP_CHROME_SCROLL)
}

export function useAppDocumentChrome(mode) {
  useLayoutEffect(() => {
    setAppDocumentChrome(mode)
    return () => setAppDocumentChrome(APP_CHROME_SCROLL)
  }, [mode])
}
