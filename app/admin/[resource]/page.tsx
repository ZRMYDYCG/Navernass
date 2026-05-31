import { notFound } from 'next/navigation'
import { isAdminResourceId } from '@/lib/admin/resources'
import { ResourceTableView } from '../_components/resource-table-view'

export default async function AdminResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>
}) {
  const { resource } = await params

  if (!isAdminResourceId(resource)) {
    notFound()
  }

  return <ResourceTableView resourceId={resource} />
}
