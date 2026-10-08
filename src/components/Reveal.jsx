import { useRef } from 'react'
import { useInView } from '../hooks/useInView'

/** Declarative scroll reveal — adds .is-revealed once the element enters. */
export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null)
  const inView = useInView(ref)
  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={`${className} ${inView ? 'is-revealed' : ''}`.trim()}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}
