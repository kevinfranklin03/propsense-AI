import { Building2, ShieldCheck, Zap, Users, BarChart3 } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
            <Building2 className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">PropSense AI</h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          The next-generation admin portal for proactive property management, powered by IoT intelligence.
        </p>
      </div>

      {/* Mission */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <ShieldCheck className="w-6 h-6 mr-2 text-emerald-500" />
                Proactive Protection
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                PropSense AI moves beyond reactive maintenance. By leveraging real-time IoT sensors for temperature and humidity, we predict and prevent issues like damp and mold before they become costly repairs, ensuring regulatory compliance and tenant well-being.
            </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-amber-500" />
                Operational Efficiency
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Streamline your workflow with our unified command center. From automated ticket generation to real-time portfolio analytics, PropSense AI empowers landlords to manage hundreds of units with the ease of managing one.
            </p>
        </div>
      </div>

      {/* Core Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Core Capabilities</h2>
        <div className="grid md:grid-cols-3 gap-6">
            {[
                {
                    icon: Users,
                    title: "Tenant CRM",
                    desc: "Centralized tenant profiles and communication history.",
                    color: "text-blue-500"
                },
                {
                    icon: BarChart3,
                    title: "Smart Analytics",
                    desc: "Data-driven insights into portfolio health and ROI.",
                    color: "text-purple-500"
                },
                {
                    icon: Building2,
                    title: "Asset Digital Twin",
                    desc: "Live view of every property's status and history.",
                    color: "text-indigo-500"
                }
            ].map((feat, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                    <feat.icon className={`w-8 h-8 ${feat.color} mb-4`} />
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">{feat.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{feat.desc}</p>
                </div>
            ))}
        </div>
      </div>

      <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-400">
            Version 1.2.0 &bull; Built for Hackathon 2026
        </p>
      </div>

    </div>
  );
}
