import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Cpu, BarChart, UserPlus, FileText, Bot } from 'lucide-react';

const workflowSteps = [
  { icon: <UserPlus className="w-8 h-8" />, text: "Sign Up & Create Profile" },
  { icon: <FileText className="w-8 h-8" />, text: "Input Your Farm Data" },
  { icon: <Upload className="w-8 h-8" />, text: "Upload Crop Images" },
  { icon: <Cpu className="w-8 h-8" />, text: "AI Processing & Analysis" },
  { icon: <BarChart className="w-8 h-8" />, text: "Receive Recommendations" },
  { icon: <Bot className="w-8 h-8" />, text: "Chat with AgriBot for help" },
];

export function Workflow() {
  return (
    <section id="workflow" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">How It Works</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            A simple, farmer-friendly process to get powerful insights.
          </p>
        </div>
        <div className="relative">
           <div className="hidden lg:flex items-center justify-center absolute inset-0">
                <div className="w-full max-w-6xl border-t-2 border-dashed border-primary/30"></div>
           </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {workflowSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                  <div className="relative z-10 flex items-center justify-center w-20 h-20 bg-background border-2 border-primary/50 text-primary rounded-full shadow-lg">
                      {step.icon}
                  </div>
                  <p className="mt-4 font-semibold">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
