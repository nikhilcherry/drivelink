import { GlassCard } from '../components/ui/GlassCard';
import { TrendingUp, Users, Building2, Car, Activity, Brain } from 'lucide-react';

export const Market = () => {
    return (
        <section className="py-24 bg-gray-50 relative">
            <div className="container mx-auto px-6">

                {/* Why DriveLink Matters */}
                <div className="mb-24">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Why DriveLink Matters</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            "Reduces blind-spot accidents",
                            "Makes merging & lane changes smoother",
                            "Eliminates brake-wave traffic",
                            "Enables cooperative autonomous driving",
                            "Enhances fleet efficiency",
                            "Creates a universal communication standard"
                        ].map((item, i) => (
                            <GlassCard key={i} delay={i * 0.1} className="flex items-center gap-4 py-6">
                                <span className="text-lg font-medium text-gray-700">{item}</span>
                            </GlassCard>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Target Segments */}
                    <div>
                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <Users className="text-drive-blue" /> Target Segments
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: "EV Fleets", icon: <Car className="w-5 h-5" /> },
                                { name: "OEM Vehicle Manufacturers", icon: <Building2 className="w-5 h-5" /> },
                                { name: "Smart Cities", icon: <Activity className="w-5 h-5" /> },
                                { name: "Autonomous Driving R&D Labs", icon: <Brain className="w-5 h-5" /> }
                            ].map((segment, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 rounded-full bg-drive-blue/10 flex items-center justify-center text-drive-blue">
                                        {segment.icon}
                                    </div>
                                    <span className="text-lg font-medium text-gray-800">{segment.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Revenue Model */}
                    <div>
                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <TrendingUp className="text-drive-blue" /> Revenue Model
                        </h3>
                        <GlassCard className="h-full bg-gradient-to-br from-white to-blue-50/50">
                            <ul className="space-y-6">
                                {[
                                    "Fleet SaaS subscription per vehicle",
                                    "OEM licensing + update fees",
                                    "Smart city corridor contracts",
                                    "High-margin analytics (intent heatmaps, conflict zones)"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            $
                                        </div>
                                        <span className="text-lg text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </section>
    );
};
