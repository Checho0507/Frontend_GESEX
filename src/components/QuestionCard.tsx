import React from "react";

interface QuestionCardProps {
  question: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <div className="border rounded p-4 shadow">
      <p>{question}</p>
    </div>
  );
};

export default QuestionCard;