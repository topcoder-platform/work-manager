/**
 * Component to render a styled table
 */
import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './Table.module.scss'

const Table = (props) => {
  const { options, rows, className } = props
  const headers = options.map(o => <th style={{ flex: o.width || 0 }} key={`th-${o.name}`}>{o.name}</th>)
  // If the table is expandable it uses multiple tbodys
  return (
    <table className={cn(className)}>
      <thead>
        <Table.Row>{headers}</Table.Row>
      </thead>
      {props.expandable && rows}
      {!props.expandable && (<tbody>{rows}</tbody>)}
    </table>
  )
}

Table.defaultProps = {
  expandable: false
}

Table.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  rows: PropTypes.arrayOf(PropTypes.node).isRequired,
  expandable: PropTypes.bool,
  className: PropTypes.string
}

Table.Row = (props) => {
  return (
    <tr className={props.className} onClick={props.onClick}>{props.children}</tr>
  )
}

Table.Row.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func
}

Table.Col = (props) => {
  return (
    <td style={{ flex: props.width || 0 }} {...props}>{props.children}</td>
  )
}

Table.Col.propTypes = {
  children: PropTypes.node,
  width: PropTypes.number
}

Table.ExpandableRow = (props) => {
  return (
      <>
        <tbody>
          <Table.Row {...props} onClick={props.onClick} />
        </tbody>
        <tbody className={cn(styles.expand, { [styles.hidden]: !props.expanded }, props.expandContainerClassName)}>
          {props.expandRows}
        </tbody>
      </>
  )
}

Table.ExpandableRow.propTypes = {
  expandContainerClassName: PropTypes.string,
  expandRows: PropTypes.node,
  expanded: PropTypes.bool,
  onClick: PropTypes.func
}

export default Table
