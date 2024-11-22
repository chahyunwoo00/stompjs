import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';

const ChatRoom = ({roomId = 15}) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const client = useRef(null);

    useEffect(() => {
        // WebSocket 연결
        const socket = new WebSocket('ws://');

        client.current = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log(`Connected to WebSocket room : ${roomId}`);

                // 특정 채팅방 구독
                client.current.subscribe(`/room/${roomId}`, (message) => {
                    if (message.body) {
                        try {
                            const parsedMessage = JSON.parse(message.body); // JSON 파싱
                            console.log("Received message:", parsedMessage); // 데이터 확인
                            setMessages((prevMessages) => [...prevMessages, parsedMessage]);
                        } catch (error) {
                            console.error("Failed to parse message:", error);
                        }
                    }
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error', frame);
            },
        });

        client.current.activate();

        // 컴포넌트 언마운트 시 WebSocket 연결 해제
        return () => {
            if (client.current) {
                client.current.deactivate();
            }
        };
    }, []);

    // 메시지 전송
    const sendMessage = () => {
        if (client.current && input.trim()) {
            console.log("Sending message:", {
                content: input,
                senderSub: "114766818371555202547", // 전송자 정보
                chatRoomId: roomId,
            });

            client.current.publish({
                destination: `/send/chat/${roomId}`, // 메시지 전송 경로
                body: JSON.stringify({
                    content: input,
                    senderSub: "114766818371555202547", // 전송자 식별 정보 (예: 사용자 ID)
                    chatRoomId: roomId,
                }),
            });

            setInput(''); // 입력값 초기화
        }
    };

    return (
        <div>
            <h1>Chat Room - {roomId}</h1>
            <div
                style={{
                    border: '1px solid black',
                    padding: '10px',
                    height: '300px',
                    overflowY: 'scroll',
                }}
            >
                {/* 메시지 렌더링 */}
                {messages.map((msg, index) => (
                    <p key={index}>
                        <strong>{msg.nickname || 'Unknown'}:</strong> {msg.content}
                    </p>
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
