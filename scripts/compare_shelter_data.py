#!/usr/bin/env python3
"""Compare our shelter data with tnlandforms.us GPX data"""

import xml.etree.ElementTree as ET
import re

# Parse GPX file
def parse_gpx(filename):
    tree = ET.parse(filename)
    root = tree.getroot()
    
    # GPX namespace
    ns = {'gpx': 'http://www.topografix.com/GPX/1/1'}
    
    shelters = []
    for wpt in root.findall('.//gpx:wpt', ns):
        lat = float(wpt.get('lat'))
        lon = float(wpt.get('lon'))
        name = wpt.find('gpx:name', ns)
        name = name.text if name is not None else 'Unknown'
        
        # Get elevation if available
        ele = wpt.find('gpx:ele', ns)
        elevation = float(ele.text) if ele is not None else None
        
        shelters.append({
            'name': name,
            'lat': lat,
            'lon': lon,
            'elevation': elevation
        })
    
    return shelters

# Parse our shelters.ts file to extract shelter data
def parse_our_shelters(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    # Extract shelter objects using regex
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

# Compare shelter names (fuzzy matching)
def normalize_name(name):
    """Normalize shelter name for comparison"""
    name = name.lower()
    # Remove common suffixes
    name = re.sub(r'\s+(shelter|lean-to|lean to|hut|campsite|camp|site)$', '', name)
    # Remove spaces and special chars
    name = re.sub(r'[^a-z]', '', name)
    return name

def find_matches(our_shelters, their_shelters):
    """Find matching shelters between datasets"""
    matches = []
    unmatched_ours = []
    unmatched_theirs = []
    
    # Create normalized name lookup for their shelters
    their_lookup = {}
    for s in their_shelters:
        norm = normalize_name(s['name'])
        their_lookup[norm] = s
    
    # Match our shelters
    for our in our_shelters:
        norm = normalize_name(our['name'])
        
        # Direct match
        if norm in their_lookup:
            matches.append((our, their_lookup[norm]))
        else:
            # Try fuzzy matching
            matched = False
            for their_norm, their in their_lookup.items():
                # Check if names are similar
                if norm in their_norm or their_norm in norm or \
                   (len(norm) > 5 and len(their_norm) > 5 and 
                    sum(c1 == c2 for c1, c2 in zip(norm, their_norm)) / max(len(norm), len(their_norm)) > 0.7):
                    matches.append((our, their))
                    matched = True
                    break
            
            if not matched:
                unmatched_ours.append(our)
    
    # Find their shelters not in our list
    our_norms = {normalize_name(s['name']) for s in our_shelters}
    for their in their_shelters:
        norm = normalize_name(their['name'])
        if norm not in our_norms:
            unmatched_theirs.append(their)
    
    return matches, unmatched_ours, unmatched_theirs

# Calculate coordinate difference
def coord_diff(lat1, lon1, lat2, lon2):
    """Calculate difference in degrees"""
    return abs(lat1 - lat2), abs(lon1 - lon2)

# Main comparison
def main():
    print("Loading shelter data...")
    their_shelters = parse_gpx('backend/data/tnlandforms_shelters.gpx')
    our_shelters = parse_our_shelters('webapp/src/data/shelters.ts')
    
    print(f"\nDataset sizes:")
    print(f"  tnlandforms.us: {len(their_shelters)} shelters")
    print(f"  Our data: {len(our_shelters)} shelters")
    
    print("\nMatching shelters...")
    matches, unmatched_ours, unmatched_theirs = find_matches(our_shelters, their_shelters)
    
    print(f"\nMatching results:")
    print(f"  Matched: {len(matches)}")
    print(f"  In our data only: {len(unmatched_ours)}")
    print(f"  In tnlandforms only: {len(unmatched_theirs)}")
    
    # Analyze coordinate differences
    print("\n" + "="*70)
    print("COORDINATE COMPARISON")
    print("="*70)
    
    large_diffs = []
    for our, their in matches:
        lat_diff, lon_diff = coord_diff(our['lat'], our['lon'], their['lat'], their['lon'])
        total_diff = max(lat_diff, lon_diff)
        
        if total_diff > 0.01:  # ~1km difference
            large_diffs.append((our, their, lat_diff, lon_diff))
    
    if large_diffs:
        print(f"\n⚠️  LARGE COORDINATE DIFFERENCES (>0.01° ≈ 1km):")
        print(f"   Found {len(large_diffs)} shelters with significant GPS differences\n")
        for our, their, lat_diff, lon_diff in large_diffs[:10]:  # Show first 10
            print(f"   {our['name']}")
            print(f"      Our:    lat={our['lat']:.5f}, lon={our['lon']:.5f}")
            print(f"      Their:  lat={their['lat']:.5f}, lon={their['lon']:.5f}")
            print(f"      Diff:   lat={lat_diff:.5f}°, lon={lon_diff:.5f}°")
            print()
    else:
        print("\n✓ All matched shelters have good coordinate agreement (<0.01°)")
    
    # Show small differences
    small_diffs = []
    for our, their in matches:
        lat_diff, lon_diff = coord_diff(our['lat'], our['lon'], their['lat'], their['lon'])
        total_diff = max(lat_diff, lon_diff)
        if 0.001 < total_diff <= 0.01:  # 100m to 1km
            small_diffs.append((our, their, lat_diff, lon_diff))
    
    if small_diffs:
        print(f"\n📝 MODERATE DIFFERENCES (0.001°-0.01° ≈ 100m-1km): {len(small_diffs)} shelters")
    
    # Perfect matches
    perfect = len([m for m in matches if coord_diff(m[0]['lat'], m[0]['lon'], m[1]['lat'], m[1]['lon'])[0] < 0.001])
    print(f"\n✓ EXCELLENT MATCHES (<0.001° ≈ 100m): {perfect} shelters")
    
    # Show shelters we have that they don't
    if unmatched_ours:
        print("\n" + "="*70)
        print("SHELTERS IN OUR DATA ONLY")
        print("="*70)
        print(f"\n{len(unmatched_ours)} shelters not found in tnlandforms.us:\n")
        for s in unmatched_ours[:20]:  # Show first 20
            print(f"  - {s['name']} (mile {s['mile']}, lat={s['lat']}, lon={s['lon']})")
        if len(unmatched_ours) > 20:
            print(f"  ... and {len(unmatched_ours) - 20} more")
    
    # Show shelters they have that we don't
    if unmatched_theirs:
        print("\n" + "="*70)
        print("SHELTERS IN TNLANDFORMS.US ONLY")
        print("="*70)
        print(f"\n{len(unmatched_theirs)} shelters in tnlandforms.us not in our data:\n")
        for s in unmatched_theirs[:20]:  # Show first 20
            ele = f", elev={s['elevation']:.0f}ft" if s['elevation'] else ""
            print(f"  - {s['name']} (lat={s['lat']:.4f}, lon={s['lon']:.4f}{ele})")
        if len(unmatched_theirs) > 20:
            print(f"  ... and {len(unmatched_theirs) - 20} more")
    
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    print(f"""
Total shelters compared: {len(our_shelters)} ours vs {len(their_shelters)} theirs
Successfully matched: {len(matches)}
Missing from our data: {len(unmatched_theirs)}
Missing from their data: {len(unmatched_ours)}

Coordinate accuracy:
  - Excellent (<100m): {perfect} shelters
  - Moderate (100m-1km): {len(small_diffs)} shelters  
  - Large (>1km): {len(large_diffs)} shelters
""")

if __name__ == '__main__':
    main()
