"""
Coze API 代理服务器 — 支持流式（SSE）+ 非流式
启动: python3 proxy.py
前端自动连接 http://localhost:9000
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json, urllib.request, urllib.error

COZE_API = 'https://api.coze.cn/open_api/v2/chat'
COZE_PAT = 'pat_PfD2wtUlUTG2cq5wXtC5RgyiOSraRZARKEQYRoJ5MoMO8AyosbLlFi2ZdpMHHWTb'

class ProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)

        # Check if stream mode
        try:
            payload = json.loads(body)
            is_stream = payload.get('stream', False)
        except:
            is_stream = False

        req = urllib.request.Request(
            COZE_API,
            data=body,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {COZE_PAT}'
            },
            method='POST'
        )

        try:
            resp = urllib.request.urlopen(req, timeout=120)

            if is_stream:
                # SSE streaming - pipe through
                self.send_response(200)
                self._cors_headers()
                self.send_header('Content-Type', 'text/event-stream')
                self.send_header('Cache-Control', 'no-cache')
                self.send_header('Connection', 'keep-alive')
                self.end_headers()

                while True:
                    line = resp.readline()
                    if not line:
                        break
                    self.wfile.write(line)
                    self.wfile.flush()
                resp.close()
            else:
                # Non-stream - return full response
                data = resp.read()
                resp.close()
                self.send_response(200)
                self._cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(data)

        except urllib.error.HTTPError as e:
            error_body = e.read().decode()
            self.send_response(e.code)
            self._cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(error_body.encode())
        except Exception as e:
            self.send_response(500)
            self._cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def log_message(self, format, *args):
        print(f"[Proxy] {args[0]}")

if __name__ == '__main__':
    server = HTTPServer(('localhost', 9000), ProxyHandler)
    print('🚀 Coze API 代理已启动: http://localhost:9000')
    print('   支持流式（SSE）+ 非流式模式')
    print('   按 Ctrl+C 停止')
    server.serve_forever()
