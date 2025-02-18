/* Component to render tab ui */

import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import cn from 'classnames'

const TabCommon = ({ items, classsName, selectedIndex, onSelect }) => {
  return (
    <div className={cn(styles.container, classsName)}>
      {items.map((item, index) => (
        <button
          className={cn(styles.blockTab, {
            [styles.selected]: selectedIndex === index
          })}
          type='button'
          key={item.label}
          onClick={() => onSelect(index)}
        >
          <span className={styles.textLabel}>{item.label}</span>

          {item.count !== undefined && (
            <div className={styles.textCount}>{item.count}</div>
          )}
        </button>
      ))}
    </div>
  )
}

TabCommon.defaultProps = {
  items: [],
  classsName: '',
  onSelect: () => {}
}

TabCommon.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      count: PropTypes.number
    })
  ),
  classsName: PropTypes.string,
  selectedIndex: PropTypes.number,
  onSelect: PropTypes.func
}

export default TabCommon
