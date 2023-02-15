import React, { Component } from 'react'
import styles from './Description-Field.module.scss'
import PropTypes from 'prop-types'
import EasyMDE from 'easymde'
import marked from 'marked'
import cn from 'classnames'
import _ from 'lodash'
import $ from 'jquery'
import {
  MULTI_ROUND_CHALLENGE_DESC_TEMPLATE,
  MULTI_ROUND_CHALLENGE_TEMPLATE_ID,
  FILE_PICKER_API_KEY
} from '../../../config/constants'
import { client } from 'filestack-react'
import { normalizeText } from 'normalize-text'
import '../../../../node_modules/easymde/dist/easymde.min.css'

const clientObject = client.init(FILE_PICKER_API_KEY)

const maxUploadSize = 40 * 1024 * 1024
const maxCommentLength = 16000
const imageExtensions = ['gif', 'png', 'jpeg', 'jpg', 'bmp', 'svg']
const allowedImageExtensions = [...imageExtensions, ...imageExtensions.map(key => `image/${key}`)]
const allowedOtherExtensions = []
const errorMessages = {
  noFileGiven: 'Select a file.',
  typeNotAllowed:
    'Uploading #image_name# was failed. The file type (#image_type#) is not supported.',
  fileTooLarge:
    'Uploading #image_name# was failed. The file is too big (#image_size#).\n' +
    'Maximum file size is #image_max_size#.',
  importError:
    'Uploading #image_name# was failed. Something went wrong when uploading the file.'
}

class DescriptionField extends Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.element = React.createRef()
    this.isChanged = false
    this.currentValue = ''
    this.blurTheField = this.blurTheField.bind(this)
    this.updateDescriptionThrottled = _.throttle(
      this.updateDescription.bind(this),
      10000
    ) // 10s
    this.onChange = this.onChange.bind(this)
    this.getInitValue = this.getInitValue.bind(this)
    this.customUploadImage = this.customUploadImage.bind(this)
  }

  blurTheField (value) {
    const { onUpdateDescription, type } = this.props
    onUpdateDescription(value, type)
  }

  updateDescription () {
    const { onUpdateDescription, type } = this.props
    onUpdateDescription(this.currentValue, type)
  }

  onChange (value) {
    const { type } = this.props
    this.isChanged = true
    this.currentValue = value
    this.updateDescriptionThrottled(value, type)
  }

  getInitValue () {
    const { challenge, type, readOnly } = this.props
    if (!readOnly) {
      let initialValue = challenge[type]
      const updateInitialValue =
        challenge.timelineTemplateId === MULTI_ROUND_CHALLENGE_TEMPLATE_ID &&
        (!initialValue || initialValue.length === 0)
      if (updateInitialValue) {
        initialValue = MULTI_ROUND_CHALLENGE_DESC_TEMPLATE
      }
      return initialValue
    }
    return ''
  }

  looksLikeTable (rows) {
    if (rows && rows.length < 2) {
      return false
    }
    var countOfColumns = rows[0].length
    if (countOfColumns < 2) {
      return false
    }
    // Each row has the same count of columns
    for (var i = 1; i < rows.length; i++) {
      if (countOfColumns !== rows[i].length) {
        return false
      }
    }
    return true
  }

  columnWidth (rows, columnIndex) {
    return Math.max.apply(null, rows.map((row) => {
      return ('' + row[columnIndex]).length
    }))
  }

  componentDidMount () {
    const { challenge, type, readOnly } = this.props

    if (!readOnly) {
      let initialValue = this.getInitValue()
      const updateInitialValue =
        challenge.timelineTemplateId === MULTI_ROUND_CHALLENGE_TEMPLATE_ID &&
        (!initialValue || initialValue.length === 0)
      if (updateInitialValue) {
        initialValue = MULTI_ROUND_CHALLENGE_DESC_TEMPLATE
      }
      this.currentValue = initialValue

      if (updateInitialValue) {
        this.onChange(initialValue)
      }
      const self = this
      this.easyMDE = new EasyMDE({
        shortcuts: {
          mentions: 'Ctrl-Space'
        },
        initialValue: initialValue,
        element: this.element.current,
        autofocus: false,
        forceSync: true, // true, force text changes made in EasyMDE to be immediately stored in original text area.
        placeholder: '',
        toolbar: [
          {
            name: 'bold',
            action: editor => {
              this._toggleBlock(editor, 'bold', editor.options.blockStyles.bold)
            },
            className: 'fa fa-bold',
            title: 'Bold'
          },
          {
            name: 'italic',
            action: editor => {
              this._toggleBlock(
                editor,
                'italic',
                editor.options.blockStyles.italic
              )
            },
            className: 'fa fa-italic',
            title: 'Italic'
          },
          'strikethrough',
          '|',
          'heading-1',
          'heading-2',
          'heading-3',
          '|',
          'code',
          'quote',
          '|',
          'unordered-list',
          'ordered-list',
          'clean-block',
          '|',
          'link',
          {
            name: 'upload-image',
            className: 'fa fa-upload',
            title: 'Upload a file',
            action: (editor) => {
              editor.drawUploadedImage()
            }
          },
          'image',
          'table',
          'horizontal-rule',
          '|',
          'fullscreen',
          '|',
          'guide'
        ],
        hideIcons: ['guide', 'heading', 'preview', 'side-by-side'],
        insertTexts: {
          link: ['[', '](#url#)'],
          image: ['![](', '#url#)'],
          file: ['[](', '#url#)'],
          uploadingImage: ['![Uploading #name#]()', ''],
          uploadingFile: ['[Uploading #name#]()', ''],
          uploadedImage: ['![#name#](#url#)', ''],
          uploadedFile: ['[#name#](#url#)', ''],
          horizontalRule: ['', '\n\n-----\n\n'],
          table: [
            '',
            '\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n'
          ]
        },
        imageTexts: {
          sbInit:
            'Attach files by dragging & dropping, selecting or pasting them.',
          sbOnDragEnter: 'Drop file to upload it.',
          sbOnDrop: 'Uploading file #images_names#...',
          sbProgress: 'Uploading #file_name#: #progress#%',
          sbOnUploaded: 'Uploaded #image_name#',
          sizeUnits: ' B, KB, MB'
        },
        uploadImage: true,
        imageMaxSize: maxUploadSize, // Maximum image size in bytes
        imageAccept: [...allowedImageExtensions, ...allowedOtherExtensions].join(', '), // A comma-separated list of mime-types and extensions
        imageUploadFunction: (file) => {
          setTimeout(() => {
            this.customUploadImage(file)
          })
        },
        beforeUploadingImagesFunction: this.beforeUploadingImages,
        errorCallback: this.errorCallback, // A callback function used to define how to display an error message.
        errorMessages,
        status: [
          {
            className: 'message',
            defaultValue: (el) => {
              el.innerHTML = ''
            },
            onUpdate: (el) => {}
          },
          'upload-image',
          {
            className: 'countOfRemainingChars',
            defaultValue: (el) => {
              var countOfRemainingChars = maxCommentLength
              var text = self.easyMDE ? self.easyMDE.codemirror.getValue() : initialValue
              if (text != null && text.length > 0) {
                text = normalizeText(text)
                text = `${text}`
                countOfRemainingChars = maxCommentLength - text.length
                if (countOfRemainingChars < 0) {
                  countOfRemainingChars = 0
                }
              }
              el.innerHTML = countOfRemainingChars + ' character remaining'
            },
            onUpdate: (el) => {
              var countOfRemainingChars = maxCommentLength
              var text = self.easyMDE ? self.easyMDE.codemirror.getValue() : initialValue
              if (text != null && text.length > 0) {
                text = normalizeText(text)
                text = `${text}`
                countOfRemainingChars = maxCommentLength - text.length
                if (countOfRemainingChars < 0) {
                  countOfRemainingChars = 0
                }
              }
              el.innerHTML = countOfRemainingChars + ' character remaining'
            }
          }
        ]
      })

      this.easyMDE.codemirror.on('change', (cm, event) => {
        this.onChange(cm.getValue())

        var frm = $(cm.getInputField()).closest('form').first()
        var messageContainer = $(frm).find('.editor-statusbar .message')

        var text = cm.getValue()
        text = normalizeText(text)
        if (text.length > 0 && text.length <= maxCommentLength) {
          $(messageContainer).text('')
        } else if (text.length > maxCommentLength) {
          var count = text.length - maxCommentLength
          $(messageContainer).text('Text is ' + count + ' characters too long')

          $(frm).find(':submit').attr('disabled', 'disabled')
          $(frm).find('.Buttons a.Button:not(.Cancel)').addClass('Disabled')
        }

        // Key events don't work properly on Android Chrome
        if (!cm.state.completionActive /* Enables keyboard navigation in autocomplete list */) {
          if (event.origin === '+input' && event.text && event.text.length > 0 && event.text[0] === '@') {
            cm.showHint({ completeSingle: false, alignWithWord: true })
          }
        }
      })

      this.easyMDE.codemirror.on('blur', (cm, event) => {
        if (this.isChanged) {
          this.isChanged = false
          this.blurTheField(cm.getValue())
        }
      })

      this.easyMDE.codemirror.on('paste', function (cm, event) {
        var clipboard = event.clipboardData
        // trim the trailing newline character, if present.
        var data = clipboard.getData('text/plain')
        data = data.replace(/(?:[\n\u0085\u2028\u2029]|\r\n?)$/, '')
        var rows = data.split((/[\n\u0085\u2028\u2029]|\r\n?/g)).map((row) => {
          return row.split('\t')
        })

        var isTableData = self.looksLikeTable(rows)
        if (isTableData) {
          event.preventDefault()
        } else {
          return
        }

        var colAlignments = []

        var columnWidths = rows[0].map((column, columnIndex) => {
          var alignment = 'l'
          var re = /^(\^[lcr])/i
          var m = column.match(re)
          if (m) {
            var align = m[1][1].toLowerCase()
            if (align === 'c') {
              alignment = 'c'
            } else if (align === 'r') {
              alignment = 'r'
            }
          }
          colAlignments.push(alignment)
          column = column.replace(re, '')
          rows[0][columnIndex] = column
          return this.columnWidth(rows, columnIndex)
        })
        var markdownRows = rows.map((row, rowIndex) => {
          // | col1   | col2 | col3  |
          // |--------|------|-------|
          // | val1   | val2 | val3  |
          return '| ' + row.map((column, index) => {
            return column + Array(columnWidths[index] - column.length + 1).join(' ')
          }).join(' | ') + ' |'
        })
        markdownRows.splice(1, 0, '|' + columnWidths.map((width, index) => {
          var prefix = ''
          var postfix = ''
          var adjust = 0
          var alignment = colAlignments[index]
          if (alignment === 'r') {
            postfix = ':'
            adjust = 1
          } else if (alignment === 'c') {
            prefix = ':'
            postfix = ':'
            adjust = 2
          }
          return prefix + Array(columnWidths[index] + 3 - adjust).join('-') + postfix
        }).join('|') + '|')

        var result = '\n' + markdownRows.join('\n')
        var currentCursorPosition = cm.getCursor()
        cm.replaceSelection(result, { line: currentCursorPosition.line + 2, ch: result.length })
        return false
      })
    } else {
      if (challenge.legacy.selfService) {
        const regex = new RegExp('{{[a-zA-Z0-9.]+}}', 'g')
        const newDescription = challenge[type]
          ? challenge[type].replace(
            regex,
            '<span style="color:red">MISSING DATA FROM INTAKE FORM</span>'
          )
          : ''
        this.ref.current.innerHTML = marked(newDescription)
      } else {
        this.ref.current.innerHTML = challenge[type]
          ? marked(challenge[type])
          : ''
      }
    }
  }

  /**
   * Convert the first char to Uppercase
   * @param str
   * @returns {*|string}
   */
  ucfirst (str) {
    return str && str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * Calculate file size in units
   * @param bytes
   * @param units
   * @returns {string}
   */
  humanFileSize (bytes, units) {
    if (Math.abs(bytes) < 1024) {
      return '' + bytes + units[0]
    }
    var u = 0
    do {
      bytes /= 1024
      ++u
    } while (Math.abs(bytes) >= 1024 && u < units.length)
    return '' + bytes.toFixed(1) + units[u]
  }

  /**
   * The state of CodeMirror at the given position.
   */
  getState (cm, pos) {
    pos = pos || cm.getCursor('start')
    var stat = cm.getTokenAt(pos)
    if (!stat.type) return {}

    var types = stat.type.split(' ')

    var ret = {}

    var data; var text
    for (var i = 0; i < types.length; i++) {
      data = types[i]
      if (data === 'strong') {
        ret.bold = true
      } else if (data === 'variable-2') {
        text = cm.getLine(pos.line)
        if (/^\s*\d+\.\s/.test(text)) {
          ret['ordered-list'] = true
        } else {
          ret['unordered-list'] = true
        }
      } else if (data === 'atom') {
        ret.quote = true
      } else if (data === 'em') {
        ret.italic = true
      } else if (data === 'quote') {
        ret.quote = true
      } else if (data === 'strikethrough') {
        ret.strikethrough = true
      } else if (data === 'comment') {
        ret.code = true
      } else if (data === 'link') {
        ret.link = true
      } else if (data === 'tag') {
        ret.image = true
      } else if (data.match(/^header(-[1-6])?$/)) {
        ret[data.replace('header', 'heading')] = true
      }
    }
    return ret
  }

  _replaceSelection (cm, active, startEnd, data, onPosition) {
    if (/editor-preview-active/.test(cm.getWrapperElement().lastChild.className)) {
      return
    }

    var text
    var start = startEnd[0]
    var end = startEnd[1]
    var startPoint = {}
    var endPoint = {}
    var currentPosition = cm.getCursor()

    // Start uploading from a new line
    if (currentPosition.ch !== 0) {
      cm.replaceSelection('\n')
    }

    Object.assign(startPoint, cm.getCursor('start'))
    Object.assign(endPoint, cm.getCursor('end'))
    if (data && data.name) {
      start = start.replace('#name#', data.name)
      end = end.replace('#name#', data.name)
    }

    var initStartPosition = {
      line: startPoint.line,
      ch: startPoint.ch
    }

    if (active) {
      text = cm.getLine(startPoint.line)
      start = text.slice(0, startPoint.ch)
      end = text.slice(startPoint.ch)
      cm.replaceRange(start + end, {
        line: startPoint.line,
        ch: 0
      })
    } else {
      text = cm.getSelection()
      cm.replaceSelection(start + text + end)
      startPoint.ch += start.length
      if (startPoint !== endPoint) {
        endPoint.ch += start.length
      }
    }
    onPosition(initStartPosition, endPoint)

    var line = cm.getLine(cm.getCursor().line)
    var appendedTextLength = start.length + text.length + end.length
    if (line.length > appendedTextLength) {
      cm.replaceSelection('\n')
      cm.setSelection({ line: startPoint.line + 1, ch: line.length - appendedTextLength },
        { line: startPoint.line + 1, ch: line.length - appendedTextLength })
    } else {
      // Set a cursor at the end of line
      cm.setSelection(startPoint, endPoint)
    }
    cm.focus()
  }

  /**
   *
   * @param editor
   * @param file
   * @param onPosition
   */
  beforeUploadingFile (editor, file, onPosition) {
    var cm = editor.codemirror
    var stat = this.getState(cm)
    var options = editor.options
    var fileName = file.name
    var ext = fileName.substring(fileName.lastIndexOf('.') + 1)
    // Check if file type is an image
    if (allowedImageExtensions.includes(ext)) {
      this._replaceSelection(cm, stat.image, options.insertTexts.uploadingImage, { name: fileName }, onPosition)
    } else {
      this._replaceSelection(cm, stat.link, options.insertTexts.uploadingFile, { name: fileName }, onPosition)
    }
  }

  resetFileInput (editor) {
    var imageInput = editor.gui.toolbar.getElementsByClassName('imageInput')[0]
    imageInput.value = ''
  }

  _updateFileTag (cm, position, startEnd, data) {
    if (/editor-preview-active/.test(cm.getWrapperElement().lastChild.className)) {
      return
    }

    var start = startEnd[0]
    var end = startEnd[1]
    var startPoint = {}
    var endPoint = {}
    if (data && (data.url || data.name)) {
      start = start.replace('#name#', data.name) // url is in start for upload-image
      start = start.replace('#url#', data.url) // url is in start for upload-image
      end = end.replace('#name#', data.name)
      end = end.replace('#url#', data.url)
    }
    Object.assign(startPoint, {
      line: position.start.line,
      ch: position.start.ch
    })
    Object.assign(endPoint, { line: position.end.line,
      ch: position.end.ch })
    cm.replaceRange(start + end, startPoint, endPoint)

    var selectionPosition = {
      line: position.start.line,
      ch: start.length + end.length
    }
    cm.setSelection(selectionPosition, selectionPosition)
    cm.focus()
  }

  afterFileUploaded (editor, jsonData, position) {
    var cm = editor.codemirror
    var options = editor.options
    var imageName = jsonData.name
    var ext = imageName.substring(imageName.lastIndexOf('.') + 1)

    // Check if file type is an image
    if (allowedImageExtensions.includes(ext)) {
      this._updateFileTag(cm, position, options.insertTexts.uploadedImage, jsonData)
    } else {
      this._updateFileTag(cm, position, options.insertTexts.uploadedFile, jsonData)
    }

    // show uploaded image filename for 1000ms
    editor.updateStatusBar('upload-image', editor.options.imageTexts.sbOnUploaded.replace('#image_name#', imageName))
    setTimeout(function () {
      editor.updateStatusBar('upload-image', editor.options.imageTexts.sbInit)
    }, 1000)
  }

  customUploadImage (file) {
    var position = {}

    const onSuccess = (jsonData) => {
      this.afterFileUploaded(this.easyMDE, jsonData, position)
      this.resetFileInput(this.easyMDE)
    }

    const onError = (errorMessage) => {
      if (position && position.start && position.end) {
        this.easyMDE.codemirror.replaceRange('', position.start, position.end)
      }
      this.resetFileInput(this.easyMDE)
    }

    const onErrorSup = (errorMessage) => {
      // show reset status bar
      this.easyMDE.updateStatusBar('upload-image', this.easyMDE.options.imageTexts.sbInit)
      // run custom error handler
      if (onError && typeof onError === 'function') {
        onError(errorMessage)
      }
      // run error handler from options
      this.easyMDE.options.errorCallback(errorMessage)
    }

    // Parse a server response
    const parseServerErrors = (response) => {
      var errorMessages = '<div class="Messages Errors"><ul>'
      if (response.errors) {
        for (var error of response.errors) {
          errorMessages += '<li>Couldn\'t upload ' + file.name + '. ' + this.ucfirst(error.message) + '</li>'
        }
      } else {
        errorMessages += '<li>Couldn\'t upload ' + file.name + '. ' + this.ucfirst(response.message) + '</li>'
      }
      errorMessages += '</ul></div>'
      return errorMessages
    }

    // Parse a message
    const fillErrorMessage = (errorMessage) => {
      var units = this.easyMDE.options.imageTexts.sizeUnits.split(',')

      var error = errorMessage
        .replace('#image_type#', getFileType())
        .replace('#image_name#', file.name)
        .replace('#image_size#', this.humanFileSize(file.size, units))
        .replace('#image_max_size#', this.humanFileSize(this.easyMDE.options.imageMaxSize, units))

      return '<div class="Messages Errors"><ul><li>' + error + '</li></ul></div>'
    }

    // Save a position of image/file tag
    const onPosition = (start, end) => {
      position.start = start
      position.end = end
    }

    const getFileType = () => {
      // Sometimes a browser couldn't define mime/types, use file extension
      return file.type ? file.type : file.name.substring(file.name.lastIndexOf('.') + 1)
    }

    // Check mime types
    if (!this.easyMDE.options.imageAccept.includes(getFileType())) {
      onErrorSup(fillErrorMessage(this.easyMDE.options.errorMessages.typeNotAllowed))
      return
    }

    // Check max file size before uploading
    if (file.size > this.easyMDE.options.imageMaxSize) {
      onErrorSup(fillErrorMessage(this.easyMDE.options.errorMessages.fileTooLarge))
      return
    }

    this.beforeUploadingFile(this.easyMDE, file, onPosition)

    const onprogress = (progress) => {
      this.easyMDE.updateStatusBar('upload-image', this.easyMDE.options.imageTexts.sbProgress.replace('#file_name#', file.name).replace('#progress#', progress))
    }
    const onload = (response) => {
      if (response && !response.error && !!response.url > 0 && response.size > 0) {
        onSuccess(response)
      } else {
        if (response.errors || response.message) { // server side generated error message
          onErrorSup(parseServerErrors(response))
        } else {
          // unknown error
          console.error('EasyMDE: Received an unexpected response after uploading the image.' +
            this.status + ' (' + this.statusText + ')')
          onErrorSup(fillErrorMessage(this.easyMDE.options.errorMessages.importError))
        }
      }
    }

    const onerror = (event) => {
      onErrorSup(this.options.errorMessages.importError)
    }
    clientObject.upload(file, {
      onProgress: (event) => {
        onprogress(`${event.totalPercent}`)
      }
    }).then(res => {
      onload(res)
    }).catch(err => {
      console.log(err)
      onerror()
    })
  }

  beforeUploadingImages (files) {
    const self = this
    const $element = self.element.current
    const postForm = $element.closest('form')
    // Remove any old errors from the form
    $(postForm).find('div.Errors').remove()
  }

  errorCallback (message) {
    // gdn.informMessage (message);
  }

  _toggleBlock (editor, type, startChars, endChars) {
    if (/editor-preview-active/.test(editor.codemirror.getWrapperElement().lastChild.className)) {
      return
    }

    endChars = (typeof endChars === 'undefined') ? startChars : endChars
    var cm = editor.codemirror
    var stat = this.getState(cm)

    var text
    var start = startChars
    var end = endChars

    var startPoint = cm.getCursor('start')
    var endPoint = cm.getCursor('end')

    if (stat[type]) {
      text = cm.getLine(startPoint.line)
      start = text.slice(0, startPoint.ch)
      end = text.slice(startPoint.ch)
      if (type === 'bold') {
        start = start.replace(/(\*\*|__)(?![\s\S]*(\*\*|__))/, '')
        end = end.replace(/(\*\*|__)/, '')
      } else if (type === 'italic') {
        start = start.replace(/(\*|_)(?![\s\S]*(\*|_))/, '')
        end = end.replace(/(\*|_)/, '')
      } else if (type === 'strikethrough') {
        start = start.replace(/(\*\*|~~)(?![\s\S]*(\*\*|~~))/, '')
        end = end.replace(/(\*\*|~~)/, '')
      }
      cm.replaceRange(start + end, {
        line: startPoint.line,
        ch: 0
      }, {
        line: startPoint.line,
        ch: 99999999999999
      })

      if (type === 'bold' || type === 'strikethrough') {
        startPoint.ch -= 2
        if (startPoint !== endPoint) {
          endPoint.ch -= 2
        }
      } else if (type === 'italic') {
        startPoint.ch -= 1
        if (startPoint !== endPoint) {
          endPoint.ch -= 1
        }
      }
    } else {
      text = cm.getSelection()
      if (type === 'bold') {
        text = text.split('**').join('')
        // text = text.split('__').join('');
      } else if (type === 'italic') {
        text = text.split('*').join('')
        // text = text.split('_').join('');
      } else if (type === 'strikethrough') {
        text = text.split('~~').join('')
      }
      cm.replaceSelection(start + text + end)

      startPoint.ch += startChars.length
      endPoint.ch = startPoint.ch + text.length
    }

    cm.setSelection(startPoint, endPoint)
    cm.focus()
  }

  render () {
    const { isPrivate, readOnly } = this.props

    return (
      <div className={cn(styles.editor, { [styles.isPrivate]: isPrivate })}>
        {readOnly ? (
          <div ref={this.ref} />
        ) : (
          <textarea
            ref={this.element}
            placeholder='Enter challenge description'
          />
        )}
      </div>
    )
  }
}

DescriptionField.defaultProps = {
  isPrivate: false,
  readOnly: false
}

DescriptionField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateDescription: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  isPrivate: PropTypes.bool,
  readOnly: PropTypes.bool
}
export default DescriptionField
