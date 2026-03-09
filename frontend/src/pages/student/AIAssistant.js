import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { Send, Bot } from 'lucide-react';

export const AIAssistant = () => {
  const { token, API } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    fetchEligibility();
    setMessages([{
      role: 'assistant',
      content: 'Hi! I\'m your AI placement assistant. I can help you with career guidance, interview preparation, skill recommendations, and placement insights. How can I assist you today?'
    }]);
  }, []);

  const fetchEligibility = async () => {
    try {
      const response = await axios.get(`${API}/ai-assistant/eligibility`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEligibility(response.data);
    } catch (error) {
      console.error('Failed to fetch eligibility');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/ai-assistant/chat`,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiMessage = { role: 'assistant', content: response.data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to get AI response');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    'What companies should I target?',
    'How can I improve my resume?',
    'Interview tips for tech companies',
    'Skills I should learn for better placements'
  ];

  const sendQuickMessage = async (message) => {
  try {

    // add user message
    setMessages(prev => [...prev, { role: "user", content: message }]);

    const res = await axios.post(
      `${API}/ai-assistant/chat`,
      { message },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    // add AI response
    setMessages(prev => [...prev, { role: "assistant", content: res.data.response }]);

  } catch (error) {
    toast.error("AI assistant failed");
  }
};
  return (
    <div className="p-8" data-testid="ai-assistant-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
        <p className="text-gray-600 mt-1">Get personalized career guidance and placement insights</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="text-blue-600" size={24} />
                Chat with AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2" data-testid="chat-messages">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${idx}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                      style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
                    >
                      <p className="text-sm whitespace-pre-wrap" style={{ wordBreak: 'break-word' }}>{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Thinking...</p>
                    </div>
                  </div>
                )}
              </div>

              {messages.length === 1 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Suggested questions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestedQuestions.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setInput(question)}
                        className="text-left justify-start h-auto py-2"
                        data-testid={`suggested-question-${idx}`}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything about placements..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={loading}
                  data-testid="ai-chat-input"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                  data-testid="send-message-button"
                >
                  <Send size={20} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {eligibility && (
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    {eligibility.percentage}%
                  </div>
                  <p className="text-sm text-gray-600">
                    Eligible for {eligibility.eligible_count} out of {eligibility.total_drives} drives
                  </p>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-700">
                      {eligibility.percentage >= 70 ? 'Good' : eligibility.percentage >= 40 ? 'Average' : 'Needs Improvement'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space">
              <Button
  onClick={() => sendQuickMessage("Review my resume and suggest improvements")}
>
  Get Resume Review
</Button>

<Button
  onClick={() => sendQuickMessage("Conduct a mock interview for a software developer role")}
>
  Practice Interview
</Button>

<Button
  onClick={() => sendQuickMessage("Suggest companies I should target based on my skills")}
>
  Company Matching
</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};