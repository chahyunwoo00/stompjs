// ChatRoom.js
import React, { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const client = useRef(null);

  useEffect(() => {
    // SockJS를 사용하여 WebSocket 연결
    const socket = new SockJS('http://localhost:8080/ws');
    client.current = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('Connected to WebSocket');

        // 채팅방 메시지 구독
        client.current.subscribe('/topic/chat', (message) => {
          if (message.body) {
            setMessages((prevMessages) => [...prevMessages, JSON.parse(message.body)]);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      },
    });

    client.current.activate();

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (client.current) {
        client.current.deactivate();
      }
    };
  }, []);

  const sendMessage = () => {
    if (client.current && input.trim()) {
      client.current.publish({
        destination: '/app/chat',
        body: JSON.stringify({ content: input }),
      });
      setInput('');
    }
  };

  return (
    <div>
      <h1>Chat Room</h1>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg.content}</div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatRoom;
