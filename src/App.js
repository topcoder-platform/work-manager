/**
 * Component to configure and render routes
 */
import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import ReduxToastr from 'react-redux-toastr'
import Routes from './routes'
import store from './config/store'

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
    <ReduxToastr
      timeOut={3000}
      newestOnTop={false}
      preventDuplicates
      position='top-center'
      transitionIn='fadeIn'
      transitionOut='fadeOut'
      progressBar
      closeOnToastrClick />
  </Provider>
)

export default App
