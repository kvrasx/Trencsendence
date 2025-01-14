import { Button } from '@/components/ui/button';

export default function Error404() {
    return (
        <div className="flex flex-col items-center justify-center max-h-screen overflow-hidden text-foreground">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <p className="mt-4 text-xl text-muted-foreground">Page Not Found</p>
            <Button className="mt-6" onClick={() => window.location.href = '/'}>
                Go Home
            </Button>
        </div>
    );
}