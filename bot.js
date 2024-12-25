const WebSocket = require('ws');
const axios = require('axios');
require('dotenv').config();

const MISSKEY_API_URL = process.env.MISSKEY_API_URL;
const API_TOKEN = process.env.MISSKEY_TOKEN;
const ROLE_ID = process.env.MISSKEY_ROLE_ID;
const PING_INTERVAL = 30000; // 30초마다 ping
const RECONNECT_DELAY = 5000; // 재연결 시도 간격 5초

let ws;
let pingInterval;
let isConnected = false;

const api = axios.create({
  baseURL: MISSKEY_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

function connect() {
  ws = new WebSocket(`${MISSKEY_API_URL}/streaming?i=${API_TOKEN}`);

  ws.on('open', () => {
    console.log('Connected to Misskey WebSocket');
    isConnected = true;
    
    ws.send(JSON.stringify({
      type: 'connect',
      body: {
        channel: 'main',
        id: 'main',
        params: {},
      },
    }));

    // Ping 간격 설정
    clearInterval(pingInterval);
    pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, PING_INTERVAL);
  });

  ws.on('message', async (data) => {
    const event = JSON.parse(data);

    if (event.type === 'channel' && event.body.type === 'mention') {
      const note = event.body.body;
      if (note.user.isBot) {
        console.log('Skipping bot message.');
        return;
      }
      console.log('Mention event received:', note);

      const userId = note.userId;
      const visibility = note.visibility;
      const username = note.user.username;
      const isRemoteUser = !!note.user.host;
      const fullUsername = isRemoteUser ? `${username}@${note.user.host}` : username;

      try {
        if (isRemoteUser) {
          console.log('Skipping remote user message from:', note.user.host);
          await reply(note.id, `@${fullUsername} 죄송해요! 이 봇은 로컬 사용자만 지원합니다.`, visibility, note.localOnly);
          return;
        }
        if (note.text?.includes('부여')) {
          console.log('Attempting to assign role to user:', userId);
          const success = await assignRole(userId);
          console.log('Role assignment result:', success);
          await reply(note.id, `@${fullUsername} ${success ? '역할이 성공적으로 부여되었습니다. 미스키를 새로고침해보세요!' : '역할 부여 중 오류가 발생했습니다. 이미 역할이 부여되신 것은 아닌지 확인해 보세요.'}`, visibility, note.localOnly);
        } else if (note.text?.includes('해제')) {
          console.log('Attempting to unassign role from user:', userId);
          const success = await unassignRole(userId);
          console.log('Role unassignment result:', success);
          await reply(note.id, `@${fullUsername} ${success ? '역할이 성공적으로 해제되었습니다. 미스키를 새로고침해보세요!' : '역할 해제 중 오류가 발생했습니다 이미 역할이 해제되신 것은 아닌지 확인해 보세요.'}`, visibility, note.localOnly);
        } else {
          await reply(note.id, `@${fullUsername} 반가워요! 저는 자동으로 역할을 부여하는 봇이에요.

**[사용 방법]**
'부여' 라고 멘션하시면 역할을 부여해드립니다.
'해제' 라고 멘션하시면 부여된 역할을 해제해 드립니다.
참고로 DM으로 하셔도 OK입니다!`, visibility, note.localOnly);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        await reply(note.id, `@${fullUsername} 처리 중 오류가 발생했습니다.`, visibility, note.localOnly);
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket Error:', error);
  });

  ws.on('close', () => {
    console.log('WebSocket closed. Attempting to reconnect...');
    isConnected = false;
    clearInterval(pingInterval);
    setTimeout(connect, RECONNECT_DELAY);
  });

  ws.on('pong', () => {
    console.log('Received pong from server');
  });
}

// 나머지 함수들은 동일...
async function reply(noteId, message, visibility, localOnly) {
  try {
    const response = await api.post('/notes/create', {
      i: API_TOKEN,
      replyId: noteId,
      text: message,
      visibility: visibility,
      localOnly: localOnly
    });
    console.log(`Replied successfully: ${message}`);
    return response.data;
  } catch (error) {
    console.error('Error sending reply:', error.response?.data || error.message);
    if (error.response?.data?.error?.code === 'CANNOT_REPLY_TO_SPECIFIED_VISIBILITY_NOTE_WITH_EXTENDED_VISIBILITY') {
      try {
        const response = await api.post('/notes/create', {
          i: API_TOKEN,
          replyId: noteId,
          text: message,
          visibility: 'public',
          localOnly: localOnly
        });
        console.log(`Replied successfully with public visibility: ${message}`);
        return response.data;
      } catch (retryError) {
        console.error('Error sending retry reply:', retryError.response?.data || retryError.message);
      }
    }
  }
}

async function assignRole(userId) {
  try {
    console.log('Starting role assignment process for user:', userId);
    
    const userCheck = await api.post('/users/show', {
      i: API_TOKEN,
      userId: userId
    });
    console.log('User check successful:', userCheck.data.id);

    const response = await api.post('/admin/roles/assign', {
      i: API_TOKEN,
      roleId: ROLE_ID,
      userId: userId,
      expiresAt: null
    });
    
    console.log('Role assignment API response:', response.data);
    return true;
  } catch (error) {
    console.error('Detailed error in assignRole:', {
      error: error.response?.data || error.message,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return false;
  }
}

async function unassignRole(userId) {
  try {
    console.log('Starting role unassignment process for user:', userId);
    
    const userCheck = await api.post('/users/show', {
      i: API_TOKEN,
      userId: userId
    });
    console.log('User check successful:', userCheck.data.id);

    const response = await api.post('/admin/roles/unassign', {
      i: API_TOKEN,
      roleId: ROLE_ID,
      userId: userId
    });
    
    console.log('Role unassignment API response:', response.data);
    return true;
  } catch (error) {
    console.error('Detailed error in unassignRole:', {
      error: error.response?.data || error.message,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return false;
  }
}

// 초기 연결 시작
connect();
