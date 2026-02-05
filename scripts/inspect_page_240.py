#!/usr/bin/env python3
"""Inspect Page 240 GA shelters from extraction"""

import json

with open('backend/data/extracted/shelters_with_icons.json', 'r') as f:
    data = json.load(f)
    
page_240 = data.get('240', {})
shelters = page_240.get('shelters', [])

print('=== PAGE 240 GEORGIA SHELTERS ===')
print(f'Total extracted: {len(shelters)}')
print()

for i, s in enumerate(shelters[:15]):
    if s['name'] != 'Unknown' and 'Shelter' in s['name']:
        amenities = s.get('amenities', {})
        icons = amenities.get('icon_codes', [])
        name = s['name']
        mile = s['mile']
        elev = s['elevation']
        lat = s['lat']
        lng = s['lng']
        print(f'{i+1}. {name}')
        print(f'   Mile: {mile}, Elevation: {elev}')
        print(f'   GPS: [{lat}, {lng}]')
        print(f'   Icons: {icons}')
        has_water = amenities.get('has_water', False)
        is_tenting = amenities.get('is_tenting', False)
        has_privy = amenities.get('has_privy', False)
        has_bear_cables = amenities.get('has_bear_cables', False)
        has_bear_boxes = amenities.get('has_bear_boxes', False)
        print(f'   Water: {has_water}, Tenting: {is_tenting}, Privy: {has_privy}')
        print(f'   Bear cables: {has_bear_cables}, Bear boxes: {has_bear_boxes}')
        print()
