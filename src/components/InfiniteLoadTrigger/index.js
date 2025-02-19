import React, { useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'

import styles from './InfiniteLoadTrigger.module.scss'
import { OutlineButton } from '../Buttons'

const InfiniteLoadTrigger = ({ onLoadMore, rootMargin = '100px', threshold = 0.1 }) => {
  const triggerRef = useRef(null)

  const observerCallback = useCallback(
    (entries) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        onLoadMore()
      }
    },
    [onLoadMore]
  )

  useEffect(() => {
    // eslint-disable-next-line no-undef
    const observer = new IntersectionObserver(observerCallback, {
      root: null, // Observe relative to viewport
      rootMargin,
      threshold
    })

    if (triggerRef.current) {
      observer.observe(triggerRef.current)
    }

    return () => {
      if (triggerRef.current) {
        observer.unobserve(triggerRef.current)
      }
    }
  }, [observerCallback, rootMargin, threshold])

  return (
    <div ref={triggerRef} className={styles.loader}>
      <OutlineButton type='info' text='Load More' onClick={() => onLoadMore()} />
    </div>
  )
}

InfiniteLoadTrigger.propTypes = {
  onLoadMore: PropTypes.func.isRequired,
  rootMargin: PropTypes.string,
  threshold: PropTypes.number
}

export default InfiniteLoadTrigger
