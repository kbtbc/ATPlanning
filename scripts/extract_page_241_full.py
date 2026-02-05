#!/usr/bin/env python3
"""Extract complete shelter data for Page 241 - NC/TN Smokies"""

import json

with open('backend/data/extracted/shelters_with_icons.json', 'r') as f:
    data = json.load(f)

page_241 = data.get('241', {})
shelters = page_241.get('shelters', [])

# Filter to actual named shelters
named_shelters = [s for s in shelters if 'Shelter' in s.get('name', '') and s.get('name') != 'Unknown']

print(f'=== PAGE 241 NC/TN SMOKIES - {len(named_shelters)} SHELTERS ===')
print()

for i, s in enumerate(named_shelters, 1):
    name = s['name']
    mile = s['mile']
    sobo = s['sobo_mile']
    elev = s['elevation']
    lat = s['lat']
    lng = s['lng']
    
    amenities = s.get('amenities', {})
    icons = amenities.get('icon_codes', [])
    raw = s.get('raw_text', '')
    
    # Extract description from raw text (after name)
    lines = raw.split('\n')
    description = ''
    for j, line in enumerate(lines):
        if name in line:
            # Get next few lines for description
            desc_lines = []
            for k in range(j+1, min(j+4, len(lines))):
                if lines[k].strip() and not lines[k].startswith('s['):
                    desc_lines.append(lines[k].strip())
            description = ' '.join(desc_lines)[:200]
            break
    
    print(f'{i}. {name}')
    print(f'   NOBO Mile: {mile}, SOBO Mile: {sobo}')
    print(f'   Elevation: {elev} ft')
    if lat and lng:
        print(f'   GPS: lat: {lat}, lng: {lng}')
    print(f'   Icons: {icons}')
    
    # Decode icons
    icon_meanings = []
    if 'w' in icons: icon_meanings.append('water')
    if 'w+' in icons or '+' in icons: icon_meanings.append('water unreliable')
    if 't' in icons: icon_meanings.append('tenting')
    if 'p' in icons: icon_meanings.append('privy')
    if 'J' in icons: icon_meanings.append('bear cables')
    if 'B' in icons: icon_meanings.append('bear boxes')
    if 'S' in icons: icon_meanings.append('showers')
    if 'R' in icons: icon_meanings.append('restroom')
    if 'E' in icons: icon_meanings.append('views E')
    if 'W' in icons: icon_meanings.append('views W')
    if 'v' in icons: icon_meanings.append('views')
    if 'h' in icons: icon_meanings.append('hammock')
    if 'Q' in icons or 'Z' in icons: icon_meanings.append('caution')
    print(f'   Amenities: {", ".join(icon_meanings)}')
    
    if description:
        print(f'   Description: {description}...')
    print()

# Summary for comparison with existing shelters.ts
print('=== SUMMARY FOR MATCHING ===')
for s in named_shelters:
    name = s['name']
    mile = s['mile']
    print(f'{name} - mile {mile}')
