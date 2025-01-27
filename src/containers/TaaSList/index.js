import React from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import TaaSProjectCard from '../../components/TaaSProjectCard'
import Loader from '../../components/Loader'
import cn from 'classnames'
import { checkAdmin, checkCopilot } from '../../util/tc'
import { PrimaryButton } from '../../components/Buttons'

import styles from './styles.module.scss'

const TaaSList = ({ taasProjects, auth, isLoading }) => {
  const isCopilot = checkCopilot(auth.token)
  const isAdmin = checkAdmin(auth.token)
  const canEdit = isCopilot || isAdmin

  if (isLoading && taasProjects.length === 0) {
    return (
      <div className={styles.container}>
        <Loader />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchHeader}>
        <div>No project selected. Select one below</div>
        {(isCopilot || isAdmin) && (
          <Link className={styles.buttonCreateNewTaaS} to='/taas/new'>
            <PrimaryButton
              text='Create TaaS Project'
              type='info'
              submit
            />
          </Link>
        )}
      </div>
      {taasProjects.length > 0 ? (
        <ul>
          {taasProjects.map(p => (
            <li key={p.id} className={cn({ [styles.canEdit]: canEdit })}>
              <TaaSProjectCard
                projectName={p.name}
                projectId={p.id}
                canEdit={canEdit}
              />
            </li>
          ))}
        </ul>
      ) : (
        <span>No TaaS projects available yet</span>
      )}
    </div>
  )
}

TaaSList.propTypes = {
  taasProjects: PropTypes.array,
  auth: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired
}

const mapStateToProps = ({ sidebar, auth }) => {
  return {
    taasProjects: sidebar.taasProjects,
    isLoading: sidebar.isLoading,
    auth
  }
}

const mapDispatchToProps = {}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TaaSList)
)
