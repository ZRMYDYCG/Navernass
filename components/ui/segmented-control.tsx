import type { VariantProps } from 'class-variance-authority'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const segmentedControlVariants = cva(
  'inline-flex items-center justify-center rounded-lg p-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 transition-colors',
  {
    variants: {
      size: {
        sm: 'h-8 text-xs',
        default: 'h-9 text-sm',
        lg: 'h-10 text-sm',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

const segmentedControlItemVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=checked]:bg-white dark:data-[state=checked]:bg-gray-700 data-[state=checked]:text-gray-900 dark:data-[state=checked]:text-gray-100 data-[state=checked]:shadow-sm',
  {
    variants: {
      size: {
        sm: 'h-6 px-2.5 text-xs',
        default: 'h-7 px-3 text-sm',
        lg: 'h-8 px-4 text-sm',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

interface SegmentedControlProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
  VariantProps<typeof segmentedControlVariants> {}

function SegmentedControl({ className, size, ...props }: SegmentedControlProps) {
  return <RadioGroupPrimitive.Root data-slot="segmented-control" className={cn(segmentedControlVariants({ size, className }))} {...props} />
}

interface SegmentedControlItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
  VariantProps<typeof segmentedControlItemVariants> {}

function SegmentedControlItem({ className, size, ...props }: SegmentedControlItemProps) {
  return <RadioGroupPrimitive.Item data-slot="segmented-control-item" className={cn(segmentedControlItemVariants({ size, className }))} {...props} />
}

export { SegmentedControl, SegmentedControlItem }
