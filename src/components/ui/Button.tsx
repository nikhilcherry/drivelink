"use client";

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'ref'> {
    variant?: 'primary' | 'secondary' | 'outline';
    children: ReactNode;
    className?: string;
}

// Combine standard button props with motion props
type CombinedProps = ButtonProps & HTMLMotionProps<"button">;

export const Button = ({ variant = 'primary', className, children, ...props }: CombinedProps) => {
    const variants = {
        primary: "bg-drive-blue text-white shadow-lg shadow-drive-blue/20 hover:shadow-drive-blue/40 border-none",
        secondary: "bg-white/90 text-drive-blue shadow-md backdrop-blur-sm border border-transparent hover:border-white/50",
        outline: "border border-drive-blue text-drive-blue hover:bg-drive-blue/5"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={cn(
                "px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-drive-blue",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
};
