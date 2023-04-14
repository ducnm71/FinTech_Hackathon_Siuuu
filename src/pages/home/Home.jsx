import React from 'react'
import Aside from '../../components/aside/Aside'
import { Outlet } from 'react-router-dom'
import './home.scss'
const Home = () => {
  return (
    <div className='home'>
      <Aside/>
      <Outlet />
    </div>
  )
}

export default Home