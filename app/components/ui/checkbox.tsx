import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/app/lib/utils';

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer size-4 shrink-0 rounded-md border transition-all outline-none disabled:cursor-not-allowed disabled:opacity-40',
        'border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500/30',
        'dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10',
        'data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white',
        'dark:data-[state=checked]:bg-blue-600 dark:data-[state=checked]:border-blue-600 dark:data-[state=checked]:text-white',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <CheckIcon className="size-3 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };