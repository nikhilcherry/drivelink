import { GlassCard } from '../components/ui/GlassCard';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export const Progress = () => {
    const progressItems = [
        { label: "Concept validation", status: "done" },
        { label: "Mentor support", status: "done" },
        { label: "VC interest", status: "done" },
        { label: "Team formation", status: "done" },
        { label: "Prototype build", status: "in-progress" },
        { label: "Protocol development", status: "planned" },
        { label: "Field tests", status: "planned" },
        { label: "Deployment", status: "future" },
    ];

    const getIcon = (status: string) => {
        switch (status) {
            case 'done': return <CheckCircle2 className="w-6 h-6 text-green-500" />;
            case 'in-progress': return <Clock className="w-6 h-6 text-yellow-500 animate-pulse" />;
            default: return <Circle className="w-6 h-6 text-gray-300" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'done': return 'Done';
            case 'in-progress': return 'In Progress';
            case 'planned': return 'Planned';
            case 'future': return 'Future';
            default: return '';
        }
    };

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-bold mb-6">Company <span className="text-gradient">Progress</span></h2>
                        <p className="text-xl text-gray-500 mb-12">
                            Tracking our journey from concept to universal standard.
                        </p>

                        <div className="space-y-4">
                            {progressItems.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                                    <span className="text-lg font-medium text-gray-800">{item.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold uppercase tracking-wider ${item.status === 'done' ? 'text-green-600' :
                                                item.status === 'in-progress' ? 'text-yellow-600' : 'text-gray-400'
                                            }`}>
                                            {getStatusText(item.status)}
                                        </span>
                                        {getIcon(item.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <GlassCard className="text-center py-16 bg-drive-blue text-white">
                        <h3 className="text-3xl font-bold mb-6">Join the Revolution</h3>
                        <p className="text-xl text-black mb-8 max-w-md mx-auto font-medium">
                            "Investors, OEMs, fleets, and mobility partners — let's build the future together."
                        </p>
                        <button className="px-8 py-4 bg-white text-drive-blue rounded-full font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl">
                            Partner with DriveLink
                        </button>
                    </GlassCard>
                </div>
            </div>
        </section>
    );
};
