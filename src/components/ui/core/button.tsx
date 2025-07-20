import Typography from '@/components/common/typography';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-docmosaic-black text-white shadow hover:bg-docmosaic-black/90',
                cream: 'bg-docmosaic-cream text-docmosaic-black shadow hover:bg-docmosaic-cream/90',
                sage: 'bg-docmosaic-sage text-docmosaic-black shadow hover:bg-docmosaic-sage/90',
                orange: 'bg-docmosaic-orange text-docmosaic-black shadow hover:bg-docmosaic-orange/90',
                caramel:
                    'bg-docmosaic-caramel text-docmosaic-black shadow hover:bg-docmosaic-caramel/90',
                white: 'bg-white text-docmosaic-black shadow hover:bg-docmosaic-black/10',
                gradient: 'bg-gradient text-docmosaic-black shadow hover:opacity-90',
                destructive:
                    'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
                outline:
                    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-9 px-6 py-2',
                sm: 'h-8 rounded-md px-3',
                lg: 'h-10 rounded-md px-8',
                icon: 'h-9 w-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, children, icon, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
                {typeof children === 'string' ? (
                    <Typography
                        variant={size === 'sm' ? 'h6' : 'h5'}
                        className="!text-inherit uppercase"
                    >
                        {children}
                    </Typography>
                ) : (
                    children
                )}
                {icon && <span className="ml-2">{icon}</span>}
            </Comp>
        );
    },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
