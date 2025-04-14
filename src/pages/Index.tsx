
import { Header } from "@/components/Header";
import { YouTubeInput } from "@/components/YouTubeInput";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <YouTubeInput />
        </div>
      </main>
    </div>
  );
};

export default Index;
