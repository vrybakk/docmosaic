import React, { JSX } from 'react';

export type TypographyVariant =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'paragraph'
    | 'small'
    | 'extraSmall';

type TypographyProps = {
    variant?: TypographyVariant;
    tag?: keyof JSX.IntrinsicElements;
    className?: string;
    children: React.ReactNode;
    itemProp?: string;
};

const defaultTags: Record<string, keyof JSX.IntrinsicElements> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    paragraph: 'p',
    small: 'p',
    extraSmall: 'span',
};

const typographyStyles = {
    h1: `font-sans font-medium text-[4.5rem] leading-[100%] tracking-[0%] text-docmosaic-black`, // 72px
    h2: `font-sans font-medium text-[2.25rem] leading-[100%] tracking-[0%] text-docmosaic-black`, // 36px
    h3: `font-sans font-medium text-[1.25rem] leading-[100%] tracking-[0%] text-docmosaic-black`, // 20px
    h4: `font-sans font-semibold text-[1rem] leading-[100%] tracking-[0%] text-docmosaic-black`, // 16px
    h5: `font-sans font-medium text-[0.875rem] leading-[100%] tracking-[0%] text-docmosaic-black`, // 14px
    h6: `font-sans font-semibold text-[0.75rem] leading-[100%] tracking-[0%] text-docmosaic-black`, // 12px
    paragraph: `font-sans font-semibold text-[0.75rem] leading-[100%] tracking-[0%] text-docmosaic-black`, // 12px
    small: `font-sans font-normal text-[0.75rem] leading-[100%] tracking-[0%] text-docmosaic-black`, // 12px
    extraSmall: `font-sans font-normal text-[0.625rem] leading-[100%] tracking-[0%] text-docmosaic-black`, // 10px
};

const Typography = ({
    variant = 'paragraph',
    tag,
    className,
    children,
    itemProp,
}: TypographyProps) => {
    const Component = tag || defaultTags[variant];

    const combinedClassNames = `${typographyStyles[variant]} ${className || ''}`;

    return (
        <Component className={combinedClassNames} itemProp={itemProp}>
            {children}
        </Component>
    );
};

export default Typography;
