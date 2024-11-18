import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const client = useRef(null);

  useEffect(() => {
    // WebSocket을 사용하여 직접 연결
    const socket = new WebSocket('ws://');
    
    client.current = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('Connected to WebSocket');

        client.current.subscribe('/room/chatroom/1', (message) => {
          if (message) {
            setMessages((prevMessages) => [...prevMessages, JSON.parse(message)]);
            console.log(message)
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
        destination: `/app/chat/1`, // 특정 방에 메시지 발신
        body: JSON.stringify({ content: input }),
      });
      setInput('');
    }
  };

  return (
    <div>
      <p>{messages}</p>
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
