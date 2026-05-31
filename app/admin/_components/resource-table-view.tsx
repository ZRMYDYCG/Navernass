'use client'

import { Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { AdminResourceId } from '@/lib/admin/resources'
import { ADMIN_RESOURCES, getResourceColumns } from '@/lib/admin/resources'
import { useI18n } from '@/hooks/use-i18n'
import { AdminHeader } from './admin-header'
import { AdminPagination } from './admin-pagination'

interface ResourceTableViewProps {
  resourceId: AdminResourceId
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'string' && value.length > 120) return `${value.slice(0, 120)}…`
  return String(value)
}

function formatDate(value: unknown) {
  if (typeof value !== 'string') return formatCellValue(value)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

export function ResourceTableView({ resourceId }: ResourceTableViewProps) {
  const { t } = useI18n()
  const config = ADMIN_RESOURCES[resourceId]
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/resources/${resourceId}?page=${page}&pageSize=${pageSize}`,
        { cache: 'no-store', credentials: 'include' },
      )
      const result = await response.json()
      if (!result.success) {
        toast.error(result.error?.message || t('admin.messages.loadFailed'))
        return
      }

      setRows(Array.isArray(result.data) ? result.data : [])
      setTotal(result.meta?.total || 0)
    } catch {
      toast.error(t('admin.messages.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [page, resourceId, t])

  useEffect(() => {
    loadData()
  }, [loadData])

  const columns = useMemo(() => {
    if (rows.length === 0) return ['id']
    return getResourceColumns(rows[0], config.hideContent)
  }, [rows, config.hideContent])

  const canDelete = ['users', 'novels', 'news', 'message-wall', 'writer-todos', 'surveys'].includes(resourceId)

  const handleDelete = async (row: Record<string, unknown>) => {
    const id = String(row.id || '')
    if (!id) return

    if (!window.confirm(t('admin.messages.deleteConfirm'))) return

    const response = await fetch(`/api/admin/resources/${resourceId}?id=${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    const result = await response.json()

    if (!result.success) {
      toast.error(result.error?.message || t('admin.messages.actionFailed'))
      return
    }

    toast.success(t('admin.messages.deleted'))
    loadData()
  }

  const renderCell = (row: Record<string, unknown>, column: string) => {
    const value = row[column]

    if (column === 'role' && typeof value === 'string') {
      return value === 'super_admin'
        ? <Badge>{t('admin.users.superAdmin')}</Badge>
        : <Badge variant="secondary">{t('admin.users.regularUser')}</Badge>
    }

    if (column.includes('_at') || column.endsWith('At')) {
      return formatDate(value)
    }

    if (column === 'is_protected') {
      return value ? <Badge variant="outline">{t('admin.protected')}</Badge> : '—'
    }

    if (column === 'status' && typeof value === 'string') {
      return <Badge variant="outline">{value}</Badge>
    }

    return formatCellValue(value)
  }

  return (
    <>
      <AdminHeader title={t(config.labelKey)} description={t(config.descriptionKey)} />
      <div className="flex-1 overflow-y-auto p-6">
        <Card className="mx-auto max-w-7xl">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>{t(config.labelKey)}</CardTitle>
              <CardDescription>
                {t('admin.table.total', { count: total })}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => loadData()}>
              {t('admin.table.refresh')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[var(--radius)] border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map(column => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                    {canDelete ? <TableHead className="text-right">{t('admin.actions')}</TableHead> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <TableRow key={index}>
                          {columns.map(column => (
                            <TableCell key={column}><Skeleton className="h-4 w-full" /></TableCell>
                          ))}
                          {canDelete ? <TableCell><Skeleton className="ml-auto h-4 w-8" /></TableCell> : null}
                        </TableRow>
                      ))
                    : rows.length === 0
                      ? (
                          <TableRow>
                            <TableCell colSpan={columns.length + (canDelete ? 1 : 0)} className="py-10 text-center text-muted-foreground">
                              {t('admin.table.empty')}
                            </TableCell>
                          </TableRow>
                        )
                      : rows.map((row) => {
                          const rowKey = String(row.id || JSON.stringify(row))
                          return (
                            <TableRow key={rowKey}>
                              {columns.map(column => (
                                <TableCell key={column} className="max-w-xs truncate align-top">
                                  {renderCell(row, column)}
                                </TableCell>
                              ))}
                              {canDelete
                                ? (
                                    <TableCell className="text-right">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={Boolean(row.is_protected) || row.role === 'super_admin'}
                                        onClick={() => handleDelete(row)}
                                      >
                                        <Trash2 className="size-4" />
                                      </Button>
                                    </TableCell>
                                  )
                                : null}
                            </TableRow>
                          )
                        })}
                </TableBody>
              </Table>
            </div>

            <AdminPagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
