const sendMessage = () => {
  if (client.current && input.trim()) {
    // 사용자 ID와 닉네임을 포함한 메시지 전송
    const messageData = {
      content: input,
      userId: '12345', // 예시로 고정 ID, 실제로는 상태나 props 등으로 받아올 수 있음
      nickname: 'JohnDoe', // 예시로 고정 닉네임, 상태나 props 등으로 변경 가능
    };

    client.current.publish({
      destination: `/app/chat/${roomId}`, // 발신 경로
      body: JSON.stringify(messageData), // JSON 문자열로 메시지 변환
    });

    setInput(''); // 전송 후 입력 필드 초기화
  }
};
