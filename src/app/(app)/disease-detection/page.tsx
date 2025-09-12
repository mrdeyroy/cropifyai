import { DiseaseDetector } from '@/components/disease-detector';

export default function DiseaseDetectionPage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Crop Disease Detection
                </h1>
                <p className="text-muted-foreground">
                    Upload an image of a crop to identify potential diseases using AI.
                </p>
            </div>
            <DiseaseDetector />
        </div>
    );
}
