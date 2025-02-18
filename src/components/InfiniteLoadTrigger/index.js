import React, { useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'

const InfiniteScrollTrigger = ({ onLoadMore, rootMargin = '100px', threshold = 0.1 }) => {
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

  return <div ref={triggerRef} style={{ height: '1px', width: '100%' }} />
}

InfiniteScrollTrigger.propTypes = {
  onLoadMore: PropTypes.func.isRequired,
  rootMargin: PropTypes.string,
  threshold: PropTypes.number
}

export default InfiniteScrollTrigger
