import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
    delay?: number;
}

export const GlassCard = ({ children, className, hoverEffect = true, delay = 0, ...props }: GlassCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                "glass-card rounded-2xl p-8 relative overflow-hidden border border-white/40",
                hoverEffect && "hover:scale-[1.02] hover:shadow-drive-blue/10 hover:border-drive-blue/30",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/0 pointer-events-none" />
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};
