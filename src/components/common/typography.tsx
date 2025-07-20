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
    h1: `font-sans font-medium text-[4.5rem] leading-[100%]`, // 72px
    h2: `font-sans font-medium text-[2.25rem] leading-[120%]`, // 36px
    h3: `font-sans font-medium text-[1.25rem] leading-[100%]`, // 20px
    h4: `font-sans font-semibold text-[1rem]`, // 16px
    h5: `font-sans font-medium text-[0.875rem] leading-[100%]`, // 14px
    h6: `font-sans font-semibold text-[0.75rem] leading-[100%]`, // 12px
    paragraph: `font-sans text-[0.875rem]`, // 14px
    small: `font-sans font-normal text-[0.75rem]`, // 12px
    extraSmall: `font-sans font-normal text-[0.625rem]`, // 10px
};

const Typography = ({
    variant = 'paragraph',
    tag,
    className,
    children,
    itemProp,
}: TypographyProps) => {
    const Component = tag || defaultTags[variant];

    const textColor = className?.includes('text-') ? '' : 'text-docmosaic-black';

    const combinedClassNames = `${typographyStyles[variant]} ${textColor} ${className || ''}`;

    return (
        <Component className={combinedClassNames} itemProp={itemProp}>
            {children}
        </Component>
    );
};

export default Typography;
