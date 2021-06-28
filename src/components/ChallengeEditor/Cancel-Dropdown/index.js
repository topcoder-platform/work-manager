import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import Dropdown from 'rc-dropdown'
import styles from './Cancel-DropDown.module.scss'
import { CANCEL_REASONS } from '../../../config/constants'
import cn from 'classnames'
import 'rc-dropdown/assets/index.css'
import { PrimaryButton } from '../../Buttons'
import ConfirmationModal from '../../Modal/ConfirmationModal'
import _ from 'lodash'

const theme = {
  container: styles.modalContainer
}
const CancelDropDown = ({ challenge, onSelectMenu }) => {
  const [cancelReason, setCancelReason] = useState('')
  const [showModal, setShowModal] = useState(false)
  const popupContainerEl = useRef(null)

  const onSelect = v => {
    setCancelReason(v)
    setShowModal(true)
  }

  const menu = (
    <div className={cn(styles['menus'])}>
      {_.map(CANCEL_REASONS, r => {
        return (
          <div
            className={styles.menu}
            onClick={() => {
              onSelect(r)
            }}
          >
            {r}
          </div>
        )
      })}
    </div>
  )

  return (
    <>
      <Dropdown trigger={['click']} overlay={menu} animation='slide-up' getPopupContainer={() => {
        return popupContainerEl.current
      }}>
        <div ref={popupContainerEl} className={styles['pop-container']}>
          <PrimaryButton text={'Cancel'} type={'danger'} />
        </div>
      </Dropdown>
      {showModal && (
        <ConfirmationModal
          message={'Do you want to cancel the challenge ?'}
          theme={theme}
          cancelText='Cancel'
          confirmText='Continue'
          onCancel={() => {
            setShowModal(false)
          }}
          onConfirm={() => { onSelectMenu(challenge, cancelReason) }}
        />
      )}
    </>
  )
}

CancelDropDown.defaultProps = {}

CancelDropDown.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onSelectMenu: PropTypes.func.isRequired
}

export default CancelDropDown
