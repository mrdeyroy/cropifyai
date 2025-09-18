import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonialsList = [
    {
        name: "Ramesh Kumar",
        location: "Punjab",
        avatar: "https://i.pravatar.cc/150?img=12",
        initials: "RK",
        text: "This app is a game-changer. The crop recommendations helped me increase my yield by 20% in one season. The disease detection is also very accurate."
    },
    {
        name: "Sunita Devi",
        location: "Maharashtra",
        avatar: "https://i.pravatar.cc/150?img=5",
        initials: "SD",
        text: "I love the market price tracker. It helped me sell my produce at a much higher price than usual. Very easy to use, even for someone who is not tech-savvy."
    },
    {
        name: "Anil Patel",
        location: "Gujarat",
        avatar: "https://i.pravatar.cc/150?img=7",
        initials: "AP",
        text: "CropifyAI helped me identify a nutrient deficiency in my soil that I was unaware of. After following the advice, my crops are healthier than ever."
    }
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-muted/40">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Loved by Farmers Across India</h2>
           <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Don't just take our word for it. Here's what our users have to say.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonialsList.map((testimonial, index) => (
                <Card key={index} className="bg-background shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                            <Avatar className="h-12 w-12 mr-4">
                                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                <AvatarFallback>{testimonial.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{testimonial.name}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                            </div>
                        </div>
                        <div className="flex mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                            ))}
                        </div>
                        <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </section>
  );
}
