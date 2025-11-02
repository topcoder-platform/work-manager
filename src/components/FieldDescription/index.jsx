/*
 *  FieldDescription
 */

import React from 'react'
import PropTypes from 'prop-types'

import TuiEditor from '../TuiEditor'
import styles from './styles.module.scss'

const FieldDescription = props => (
  <TuiEditor
    {...props}
    toolbarItems={[
      'heading',
      'bold',
      'italic',
      'strike',
      'code',
      'divider',
      'quote',
      'codeblock',
      'hr',
      'divider',
      'ul',
      'ol',
      'divider',
      'image',
      'link'
    ]}
    plugins={[]}
    className={styles['description-editor']}
    previewStyle='vertical'
    height='400px'
    hideModeSwitch
    initialEditType='wysiwyg'
    initialValue={props.value}
  />
)

FieldDescription.propTypes = {
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string
}

export default FieldDescription
