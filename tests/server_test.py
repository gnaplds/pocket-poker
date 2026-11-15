import importlib.util
import threading
import unittest
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.request import urlopen, build_opener, HTTPRedirectHandler
from urllib.error import HTTPError

spec = importlib.util.spec_from_file_location('serve', Path(__file__).resolve().parents[1] / 'tools/serve.py')
serve = importlib.util.module_from_spec(spec)
spec.loader.exec_module(serve)

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None

class ServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), partial(serve.Handler, directory=str(serve.WEB)))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f'http://127.0.0.1:{cls.server.server_port}'

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def test_routes_and_unknown_paths_load_entry(self):
        for route in ['/', '/new-game', '/play', '/study', '/simulation/', '/equity', '/unknown']:
            with self.subTest(route=route), urlopen(self.url + route) as response:
                self.assertEqual(response.status, 200)
                self.assertIn(b'/scripts/routes.js', response.read())

    def test_assets_and_missing_assets(self):
        with urlopen(self.url + '/scripts/equity-worker.js') as response:
            self.assertIn(b'importScripts', response.read())
        for folder in ['scripts', 'styles', 'fonts']:
            with self.assertRaises(HTTPError) as error:
                urlopen(self.url + f'/{folder}/missing-file')
            self.assertEqual(error.exception.code, 404)
            error.exception.close()
        with urlopen(self.url + '/fonts/InterVariable.woff2') as response:
            self.assertGreater(len(response.read()), 1000)

    def test_legacy_entry_redirect(self):
        with self.assertRaises(HTTPError) as error:
            build_opener(NoRedirect()).open(self.url + '/dealing-prototype.html')
        self.assertEqual(error.exception.code, 301)
        self.assertEqual(error.exception.headers['Location'], '/')
        error.exception.close()

if __name__ == '__main__':
    unittest.main()
