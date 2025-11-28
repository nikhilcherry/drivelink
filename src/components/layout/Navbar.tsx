import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Menu, X, Zap } from 'lucide-react';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Vision', href: '#vision' },
        { name: 'Technology', href: '#technology' },
        { name: 'Roadmap', href: '#roadmap' },
        { name: 'Team', href: '#team' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                isScrolled
                    ? "py-4 bg-white/70 backdrop-blur-xl border-white/20 shadow-sm"
                    : "py-6 bg-transparent border-transparent"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <a href="#" className="text-2xl font-bold tracking-tighter text-drive-blue flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-drive-blue to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                        <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-drive-blue to-blue-800">
                        DriveLink
                    </span>
                </a>

                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className="text-gray-600 hover:text-drive-blue transition-colors font-medium text-sm tracking-wide"
                        >
                            {item.name}
                        </a>
                    ))}
                </div>

                <button className="md:hidden text-gray-700" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 absolute w-full"
                >
                    <div className="flex flex-col p-6 gap-4">
                        {navLinks.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-medium text-gray-800 py-2 border-b border-gray-50"
                            >
                                {item.name}
                            </a>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};
