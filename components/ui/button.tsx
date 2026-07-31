import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
          variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700',
          variant === 'outline' && 'border bg-transparent hover:bg-gray-100',
          variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200',
          variant === 'ghost' && 'hover:bg-gray-100',
          variant === 'link' && 'text-blue-600 underline-offset-4 hover:underline',
          variant === 'default' && 'bg-gray-900 text-white hover:bg-gray-800',
          size === 'sm' && 'h-8 px-3 text-xs',
          size === 'lg' && 'h-11 px-8',
          size === 'default' && 'h-9 px-4 py-2',
          size === 'icon' && 'h-9 w-9',
          className
        )}
        ref={ref} {...props}
      />
    )
  }
)
Button.displayName = 'Button'
export { Button }
