import React, { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useParams } from 'react-router-dom'; // 라우팅을 통해 방 ID를 전달받는 경우

const ChatRoom = () => {
  const { roomId } = useParams(); // URL에서 roomId 가져오기
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const client = useRef(null);

  useEffect(() => {
    if (!roomId) return; // 방 ID가 없으면 연결하지 않음

    // SockJS를 사용하여 WebSocket 연결
    const socket = new SockJS('http://localhost:8080/ws');
    client.current = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log(`Connected to room: ${roomId}`);

        // 특정 방에 메시지 구독
        client.current.subscribe(`/topic/chat/${roomId}`, (message) => {
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
  }, [roomId]); // roomId가 변경될 때마다 useEffect 실행

  const sendMessage = () => {
    if (client.current && input.trim()) {
      client.current.publish({
        destination: `/app/chat/${roomId}`, // 특정 방에 메시지 발신
        body: JSON.stringify({ content: input }),
      });
      setInput('');
    }
  };

  return (
    <div>
      <h1>Chat Room - {roomId}</h1>
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
