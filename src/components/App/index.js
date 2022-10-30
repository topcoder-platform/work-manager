/**
 * Component that sets the general structure of the app
 */
import React from 'react'
import TwoRowsLayout from '../TwoRowsLayout'

const App = (content, topbar, sidebar) => () => {
  return (
    <TwoRowsLayout scrollIndependent>
      <TwoRowsLayout.Content>
        {topbar || null}
        {sidebar}
        {content}
      </TwoRowsLayout.Content>
    </TwoRowsLayout>
  )
}

export default App
