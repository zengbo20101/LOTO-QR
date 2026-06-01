const http = require('http');

const API_BASE = 'http://localhost:3000/api';

// 测试函数 - POST请求
function postRequest(path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const jsonData = JSON.stringify(data);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonData)
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    req.write(jsonData);
    req.end();
  });
}

// 测试流程
async function runTests() {
  console.log('=== 开始测试 LOTO 认证功能 ===\n');
  
  try {
    // 1. 测试注册新用户
    console.log('1. 测试注册新用户 (finaltestuser, 13822223333)...');
    const registerResult = await postRequest('/auth/register', {
      username: 'finaltestuser',
      phone: '13822223333'
    });
    console.log('注册结果:', registerResult);
    console.log('');
    
    // 2. 测试重复注册相同用户名
    console.log('2. 测试重复注册相同用户名...');
    const duplicateUsernameResult = await postRequest('/auth/register', {
      username: 'finaltestuser',
      phone: '13822224444'
    });
    console.log('结果:', duplicateUsernameResult);
    console.log('');
    
    // 3. 测试重复注册相同电话
    console.log('3. 测试重复注册相同电话...');
    const duplicatePhoneResult = await postRequest('/auth/register', {
      username: 'finalanotheruser',
      phone: '13822223333'
    });
    console.log('结果:', duplicatePhoneResult);
    console.log('');
    
    // 4. 测试使用用户名登录
    console.log('4. 测试使用用户名登录...');
    const loginUsernameResult = await postRequest('/auth/login', {
      identifier: 'finaltestuser'
    });
    console.log('登录结果:', loginUsernameResult);
    console.log('');
    
    // 5. 测试使用电话登录
    console.log('5. 测试使用电话登录...');
    const loginPhoneResult = await postRequest('/auth/login', {
      identifier: '13822223333'
    });
    console.log('登录结果:', loginPhoneResult);
    console.log('');
    
    // 6. 测试使用admin用户登录
    console.log('6. 测试使用admin用户登录...');
    const adminLoginResult = await postRequest('/auth/login', {
      identifier: 'admin'
    });
    console.log('登录结果:', adminLoginResult);
    console.log('');
    
    console.log('=== 所有测试完成 ===');
    
  } catch (error) {
    console.error('测试出错:', error.message);
  }
}

// 等待服务器启动后运行测试
setTimeout(runTests, 1500);
