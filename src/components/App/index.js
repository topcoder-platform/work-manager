/**
 * Component that sets the general structure of the app
 */
import React from 'react'
import TwoColsLayout from '../TwoColsLayout'

const App = (content, topbar, sidebar) => () => {
  return (
    <TwoColsLayout scrollIndependent>
      <TwoColsLayout.Sidebar>
        {sidebar}
      </TwoColsLayout.Sidebar>
      <TwoColsLayout.Content>
        {topbar || null}
        {content}
      </TwoColsLayout.Content>
    </TwoColsLayout>
  )
}

export default App
