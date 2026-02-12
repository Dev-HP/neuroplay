import React, { useState, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import './MathPortalSystem.css';

/**
 * Sistema de Portais Matemáticos (Bullet Time)
 * Aparece a cada X segundos com equação
 */
export default function MathPortalSystem({ interval, difficulty, onAnswer, gameState }) {
  const [isActive, setIsActive] = useState(false);
  const [equation, setEquation] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (gameState !== 'playing') {
      clearInterval(timerRef.current);
      setIsActive(false);
      return;
    }

    timerRef.current = setInterval(() => {
      activateBulletTime();
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [interval, gameState]);

  const activateBulletTime = () => {
    const newEquation = generateEquation(difficulty);
    setEquation(newEquation);
    setIsActive(true);
    setStartTime(Date.now());
  };

  const generateEquation = (diff) => {
    const operations = {
      easy: ['+', '-'],
      medium: ['+', '-', '×'],
      hard: ['+', '-', '×', '÷']
    };

    const ops = operations[diff] || operations.easy;
    const op = ops[Math.floor(Math.random() * ops.length)];

    let a, b, answer;

    switch (diff) {
      case 'easy':
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        break;
      case 'medium':
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 15) + 1;
        break;
      case 'hard':
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * 20) + 1;
        break;
      default:
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
    }

    switch (op) {
      case '+':
        answer = a + b;
        break;
      case '-':
        answer = a - b;
        break;
      case '×':
        answer = a * b;
        break;
      case '÷':
        answer = Math.floor(a / b);
        a = answer * b; // Garante divisão exata
        break;
      default:
        answer = a + b;
    }

    // Gera respostas incorretas
    const wrongAnswers = [
      answer + Math.floor(Math.random() * 5) + 1,
      answer - Math.floor(Math.random() * 5) - 1
    ].filter(n => n !== answer);

    const allAnswers = shuffle([answer, ...wrongAnswers]);

    return {
      question: `${a} ${op} ${b} = ?`,
      correctAnswer: answer,
      allAnswers: allAnswers.slice(0, 3)
    };
  };

  const handleAnswer = (selectedAnswer) => {
    const isCorrect = selectedAnswer === equation.correctAnswer;
    const reactionTime = Date.now() - startTime;

    onAnswer(isCorrect, equation, reactionTime);
    setIsActive(false);
  };

  if (!isActive || !equation) return null;

  return (
    <Html
      center
      distanceFactor={10}
      position={[0, 3, -5]}
      className="math-portal-container"
    >
      <div className="math-portal">
        <div className="math-question">{equation.question}</div>
        <div className="math-answers">
          {equation.allAnswers.map((answer, index) => (
            <button
              key={index}
              className="math-answer-btn"
              onClick={() => handleAnswer(answer)}
            >
              {answer}
            </button>
          ))}
        </div>
      </div>
    </Html>
  );
}

// Função auxiliar para embaralhar array
function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
