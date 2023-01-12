/**
 * Component that sets the general structure of the app
 */
import React from 'react'
import TwoRowsLayout from '../TwoRowsLayout'

const App = (content, topbar, sidebar, footer) => () => {
  return (
    <TwoRowsLayout scrollIndependent>
      <TwoRowsLayout.Content>
        {topbar || null}
        {sidebar}
        {content}
        {footer || null}
      </TwoRowsLayout.Content>
    </TwoRowsLayout>
  )
}

export default App
