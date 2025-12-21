import * as React from 'react'

import { cn } from '@/lib/utils'

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

function Label({ ref, className, ...props }: LabelProps & { ref?: React.RefObject<HTMLLabelElement | null> }) {
  return (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground',
        className,
      )}
      {...props}
    />
  )
}

Label.displayName = 'Label'

export { Label }
