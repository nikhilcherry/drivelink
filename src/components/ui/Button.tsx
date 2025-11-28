import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    children: ReactNode;
}

export const Button = ({ variant = 'primary', className, children, ...props }: ButtonProps) => {
    const variants = {
        primary: "bg-drive-blue text-white hover:bg-[#0B3D68] shadow-lg shadow-drive-blue/30 hover:shadow-drive-blue/40",
        secondary: "bg-white/80 text-drive-blue hover:bg-white shadow-md backdrop-blur-sm",
        outline: "border-2 border-drive-blue text-drive-blue hover:bg-drive-blue/5"
    };

    return (
        <button
            className={cn(
                "px-8 py-3 rounded-full font-semibold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
