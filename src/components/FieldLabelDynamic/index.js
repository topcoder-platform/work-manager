import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import cn from 'classnames'

const FieldLabelDynamic = ({
  title,
  isRequired,
  children,
  errorMsg,
  className,
  direction,
  info
}) => {
  return (
    <div
      className={cn(
        styles.row,
        {
          [styles.vertical]: direction === 'vertical',
          [styles.horizontal]: direction === 'horizontal'
        },
        className
      )}
    >
      <div className={cn(styles.field, styles.col1)}>
        <label>
          {title} {isRequired && <span>*</span>}
        </label>
      </div>
      <div className={styles.blockContent}>
        <div className={styles.blockValue}>
          {info && <div className={styles.blockInfo}>{info}</div>}
          <div className={cn(styles.field, styles.col2)}>{children}</div>
        </div>
        {errorMsg && <div className={cn(styles.error)}>{errorMsg}</div>}
      </div>
    </div>
  )
}

FieldLabelDynamic.defaultProps = {
  direction: 'horizontal'
}

FieldLabelDynamic.propTypes = {
  direction: PropTypes.oneOf(['horizontal', 'vertical']),
  title: PropTypes.string,
  errorMsg: PropTypes.string,
  className: PropTypes.string,
  info: PropTypes.string,
  isRequired: PropTypes.bool,
  children: PropTypes.node
}

export default FieldLabelDynamic
