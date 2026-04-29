import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Outlet } from 'react-router'
import { AdminSidebar } from '../components/AdminSideBar'

export const AdminLayout = () => {
  return (
    <>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AdminSidebar />
          <SidebarInset className="bg-background">
            <Outlet />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  )
}
