/*
 *  TuiEditor
 *  wrap toast-ui editor with react and support react 15
 */

import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import Editor from '@toast-ui/editor'
import styles from './styles.scss'
import cn from 'classnames'
import 'codemirror/lib/codemirror.css'
import '@toast-ui/editor/dist/toastui-editor.css'

class TuiEditor extends React.Component {
  constructor (props) {
    super(props)
    this.handleValueChange = this.handleValueChange.bind(this)
    this.isInit = React.createRef()
    this.isInit.current = true
  }

  getRootElement () {
    return this.refs.rootEl
  }

  getInstance () {
    return this.editorInst
  }

  bindEventHandlers (props) {
    Object.keys(props)
      .filter(key => /^on[A-Z][a-zA-Z]+/.test(key))
      .forEach(key => {
        const eventName = key[2].toLowerCase() + key.slice(3)
        this.editorInst.off(eventName)
        this.editorInst.on(eventName, props[key])
      })

    // always add `https` to the links if link was added without `http` or `https`
    this.editorInst.on(
      'convertorAfterHtmlToMarkdownConverted',
      inputMarkdown => {
        const outputMarkdown = inputMarkdown.replace(
          /\[([^\]]*)\]\((?!https?)([^)]+)\)/g,
          '[$1](https://$2)'
        )
        return outputMarkdown
      }
    )
  }

  componentDidMount () {
    const props = {
      ...this.props,
      ..._.pickBy(
        {
          initialEditType: this.props.initialEditType,
          initialValue: this.props.initialValue,
          minHeight: this.props.minHeight,
          placeholder: this.props.placeholder,
          hideModeSwitch: this.props.hideModeSwitch,
          language: this.props.language,
          useCommandShortcut: this.props.useCommandShortcut,
          onLoad: this.props.onLoad,
          onStateChange: this.props.onStateChange,
          onFocus: this.props.onFocus,
          onBlur: this.props.onBlur,
          hooks: this.props.hooks,
          usageStatistics: this.props.usageStatistics,
          useDefaultHTMLSanitizer: this.props.useDefaultHTMLSanitizer,
          toolbarItems: this.props.toolbarItems,
          plugins: this.props.plugins,
          extendedAutolinks: this.props.extendedAutolinks,
          customConvertor: this.props.customConvertor,
          linkAttribute: this.props.linkAttribute,
          customHTMLRenderer: this.props.customHTMLRenderer,
          referenceDefinition: this.props.referenceDefinition,
          customHTMLSanitizer: this.props.customHTMLSanitizer,
          frontMatter: this.props.frontMatter
        },
        _.identity
      ),
      onChange: this.handleValueChange
    }
    const editorProps = {
      el: this.refs.rootEl,
      ...props
    }
    this.editorInst = new Editor(editorProps)
    this.bindEventHandlers(props)
    setTimeout(() => {
      this.isInit.current = false
    }, 10)
  }

  componentWillUnmount () {
    Object.keys(this.props)
      .filter(key => /^on[A-Z][a-zA-Z]+/.test(key))
      .forEach(key => {
        const eventName = key[2].toLowerCase() + key.slice(3)
        this.editorInst.off(eventName)
      })

    this.editorInst.off('convertorAfterHtmlToMarkdownConverted')
  }

  handleValueChange () {
    if (this.isInit.current) {
      return
    }
    if (this.props.onChange) {
      this.props.onChange(this.getInstance().getMarkdown())
    }
  }

  shouldComponentUpdate (nextProps) {
    const instance = this.getInstance()
    const { height, previewStyle, className } = nextProps

    if (this.props.height !== height) {
      instance.height(height)
    }

    if (this.props.previewStyle !== previewStyle) {
      instance.changePreviewStyle(previewStyle)
    }

    if (this.props.className !== className) {
      return true
    }

    // this looks like a bed idea to re-subscribe all the event on each re-render
    // also, note, that we had to disable this.editorInst.off(eventName);
    // otherwise popup for choosing Headings never closes
    // this.bindEventHandlers(nextProps, this.props);

    return false
  }

  render () {
    return (
      <div ref='rootEl' className={cn(styles.editor, this.props.className)} />
    )
  }
}

TuiEditor.defaultProps = {
  height: '300px',
  minHeight: '300px',
  initialValue: '',
  previewStyle: '',
  language: 'en-US',
  useCommandShortcut: true,
  customHTMLSanitizer: null,
  frontMatter: false,
  hideModeSwitch: false,
  referenceDefinition: false,
  usageStatistics: false,
  useDefaultHTMLSanitizer: true
}

TuiEditor.propTypes = {
  className: PropTypes.string,
  // Markdown editor's preview style (tab, vertical)
  previewStyle: PropTypes.string.isRequired,
  // Editor's height style value. Height is applied as border-box ex) '300px', '100%', 'auto'
  height: PropTypes.string,
  // Initial editor type (markdown, wysiwyg)
  initialEditType: PropTypes.string,
  // Editor's initial value
  initialValue: PropTypes.string,
  // Editor's min-height style value in pixel ex) '300px'
  minHeight: PropTypes.string,
  // The placeholder text of the editable element.
  placeholder: PropTypes.string,
  // hide mode switch tab bar
  hideModeSwitch: PropTypes.bool,
  // language, 'en-US'
  language: PropTypes.string,
  // whether use keyboard shortcuts to perform commands
  useCommandShortcut: PropTypes.bool,
  // It would be emitted when editor fully load1
  onLoad: PropTypes.func,
  // It would be emitted when content changed
  onChange: PropTypes.func,
  // It would be emitted when format change by cursor position
  onStateChange: PropTypes.func,
  // It would be emitted when editor get focus
  onFocus: PropTypes.func,
  // It would be emitted when editor loose focus
  onBlur: PropTypes.func,
  // hooks
  hooks: PropTypes.arrayOf(PropTypes.object),
  // send hostname to google analytics
  usageStatistics: PropTypes.bool,
  // use default htmlSanitizer
  useDefaultHTMLSanitizer: PropTypes.bool,
  // toolbar items.
  toolbarItems: PropTypes.arrayOf(
    PropTypes.oneOfType(PropTypes.object, PropTypes.string)
  ),
  // Array of plugins. A plugin can be either a function or an array in the form of [function, options].
  plugins: PropTypes.arrayOf(PropTypes.object),
  // Using extended Autolinks specified in GFM spec
  extendedAutolinks: PropTypes.object,
  // convertor extention
  customConvertor: PropTypes.object,
  // Attributes of anchor element that should be rel, target, contenteditable, hreflang, type
  linkAttribute: PropTypes.object,
  // Object containing custom renderer functions correspond to markdown node
  customHTMLRenderer: PropTypes.object,
  // whether use the specification of link reference definition
  referenceDefinition: PropTypes.bool,
  // custom HTML sanitizer
  customHTMLSanitizer: PropTypes.func,
  // whether use the front matter
  frontMatter: PropTypes.bool
}

export default TuiEditor
