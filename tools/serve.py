"""Serve the website with clean routes; no packages or build step required."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

WEB = Path(__file__).resolve().parents[1] / 'web'

class Handler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = urlsplit(self.path).path
        if path == '/dealing-prototype.html':
            self.send_response(301)
            self.send_header('Location', '/')
            self.end_headers()
            return None
        if not Path(self.translate_path(path)).is_file():
            if path.startswith(('/scripts/', '/styles/', '/fonts/')):
                self.send_error(404)
                return None
            self.path = '/index.html'
        return super().send_head()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--bind', default='127.0.0.1')
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.bind, args.port), partial(Handler, directory=str(WEB)))
    print(f'Pocket Poker: http://{args.bind}:{args.port}/', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
