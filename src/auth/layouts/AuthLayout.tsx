import { Outlet } from 'react-router'

export const AuthLayout = () => {
  return (
    <>
      <div className="grid min-h-screen lg:grid-cols-2">
        <Outlet />
      </div>
    </>
  )
}
