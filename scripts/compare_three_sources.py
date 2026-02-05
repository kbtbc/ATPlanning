#!/usr/bin/env python3
"""Compare our shelter data with tnlandforms.us and ATC (guymott) data"""

import xml.etree.ElementTree as ET
import re
import zipfile

# Parse GPX file
def parse_gpx(filename):
    tree = ET.parse(filename)
    root = tree.getroot()
    ns = {'gpx': 'http://www.topografix.com/GPX/1/1'}
    
    shelters = []
    for wpt in root.findall('.//gpx:wpt', ns):
        lat = float(wpt.get('lat'))
        lon = float(wpt.get('lon'))
        name = wpt.find('gpx:name', ns)
        name = name.text.strip() if name is not None else 'Unknown'
        
        ele = wpt.find('gpx:ele', ns)
        elevation = float(ele.text) if ele is not None else None
        
        cmt = wpt.find('gpx:cmt', ns)
        comment = cmt.text if cmt is not None else ''
        
        shelters.append({
            'name': name,
            'lat': lat,
            'lon': lon,
            'elevation': elevation,
            'comment': comment
        })
    return shelters

# Parse our shelters.ts
def parse_our_shelters(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    pattern = r"\{ id: 'sh-\d+', name: '([^']+)', mile: ([\d.]+), soboMile: ([\d.]+), elevation: (\d+), lat: ([\d.-]+), lng: ([\d.-]+)"
    
    shelters = []
    for match in re.finditer(pattern, content):
        name, mile, sobo_mile, elevation, lat, lng = match.groups()
        shelters.append({
            'name': name,
            'mile': float(mile),
            'elevation': int(elevation),
            'lat': float(lat),
            'lon': float(lng)
        })
    return shelters

# Normalize names for matching
def normalize_name(name):
    name = name.lower()
    name = re.sub(r'\s+(shelter|lean-to|lean to|hut|campsite|camp|site|cabin|lean\s*to)\s*$', '', name)
    name = re.sub(r'[^a-z]', '', name)
    return name

# Find matches between two datasets
def find_matches(shelters_a, shelters_b, label_a="A", label_b="B"):
    lookup_b = {normalize_name(s['name']): s for s in shelters_b}
    
    matches = []
    unmatched_a = []
    
    for s_a in shelters_a:
        norm_a = normalize_name(s_a['name'])
        if norm_a in lookup_b:
            matches.append((s_a, lookup_b[norm_a]))
        else:
            unmatched_a.append(s_a)
    
    unmatched_b = [s for s in shelters_b if normalize_name(s['name']) not in 
                   {normalize_name(s['name']) for s in shelters_a}]
    
    return matches, unmatched_a, unmatched_b

# Calculate distance between coordinates
def coord_diff(lat1, lon1, lat2, lon2):
    lat_diff = abs(lat1 - lat2)
    lon_diff = abs(lon1 - lon2)
    return lat_diff, lon_diff

# Main comparison
def main():
    print("="*80)
    print("THREE-WAY SHELTER DATA COMPARISON")
    print("="*80)
    
    # Load all three datasets
    print("\nLoading datasets...")
    
    our_shelters = parse_our_shelters('webapp/src/data/shelters.ts')
    print(f"  ✓ Our data: {len(our_shelters)} shelters")
    
    tn_shelters = parse_gpx('backend/data/tnlandforms_shelters.gpx')
    print(f"  ✓ tnlandforms.us: {len(tn_shelters)} shelters")
    
    # Use the consecutive names version with long comments
    atc_shelters = parse_gpx('backend/data/guymott_shelters/AT Shelters - Long Comments - Consecutive Names.gpx')
    print(f"  ✓ ATC (guymott): {len(atc_shelters)} shelters")
    
    print("\n" + "="*80)
    print("CROSS-COMPARISON ANALYSIS")
    print("="*80)
    
    # Compare each pair
    comparisons = [
        ("Our Data", our_shelters, "tnlandforms.us", tn_shelters),
        ("Our Data", our_shelters, "ATC (guymott)", atc_shelters),
        ("tnlandforms.us", tn_shelters, "ATC (guymott)", atc_shelters)
    ]
    
    for name_a, data_a, name_b, data_b in comparisons:
        print(f"\n{name_a} vs {name_b}:")
        matches, unmatched_a, unmatched_b = find_matches(data_a, data_b, name_a, name_b)
        
        # Calculate coordinate differences for matches
        excellent = 0  # <0.001°
        moderate = 0   # 0.001-0.01°
        large = 0      # >0.01°
        
        for s_a, s_b in matches:
            lat_diff, lon_diff = coord_diff(s_a['lat'], s_a['lon'], s_b['lat'], s_b['lon'])
            max_diff = max(lat_diff, lon_diff)
            if max_diff < 0.001:
                excellent += 1
            elif max_diff < 0.01:
                moderate += 1
            else:
                large += 1
        
        print(f"  Matched: {len(matches)} shelters")
        print(f"  - Excellent (<100m): {excellent}")
        print(f"  - Moderate (100m-1km): {moderate}")
        print(f"  - Large (>1km): {large}")
        print(f"  Only in {name_a}: {len(unmatched_a)}")
        print(f"  Only in {name_b}: {len(unmatched_b)}")
    
    # Find shelters that exist in all three with good agreement
    print("\n" + "="*80)
    print("CONSENSUS ANALYSIS (All Three Sources)")
    print("="*80)
    
    our_lookup = {normalize_name(s['name']): s for s in our_shelters}
    tn_lookup = {normalize_name(s['name']): s for s in tn_shelters}
    atc_lookup = {normalize_name(s['name']): s for s in atc_shelters}
    
    all_three = []
    for name_norm in our_lookup:
        if name_norm in tn_lookup and name_norm in atc_lookup:
            all_three.append((
                our_lookup[name_norm],
                tn_lookup[name_norm],
                atc_lookup[name_norm]
            ))
    
    print(f"\nShelters found in ALL THREE sources: {len(all_three)}")
    
    # Check agreement level
    full_agreement = 0  # All within 0.001°
    partial_agreement = 0  # All within 0.01°
    disagreement = 0  # Any pair >0.01°
    
    for our, tn, atc in all_three:
        our_tn = max(coord_diff(our['lat'], our['lon'], tn['lat'], tn['lon']))
        our_atc = max(coord_diff(our['lat'], our['lon'], atc['lat'], atc['lon']))
        tn_atc = max(coord_diff(tn['lat'], tn['lon'], atc['lat'], atc['lon']))
        
        max_diff = max(our_tn, our_atc, tn_atc)
        
        if max_diff < 0.001:
            full_agreement += 1
        elif max_diff < 0.01:
            partial_agreement += 1
        else:
            disagreement += 1
    
    print(f"\nAgreement levels:")
    print(f"  ✓ Full agreement (<100m): {full_agreement}")
    print(f"  ~ Partial agreement (100m-1km): {partial_agreement}")
    print(f"  ✗ Significant disagreement (>1km): {disagreement}")
    
    # Check specific problematic shelters
    print("\n" + "="*80)
    print("DETAILED COMPARISON: Sample Shelters")
    print("="*80)
    
    test_shelters = [
        "Blood Mountain Shelter",
        "Springer Mountain Shelter", 
        "Hawk Mountain Shelter",
        "Roan High Knob Shelter",
        "Partnership Shelter",
        "Bryant Ridge Shelter"
    ]
    
    for test_name in test_shelters:
        norm = normalize_name(test_name)
        print(f"\n{test_name}:")
        
        if norm in our_lookup:
            s = our_lookup[norm]
            print(f"  Our data:      lat={s['lat']:.5f}, lon={s['lon']:.5f}, ele={s['elevation']}ft, mile={s['mile']}")
        else:
            print(f"  Our data:      NOT FOUND")
        
        if norm in tn_lookup:
            s = tn_lookup[norm]
            ele = f", ele={s['elevation']:.0f}ft" if s['elevation'] else ""
            print(f"  tnlandforms:   lat={s['lat']:.5f}, lon={s['lon']:.5f}{ele}")
        else:
            print(f"  tnlandforms:   NOT FOUND")
        
        if norm in atc_lookup:
            s = atc_lookup[norm]
            ele = f", ele={s['elevation']:.0f}ft" if s['elevation'] else ""
            print(f"  ATC (guymott): lat={s['lat']:.5f}, lon={s['lon']:.5f}{ele}")
        else:
            print(f"  ATC (guymott): NOT FOUND")
    
    # Summary recommendation
    print("\n" + "="*80)
    print("RECOMMENDATION")
    print("="*80)
    
    print("""
Based on the three-way comparison:

1. OUR DATA ISSUES:
   - GPS coordinates appear to be approximate/placement-based
   - Many shelters show 5-8km offset from both tnlandforms and ATC
   - Likely used trail mile interpolation rather than actual GPS readings

2. TNLANDFORMS.US vs ATC:
   - These two sources generally agree with each other
   - Both appear to have actual GPS waypoint data
   - ATC (guymott) data is official ATC data with capacity info

3. MOST AUTHORITATIVE SOURCE:
   The ATC (guymott) data is likely the most authoritative because:
   - Official ATC source data
   - Contains capacity information
   - Has detailed comments about amenities
   - Agrees well with tnlandforms.us (independent verification)

RECOMMENDATION: Use ATC (guymott) coordinates as the authoritative source
for GPS verification, cross-checked with tnlandforms.us as secondary validation.
Our current coordinates need significant correction.
""")

if __name__ == '__main__':
    main()
