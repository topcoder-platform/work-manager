import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import Dropdown from 'rc-dropdown'
import styles from './Cancel-DropDown.module.scss'
import { CANCEL_REASONS } from '../../../config/constants'
import cn from 'classnames'
import 'rc-dropdown/assets/index.css'
import { PrimaryButton } from '../../Buttons'
import ConfirmationModal from '../../Modal/ConfirmationModal'
import { patchChallenge } from '../../../services/challenges'
import _ from 'lodash'

const theme = {
  container: styles.modalContainer
}
const CancelDropDown = ({ challenge, history }) => {
  const [cancelReason, setCancelReason] = useState('')
  const [showModal, setShowModal] = useState(false)

  const onSelect = v => {
    setCancelReason(v)
    setShowModal(true)
  }
  const onConfirm = async () => {
    await patchChallenge(challenge.id, {
      status: cancelReason
    })

    history.push(`/projects/${challenge.projectId}/challenges`)
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
      <Dropdown trigger={['click']} overlay={menu} animation='slide-up'>
        <PrimaryButton text={'Cancel'} type={'danger'} />
      </Dropdown>
      {showModal && (
        <ConfirmationModal
          // title='Reminder'
          message={'Do you want to cancel the challenge ?'}
          theme={theme}
          cancelText='Cancel'
          confirmText='Continue'
          onCancel={() => {
            setShowModal(false)
          }}
          onConfirm={onConfirm}
        />
      )}
    </>
  )
}

CancelDropDown.defaultProps = {}

CancelDropDown.propTypes = {
  challenge: PropTypes.shape().isRequired,
  history: PropTypes.shape()
}

export default withRouter(CancelDropDown)
