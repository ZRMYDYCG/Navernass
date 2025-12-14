'use client'

import * as ToastPrimitives from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitives.Provider

function ToastViewport({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport> & { ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Viewport> | null> }) {
  return (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col sm:max-w-[380px]',
        className,
      )}
      {...props}
    />
  )
}
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

function Toast({ ref, className, variant = 'default', ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
  variant?: 'default' | 'destructive'
} & { ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Root> | null> }) {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        'group pointer-events-auto relative flex w-full items-start space-x-3 overflow-hidden rounded-xl border border-stone-200/60 dark:border-zinc-700/50 p-4 sm:p-5 shadow-sm transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
        'bg-[#FDFBF7] dark:bg-zinc-800',
        'bg-paper-texture',
        'scale-90 sm:scale-100',
        variant === 'destructive' && 'border-red-200/60 dark:border-red-800/50 bg-red-50/80 dark:bg-red-900/20',
        className,
      )}
      {...props}
    />
  )
}
Toast.displayName = ToastPrimitives.Root.displayName

function ToastAction({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action> & { ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Action> | null> }) {
  return (
    <ToastPrimitives.Action
      ref={ref}
      className={cn(
        'inline-flex h-7 shrink-0 items-center justify-center rounded-lg border border-stone-200 dark:border-zinc-700 bg-transparent px-3 text-sm font-serif font-medium text-stone-700 dark:text-zinc-300 transition-all hover:bg-stone-100 dark:hover:bg-zinc-700/50 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-zinc-600 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-200/60 dark:group-[.destructive]:border-red-800/50 group-[.destructive]:text-red-700 dark:group-[.destructive]:text-red-400 group-[.destructive]:hover:bg-red-50 dark:group-[.destructive]:hover:bg-red-900/20',
        className,
      )}
      {...props}
    />
  )
}
ToastAction.displayName = ToastPrimitives.Action.displayName

function ToastClose({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close> & { ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Close> | null> }) {
  return (
    <ToastPrimitives.Close
      ref={ref}
      className={cn(
        'absolute right-3 top-3 rounded-full p-1 text-stone-400 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-stone-100 dark:hover:bg-zinc-700/50',
        'focus:opacity-100 focus:outline-none',
        className,
      )}
      toast-close=""
      {...props}
    >
      {/* <X className="h-3.5 w-3.5" strokeWidth={2.5} /> */}
    </ToastPrimitives.Close>
  )
}
ToastClose.displayName = ToastPrimitives.Close.displayName

function ToastTitle({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title> & { ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Title> | null> }) {
  return (
    <ToastPrimitives.Title
      ref={ref}
      className={cn('text-sm font-serif font-medium text-stone-800 dark:text-zinc-200', className)}
      {...props}
    />
  )
}
ToastTitle.displayName = ToastPrimitives.Title.displayName

function ToastDescription({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description> & { ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Description> | null> }) {
  return (
    <ToastPrimitives.Description
      ref={ref}
      className={cn('text-sm font-serif text-stone-600 dark:text-zinc-400 leading-relaxed', className)}
      {...props}
    />
  )
}
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  Toast,
  ToastAction,
  type ToastActionElement,
  ToastClose,
  ToastDescription,
  type ToastProps,
  ToastProvider,
  ToastTitle,
  ToastViewport,
}
