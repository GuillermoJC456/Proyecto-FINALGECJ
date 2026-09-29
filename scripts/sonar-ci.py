"""Configura un SonarQube desechable y exporta los resultados de CI."""
import base64
import json
import os
import secrets
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

BASE = os.environ.get('SONAR_HOST_URL', 'http://127.0.0.1:9000')


def api(path, params=None, post=False, credential=None):
    encoded = urllib.parse.urlencode(params or {}).encode()
    url = BASE + '/api/' + path + (('?' + encoded.decode()) if encoded and not post else '')
    auth = credential or os.environ['SONAR_TOKEN'] + ':'
    headers = {'Authorization': 'Basic ' + base64.b64encode(auth.encode()).decode()}
    request = urllib.request.Request(url, data=encoded if post else None, headers=headers)
    with urllib.request.urlopen(request, timeout=60) as response:
        body = response.read().decode()
        return json.loads(body) if body else {}


def setup():
    for _ in range(120):
        try:
            if api('system/status', credential='admin:admin').get('status') == 'UP':
                break
        except (OSError, ValueError):
            pass
        time.sleep(3)
    else:
        raise TimeoutError('SonarQube no arrancó')
    password = secrets.token_urlsafe(32)
    api('users/change_password', {'login': 'admin', 'previousPassword': 'admin', 'password': password}, True, 'admin:admin')
    token = api('user_tokens/generate', {'name': 'ci-donantes'}, True, 'admin:' + password)['token']
    os.environ['SONAR_TOKEN'] = token
    print('::add-mask::' + token)
    with open(os.environ['GITHUB_ENV'], 'a', encoding='utf-8') as env:
        env.write('SONAR_TOKEN=' + token + '\n')
    api('projects/create', {'project': 'registro-donantes', 'name': 'Registro de donantes'}, True)


def export():
    report = Path('reports/sonarqube')
    report.mkdir(parents=True, exist_ok=True)
    for filename, endpoint, params in [
        ('metrics.json', 'measures/component', {'component': 'registro-donantes', 'metricKeys': 'coverage,line_coverage,branch_coverage,bugs,vulnerabilities,code_smells,sqale_index,duplicated_lines_density,security_hotspots,ncloc'}),
        ('quality-gate.json', 'qualitygates/project_status', {'projectKey': 'registro-donantes'}),
        ('issues.json', 'issues/search', {'componentKeys': 'registro-donantes', 'ps': 500}),
        ('hotspots.json', 'hotspots/search', {'projectKey': 'registro-donantes', 'ps': 500})
    ]:
        (report / filename).write_text(json.dumps(api(endpoint, params), ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    {'setup': setup, 'export': export}[sys.argv[1]]()
