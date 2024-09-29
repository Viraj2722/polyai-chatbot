"use client";
import "./globals.css";
import React, { useState, useEffect, useRef } from "react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chat, setChat] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const API_KEY = "AIzaSyAUwWD9LQI11_a5sVta0WaDV8F9bwiac6I";
  const MODEL_NAME = "gemini-1.0-pro-001";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const newChat = await genAI.getGenerativeModel({ model: MODEL_NAME }).startChat({
        generationConfig: {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
        parts: messages.map((msg) => ({
          text: msg.text,
          role: msg.role,
        })),
      });

      setChat(newChat);
    };

    initChat();
  }, [messages]);

  const handleSendMessage = async () => {
    try {
      const userMessage = { text: userInput, role: "user", timestamp: new Date() };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setUserInput("");

      if (chat) {
        const result = await chat.sendMessage(userInput);
        const botMessage = { text: result.response.text(), role: "bot", timestamp: new Date() };

        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error) {
      setError("Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen p-6 bg-gradient-to-r from-orange-300 to-blue-300 dark:from-gray-800 dark:to-gray-900 transition-colors duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
            POLY AI
          </span>
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg bg-opacity-60 backdrop-blur-sm">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"} animate-fade-in-up`}>
            <span className={`inline-block p-3 rounded-lg shadow-md ${msg.role === "user"
              ? "bg-blue-500 text-white transform hover:scale-105 transition-transform duration-300"
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 bg-opacity-80"
              }`}>
              {msg.text}
            </span>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 opacity-70">
              {msg.role === "bot" ? "Bot" : "You"} - {msg.timestamp.toLocaleTimeString()}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && (
        <div className="text-red-500 text-sm mb-4 p-2 bg-red-100 border border-red-300 rounded-md">
          {error}
        </div>
      )}
      <div className="flex items-center mt-6">
        <input
          type="text"
          placeholder="Type your message here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 p-3 rounded-l-lg border-t border-b border-l focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-300 ease-in-out bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        />
        <button
          onClick={handleSendMessage}
          className="p-3 bg-blue-500 text-white rounded-r-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Home;