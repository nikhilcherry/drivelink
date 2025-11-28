

export const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12 border-t border-white/10">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-drive-blue rounded-lg flex items-center justify-center text-white font-bold">
                        D
                    </div>
                    <span className="text-xl font-bold">DriveLink</span>
                </div>

                <div className="text-gray-400 text-sm">
                    © {new Date().getFullYear()} DriveLink. All rights reserved.
                </div>

                <div className="flex gap-6">
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
                </div>
            </div>
        </footer>
    );
};
