import { Outlet } from 'react-router'
import { HomeFooter } from '../components/HomeFooter'
import { HomeHeader } from '../components/HomeHeader'

export const HomeLayout = () => {
  return (
    <>
      <HomeHeader />

      <div className="min-h-screen bg-background">
        <Outlet />
      </div>

      <HomeFooter />
    </>
  )
}
