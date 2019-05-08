import _ from 'lodash'
import React, { Component } from 'react'
import cn from 'classnames'
import TechAndPlatformField from '../TechAndPlatform-Field'
import FinalDeliverablesField from '../FinalDeliverables-Field'
import StockArtsField from '../StockArts-Field'
import SubmssionVisibility from '../SubmissionVisibility-Field'
import MaximumSubmissionsField from '../MaximumSubmissions-Field'
import styles from './TextEditor-Field.module.scss'
import PropTypes from 'prop-types'

const TABS = {
  CLASSIC_EDITOR: 'Classic Editor',
  MARKDOWN: 'Markdown',
  IMPORT: 'Import',
  FROM_TEMPLATES: 'From Templates'
}

class TextEditorField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentTab: TABS.CLASSIC_EDITOR
    }
    this.renderTabs = this.renderTabs.bind(this)
    this.switchTab = this.switchTab.bind(this)
    // this.renderEditorFields = this.renderEditorFields.bind(this)
  }

  switchTab (tab) {
    this.setState({ currentTab: tab })
  }

  renderTabs () {
    const { currentTab } = this.state
    return (
      <div className={styles.row}>
        {
          _.map(TABS, tab => (
            <div className={cn(styles.tab, { [styles.active]: currentTab === tab })} onClick={() => this.switchTab(tab)} key={tab}>
              <span>{tab}</span>
            </div>
          ))
        }
      </div>
    )
  }

  render () {
    const { keywords, challenge, onUpdateCheckbox, onUpdateInput, onUpdateMultiSelect } = this.props
    const { currentTab } = this.state
    return (
      <div className={styles.container}>
        { this.renderTabs() }
        <div className={styles.row}>
          <textarea className={styles.editor} id='requirements' name='requirements' placeholder='' value={challenge.requirements} maxLength='240' cols='3' rows='10' onChange={onUpdateInput} />
        </div>
        {
          currentTab === TABS.CLASSIC_EDITOR && (
            <TechAndPlatformField keywords={keywords} challenge={challenge} onUpdateMultiSelect={onUpdateMultiSelect} />
          )
        }
        {
          currentTab === TABS.MARKDOWN && (
            <React.Fragment>
              <FinalDeliverablesField challenge={challenge} onUpdateCheckbox={onUpdateCheckbox} />
              <StockArtsField challenge={challenge} onUpdateCheckbox={onUpdateCheckbox} />
              <SubmssionVisibility challenge={challenge} onUpdateCheckbox={onUpdateCheckbox} />
              <MaximumSubmissionsField challenge={challenge} onUpdateCheckbox={onUpdateCheckbox} onUpdateInput={onUpdateInput} />
            </React.Fragment>
          )
        }
      </div>
    )
  }
}

TextEditorField.propTypes = {
  keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
  challenge: PropTypes.shape().isRequired,
  onUpdateCheckbox: PropTypes.func.isRequired,
  onUpdateInput: PropTypes.func.isRequired,
  onUpdateMultiSelect: PropTypes.func.isRequired
}

export default TextEditorField
