import { requireAuth } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage() {
  const user = await requireAuth()

  return (
    <DashboardLayout
      user={{ id: user.id, name: user.user_metadata?.name || user.email || "", email: user.email || "" }}
    >
      <DashboardContent userId={user.id} />
    </DashboardLayout>
  )
}
