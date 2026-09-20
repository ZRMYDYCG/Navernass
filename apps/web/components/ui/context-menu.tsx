'use client'

import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import { Check, ChevronRight, Circle } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const ContextMenu = ContextMenuPrimitive.Root

const ContextMenuTrigger = ContextMenuPrimitive.Trigger

const ContextMenuGroup = ContextMenuPrimitive.Group

const ContextMenuPortal = ContextMenuPrimitive.Portal

const ContextMenuSub = ContextMenuPrimitive.Sub

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

function ContextMenuSubTrigger({ ref, className, inset, children, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean
} & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.SubTrigger> | null> }) {
  return (
    <ContextMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        'flex cursor-default select-none items-center rounded px-1.5 py-0.5 text-[11px] outline-none focus:bg-accent data-[state=open]:bg-accent',
        inset && 'pl-6',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-2.5 w-2.5" />
    </ContextMenuPrimitive.SubTrigger>
  )
}
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName

function ContextMenuSubContent({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent> & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.SubContent> | null> }) {
  return (
    <ContextMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        'z-50 min-w-[7rem] overflow-hidden rounded border border-border bg-popover p-0.5 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  )
}
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName

function ContextMenuContent({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content> & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.Content> | null> }) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        ref={ref}
        className={cn(
          'z-50 min-w-[7rem] overflow-hidden rounded border border-border bg-popover p-0.5 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName

function ContextMenuItem({ ref, className, inset, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
} & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.Item> | null> }) {
  return (
    <ContextMenuPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded px-1.5 py-0.5 text-[11px] outline-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-6',
        className,
      )}
      {...props}
    />
  )
}
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName

function ContextMenuCheckboxItem({ ref, className, children, checked, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem> & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem> | null> }) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1 pl-8 pr-2 text-xs outline-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Check className="h-3 w-3" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}
ContextMenuCheckboxItem.displayName
  = ContextMenuPrimitive.CheckboxItem.displayName

function ContextMenuRadioItem({ ref, className, children, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem> & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.RadioItem> | null> }) {
  return (
    <ContextMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1 pl-8 pr-2 text-xs outline-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName

function ContextMenuLabel({ ref, className, inset, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean
} & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.Label> | null> }) {
  return (
    <ContextMenuPrimitive.Label
      ref={ref}
      className={cn(
        'px-2 py-1.5 text-xs font-semibold text-foreground',
        inset && 'pl-8',
        className,
      )}
      {...props}
    />
  )
}
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName

function ContextMenuSeparator({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator> & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.Separator> | null> }) {
  return (
    <ContextMenuPrimitive.Separator
      ref={ref}
      className={cn('-mx-0.5 my-0.5 h-px bg-border', className)}
      {...props}
    />
  )
}
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName

function ContextMenuShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  )
}
ContextMenuShortcut.displayName = 'ContextMenuShortcut'

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
}
