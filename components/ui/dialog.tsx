'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

interface DialogProps { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }
function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [open])
  if (!open) return null
  return <div className="fixed inset-0 z-50"><div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} /><div className="fixed inset-0 flex items-center justify-center p-4">{children}</div></div>
}
function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('relative bg-white rounded-lg shadow-lg max-w-lg w-full p-6', className)} onClick={(e) => e.stopPropagation()} {...props}>{children}</div>
}
function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn('mb-4', className)} {...props} /> }
function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) { return <h2 className={cn('text-lg font-semibold', className)} {...props} /> }
export { Dialog, DialogContent, DialogHeader, DialogTitle }
