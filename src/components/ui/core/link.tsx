import Typography from '@/components/common/typography';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { forwardRef } from 'react';

const linkVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-docmosaic-black text-white shadow hover:bg-docmosaic-black/90',
                cream: 'bg-docmosaic-cream text-docmosaic-black shadow hover:bg-docmosaic-cream/90',
                sage: 'bg-docmosaic-sage text-docmosaic-black shadow hover:bg-docmosaic-sage/90',
                orange: 'bg-docmosaic-orange text-docmosaic-black shadow hover:bg-docmosaic-orange/90',
                caramel: 'bg-docmosaic-caramel text-docmosaic-black shadow hover:bg-docmosaic-caramel/90',
                gradient:
                    'bg-gradient-to-r from-docmosaic-sage/90 via-docmosaic-cream/80 via-docmosaic-orange/80 to-docmosaic-caramel/90 text-docmosaic-black shadow hover:opacity-90',
                white: 'bg-white text-docmosaic-black shadow hover:bg-docmosaic-black/10',
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

export interface CustomLinkProps
    extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
        VariantProps<typeof linkVariants> {
    href: string;
    external?: boolean;
    icon?: React.ReactNode;
}

const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>(
    ({ className, variant, size, href, external = false, children, icon, ...props }, ref) => {
        const linkProps = external
            ? {
                  target: '_blank',
                  rel: 'noopener noreferrer',
              }
            : {};

        return (
            <Link
                href={href}
                className={cn(linkVariants({ variant, size, className }))}
                ref={ref}
                {...linkProps}
                {...props}
            >
                {typeof children === 'string' ? (
                    <Typography variant={size === 'sm' ? 'h6' : 'h5'} className="!text-inherit uppercase">
                        {children}
                    </Typography>
                ) : (
                    children
                )}
                {icon && <span className="ml-2">{icon}</span>}
            </Link>
        );
    },
);
CustomLink.displayName = 'CustomLink';

export { CustomLink, linkVariants };
