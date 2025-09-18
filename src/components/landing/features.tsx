import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Languages, Leaf, LineChart, ShieldCheck, Sun, DollarSign } from 'lucide-react';

const featureList = [
    {
        icon: <BrainCircuit className="w-10 h-10 text-primary" />,
        title: "Smart Crop Recommendation",
        description: "AI analyzes your soil, weather, and market data to suggest the most profitable and sustainable crops."
    },
    {
        icon: <ShieldCheck className="w-10 h-10 text-primary" />,
        title: "Disease Detection with Images",
        description: "Simply upload a photo of a crop to instantly identify diseases and receive treatment advice."
    },
    {
        icon: <Sun className="w-10 h-10 text-primary" />,
        title: "Weather & Soil Analysis",
        description: "Get real-time weather forecasts and detailed soil health insights to optimize your farming strategy."
    },
    {
        icon: <LineChart className="w-10 h-10 text-primary" />,
        title: "Market Price Tracking",
        description: "Stay ahead with live market prices for various crops, helping you sell at the best time."
    },
    {
        icon: <DollarSign className="w-10 h-10 text-primary" />,
        title: "Profit Tracking",
        description: "Manage your farm's finances, track income and expenses, and calculate profitability with ease."
    },
    {
        icon: <Languages className="w-10 h-10 text-primary" />,
        title: "Multilingual Support",
        description: "Use the app in your local language with both text and voice input capabilities for easy access."
    }
]

export function Features() {
  return (
    <section id="features" className="py-20 bg-muted/40">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Powerful Tools for Modern Farming</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Everything you need to increase yield and profitability, all in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center text-center p-6 bg-background shadow-md hover:shadow-lg transition-shadow">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {feature.icon}
                </div>
                <CardHeader className="p-0">
                    <CardTitle className="text-xl font-semibold mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardDescription className="text-base">
                    {feature.description}
                </CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
