import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const tableContainerVariants = cva('relative w-full overflow-x-auto', {
  variants: {
    variant: {
      /** 仅滚动容器，外层边框由父级控制 */
      plain: '',
      /** 自带纸感边框与阴影的台账容器 */
      ledger: 'nv-table-ledger rounded-[var(--radius)] border border-border shadow-paper-sm',
    },
  },
  defaultVariants: {
    variant: 'plain',
  },
})

type TableProps = React.ComponentProps<'table'> & VariantProps<typeof tableContainerVariants> & {
  /** 行高密度：default 舒适 / compact 紧凑（编辑器侧栏等） */
  density?: 'default' | 'compact'
}

function Table({
  className,
  variant,
  density = 'default',
  ...props
}: TableProps) {
  return (
    <div
      data-slot="table-container"
      data-variant={variant ?? 'plain'}
      className={cn(tableContainerVariants({ variant }))}
    >
      <table
        data-slot="table"
        data-density={density}
        className={cn('w-full caption-bottom text-sm text-render-crisp', className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'transition-[background-color,box-shadow] duration-200 ease-paper motion-reduce:transition-none',
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-9 px-3 text-left align-middle whitespace-nowrap first:pl-4 last:pr-4',
        '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-3 py-2.5 align-middle text-foreground first:pl-4 last:pr-4',
        '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-3 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  tableContainerVariants,
}
