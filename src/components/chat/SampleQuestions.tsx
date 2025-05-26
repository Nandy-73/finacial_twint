
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SampleQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const SampleQuestions: React.FC<SampleQuestionsProps> = ({ onSelectQuestion }) => {
  const questions = [
    "What mortgage amount can I afford with my income?",
    "How can I optimize my tax situation?",
    "Is my retirement savings strategy on track?",
    "What's the best approach for property investment?",
    "How can I improve my investment portfolio?",
    "What should my emergency fund target be?",
    "Am I allocating my budget efficiently?"
  ];

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Sample Questions</CardTitle>
        <CardDescription>Try asking about these financial scenarios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {questions.map((question, i) => (
          <Button
            key={i}
            variant="outline"
            className="text-left justify-start w-full text-sm"
            onClick={() => onSelectQuestion(question)}
          >
            {question}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default SampleQuestions;
