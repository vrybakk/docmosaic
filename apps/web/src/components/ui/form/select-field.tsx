'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/form/select';

interface Option {
    value: string;
    label: string;
}

interface SelectFieldProps {
    value: string;
    onValueChange: (value: string) => void;
    options: Option[];
    className?: string;
}

export function SelectField({ value, onValueChange, options, className }: SelectFieldProps) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className={className}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
