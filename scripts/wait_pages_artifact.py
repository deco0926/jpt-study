"""Wait for the exact Pages upload to become visible before deployment."""
import json
import os
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def main():
    repository = os.environ['GITHUB_REPOSITORY']
    run_id = os.environ['GITHUB_RUN_ID']
    expected_name = os.environ['PAGES_ARTIFACT_NAME']
    expected_id = int(os.environ['PAGES_ARTIFACT_ID'])
    url = f'https://api.github.com/repos/{repository}/actions/runs/{run_id}/artifacts?per_page=100'
    request = Request(url, headers={
        'Authorization': 'Bearer ' + os.environ['GH_TOKEN'],
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
    })
    stable = 0
    for attempt in range(20):
        try:
            with urlopen(request, timeout=15) as response:
                artifacts = json.load(response)['artifacts']
            matches = [a for a in artifacts if a['name'] == expected_name and not a['expired']]
            if len(matches) > 1:
                raise RuntimeError('The unique Pages artifact name has multiple matches.')
            stable = stable + 1 if len(matches) == 1 and matches[0]['id'] == expected_id else 0
            if stable >= 2:
                print(f'Pages artifact {expected_name} is ready.', flush=True)
                return
        except HTTPError as error:
            if error.code in (401, 403):
                raise RuntimeError('Unable to read workflow artifacts; check actions:read permission.') from error
            stable = 0
        except (URLError, TimeoutError):
            stable = 0
        print(f'Waiting for Pages artifact registration ({attempt + 1}/20).', flush=True)
        time.sleep(3)
    raise RuntimeError('The uploaded Pages artifact did not become visible in time.')


if __name__ == '__main__':
    main()
