"""Escaneo de una instancia local desechable; requiere ZAP en modo daemon."""
import json
import os
import time
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path

TARGET = os.environ.get('SCAN_TARGET', 'http://127.0.0.1:3000')
ZAP = os.environ.get('ZAP_URL', 'http://127.0.0.1:8090')
REPORT = Path(os.environ.get('SCAN_REPORT_DIR', 'reports/seguridad'))


def api(component, kind, action, **params):
    params['apikey'] = os.environ['ZAP_API_KEY']
    url = f'{ZAP}/JSON/{component}/{kind}/{action}/?{urllib.parse.urlencode(params)}'
    try:
        with urllib.request.urlopen(url, timeout=90) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(error.read().decode()) from None
    if 'code' in result:
        raise RuntimeError(result)
    return result


def request(path, data=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    req = urllib.request.Request(TARGET + path, data=json.dumps(data).encode() if data else None, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)


def run():
    if urllib.parse.urlparse(TARGET).hostname not in ('localhost', '127.0.0.1'):
        raise ValueError('Este ejercicio solo escanea un destino local')
    REPORT.mkdir(parents=True, exist_ok=True)
    summary = {'target': TARGET, 'startedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'roles': []}
    tokens = []
    for role in ['usuario', 'administrador']:
        token = request('/login', {'username': 'zap' + role, 'password': os.environ['SCAN_PASSWORD']})['token']
        tokens.append(token)
        api('core', 'action', 'newSession', name='', overwrite='true')
        if role == 'administrador':
            api('replacer', 'action', 'removeRule', description='Bearer local')
        api('replacer', 'action', 'addRule', description='Bearer local', enabled='true', matchType='REQ_HEADER', matchRegex='false', matchString='Authorization', replacement='Bearer ' + token)
        context = api('context', 'action', 'newContext', contextName='donantes')['contextId']
        api('context', 'action', 'includeInContext', contextName='donantes', regex=TARGET.replace('.', '\\.') + '(/.*)?')
        api('context', 'action', 'setContextInScope', contextName='donantes', booleanInScope='true')
        # Sembrar un registro permite comprobar el borrado autorizado.
        donor = request('/donantes', {'name': 'Persona Prueba', 'email': role + '@example.test'}, token)
        spec = json.loads(Path('openapi.json').read_text(encoding='utf-8'))
        spec['servers'] = [{'url': TARGET}]
        spec['paths']['/donantes/{id}']['delete']['parameters'][0]['schema']['default'] = donor['id']
        spec_path = (REPORT / ('openapi-' + role + '.json')).resolve()
        spec_path.write_text(json.dumps(spec), encoding='utf-8')
        imported = api('openapi', 'action', 'importFile', file=str(spec_path), target=TARGET, contextId=context)
        api('core', 'action', 'accessUrl', url=TARGET + '/', followRedirects='false')
        api('ascan', 'action', 'setOptionThreadPerHost', Integer=2)
        api('ascan', 'action', 'setOptionMaxRuleDurationInMins', Integer=1)
        api('ascan', 'action', 'setOptionMaxScanDurationInMins', Integer=10)
        scan = api('ascan', 'action', 'scan', url=TARGET, recurse='true', inScopeOnly='true', contextId=context)['scan']
        deadline = time.monotonic() + 720
        while time.monotonic() < deadline:
            progress = api('ascan', 'view', 'status', scanId=scan)['status']
            if progress == '100':
                break
            time.sleep(5)
        else:
            raise TimeoutError('Escaneo activo incompleto')
        for _ in range(120):
            if api('pscan', 'view', 'recordsToScan')['recordsToScan'] == '0':
                break
            time.sleep(1)
        else:
            raise TimeoutError('Escaneo pasivo incompleto')
        alerts = api('core', 'view', 'alerts', baseurl=TARGET, start=0, count=10000)
        for extension in ['json', 'html']:
            url = f'{ZAP}/OTHER/core/other/{extension}report/?' + urllib.parse.urlencode({'apikey': os.environ['ZAP_API_KEY']})
            with urllib.request.urlopen(url, timeout=60) as response:
                report = response.read().decode()
            for value in tokens + [os.environ['SCAN_PASSWORD']]:
                report = report.replace(value, '[REDACTED]')
            (REPORT / f'zap-{role}.{extension}').write_text(report, encoding='utf-8')
        summary['roles'].append({'role': role, 'status': progress, 'alerts': len(alerts['alerts']), 'import': imported,
                                 'scan': api('ascan', 'view', 'scanProgress', scanId=scan),
                                 'alertsSummary': api('core', 'view', 'alertsSummary', baseurl=TARGET)})
        print(f'ZAP {role}: finalizado, {len(alerts["alerts"])} instancias de alerta', flush=True)
    summary['finishedAt'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    (REPORT / 'zap-ejecucion.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    run()
