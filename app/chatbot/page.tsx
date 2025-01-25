import Chatbot from '@/components/ui/Chatbot';

export default function ChatbotPage() {
  const handleClose = () => {
    window.close();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Chatbot onClose={handleClose} />
    </div>
  );
}