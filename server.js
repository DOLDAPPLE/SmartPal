const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const app = express();
const PORT = 5500;

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/generate', (req, res) => {
  const { prompt } = req.body;

  // 直接 spawn 调用，不加任何参数
  const ollama = spawn('ollama', ['run', 'qwen2.5:3b']);

  let output = '';
  let errorOutput = '';

  // 发送 prompt 给 stdin
  ollama.stdin.write(prompt + '\n');
  ollama.stdin.end();

  // 接收 stdout
  ollama.stdout.on('data', (data) => {
    output += data.toString();
  });

  // 接收 stderr
  ollama.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.error('Ollama stderr:', data.toString());
  });

  // Ollama 结束
  ollama.on('close', () => {
    if (errorOutput) {
      res.json({ text: output.trim(), error: errorOutput.trim() });
    } else {
      res.json({ text: output.trim() });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Local Ollama API server running at http://localhost:5500`);
});