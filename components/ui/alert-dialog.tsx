export { Dialog as AlertDialog, DialogContent as AlertDialogContent, DialogHeader as AlertDialogHeader, DialogTitle as AlertDialogTitle } from './dialog'
import { cn } from '@/lib/utils'

export function AlertDialogAction({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return <button onClick={onClick} className={cn('inline-flex items-center justify-center rounded-md bg-gray-900 text-white h-9 px-4 py-2 text-sm font-medium hover:bg-gray-800', className)}>{children}</button>
}
export function AlertDialogCancel({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return <button onClick={onClick} className={cn('inline-flex items-center justify-center rounded-md border h-9 px-4 py-2 text-sm font-medium hover:bg-gray-100', className)}>{children}</button>
}
export function AlertDialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-sm text-gray-500', className)}>{children}</p>
}
export function AlertDialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex justify-end gap-2 mt-4', className)}>{children}</div>
}
