#!/usr/bin/env python3
"""Extract shelter summary for pages 243-251"""

import json
with open('backend/data/extracted/shelters_with_icons.json') as f:
    data = json.load(f)

# Get pages 243-251
for page_num in range(243, 252):
    page_key = str(page_num)
    if page_key in data:
        page_data = data[page_key]
        shelters = page_data.get('shelters', [])
        named = [s for s in shelters if 'Shelter' in s.get('name', '') and s.get('name') != 'Unknown']
        print(f'Page {page_num}: {len(named)} shelters')
        for s in named[:5]:
            name = s['name']
            mile = s['mile']
            has_gps = s['lat'] != 0.0 and s['lng'] != 0.0
            gps_status = 'GPS' if has_gps else 'no GPS'
            print(f'  - {name} (mile {mile}) {gps_status}')
        if len(named) > 5:
            print(f'  ... and {len(named)-5} more')
        print()
