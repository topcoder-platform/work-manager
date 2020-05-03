/**
 * Inital component that renders react app to HTML
 */
import React from 'react'
import ReactDOM from 'react-dom'
import './styles/main.scss'
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css'
import App from './App'

ReactDOM.render(<App />, document.getElementById('root'))
