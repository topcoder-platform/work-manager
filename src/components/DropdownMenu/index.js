/* Component to render dropdown menu */

import React from 'react'
import PropTypes from 'prop-types'
import Dropdown from 'rc-dropdown'
import styles from './styles.module.scss'
import cn from 'classnames'
import 'rc-dropdown/assets/index.css'
import _ from 'lodash'

const DropdownMenu = ({ onSelectMenu, children, options }) => {
  const menu = (
    <div className={cn(styles['menus'])}>
      {_.map(options, r => {
        return (
          <div
            className={styles.menu}
            key={r}
            onClick={() => {
              onSelectMenu(r)
            }}
          >
            {r}
          </div>
        )
      })}
    </div>
  )

  return (
    <Dropdown trigger={['click']} overlay={menu}>
      <button className={styles.btn} type='button'>
        {children}
      </button>
    </Dropdown>
  )
}

DropdownMenu.defaultProps = {
  onSelectMenu: () => {},
  options: []
}

DropdownMenu.propTypes = {
  onSelectMenu: PropTypes.func.isRequired,
  children: PropTypes.node,
  options: PropTypes.arrayOf(PropTypes.string)
}

export default DropdownMenu
