import { useEffect, useState } from 'react'

/** Observe an element and report when it enters the viewport. */
export function useInView(ref, { rootMargin = '-10% 0px', once = true, threshold = 0 } = {}) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInView(entry.isIntersecting)
          if (entry.isIntersecting && once) io.disconnect()
        }
      },
      { rootMargin, threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, once, threshold])

  return inView
}
