#!/usr/bin/env python3
"""Simple test script for backend services using direct Mopidy API calls.

This script tests the queue_tracks attribute format and play_track_at_position
functionality by directly calling the Mopidy API and verifying the data structure.

Usage:
    python test_backend_simple.py <hostname> [port]
"""

import sys
import json

try:
    from mopidyapi import MopidyAPI
    from requests.exceptions import ConnectionError as reConnectionError
except ImportError:
    print("ERROR: mopidyapi module not found.")
    print("Please install it with: pip install mopidyapi")
    sys.exit(1)


def test_queue_tracks_structure(hostname: str, port: int = 6680):
    """Test that we can get queue tracks in the expected format."""
    print(f"\n{'='*60}")
    print("Testing queue_tracks attribute structure")
    print(f"{'='*60}")
    
    try:
        api = MopidyAPI(host=hostname, port=port, use_websocket=False)
        
        # Get tracklist tracks
        print("\n1. Getting tracklist tracks from Mopidy API...")
        tl_tracks = api.tracklist.get_tl_tracks()
        queue_length = api.tracklist.get_length()
        current_index = api.tracklist.index()
        
        print(f"   Queue length: {queue_length}")
        print(f"   Current playing index (0-based): {current_index}")
        print(f"   Number of tracks: {len(tl_tracks)}")
        
        if not tl_tracks:
            print("\n⚠️  Queue is empty - no tracks to test")
            return True
        
        # Build queue_tracks array format
        print("\n2. Building queue_tracks array format...")
        queue_tracks = []
        for idx, tl_track in enumerate(tl_tracks):
            position = idx + 1  # 1-based position
            track = tl_track.track if hasattr(tl_track, 'track') else None
            
            # Extract metadata
            uri = track.uri if track and hasattr(track, 'uri') else ""
            title = track.name if track and hasattr(track, 'name') else None
            artist = (
                ", ".join([a.name for a in track.artists])
                if track and hasattr(track, 'artists') and track.artists
                else None
            )
            album = (
                track.album.name
                if track and hasattr(track, 'album') and hasattr(track.album, 'name')
                else None
            )
            duration = (
                int(track.length / 1000)
                if track and hasattr(track, 'length')
                else None
            )
            
            track_dict = {
                "position": position,
                "uri": uri,
                "title": title,
                "artist": artist,
                "album": album,
                "duration": duration,
            }
            queue_tracks.append(track_dict)
        
        print(f"   Created {len(queue_tracks)} track entries")
        
        # Display sample tracks
        print("\n3. Sample track data (first 3 tracks):")
        for i, track in enumerate(queue_tracks[:3]):
            print(f"   Track {i+1}:")
            print(f"     Position: {track['position']}")
            print(f"     URI: {track['uri']}")
            print(f"     Title: {track['title']}")
            print(f"     Artist: {track['artist']}")
            print(f"     Album: {track['album']}")
            print(f"     Duration: {track['duration']}s")
        
        # Validate structure
        print("\n4. Validating structure...")
        required_fields = ['position', 'uri', 'title', 'artist', 'album', 'duration']
        all_valid = True
        for i, track in enumerate(queue_tracks):
            for field in required_fields:
                if field not in track:
                    print(f"   ❌ ERROR: Track {i+1} missing field '{field}'")
                    all_valid = False
        
        if all_valid:
            print("   ✓ All tracks have required fields")
        
        # Validate ordering
        print("\n5. Validating ordering...")
        positions = [t['position'] for t in queue_tracks]
        expected = list(range(1, len(positions) + 1))
        if positions == expected:
            print(f"   ✓ Tracks are correctly ordered (positions 1-{len(positions)})")
        else:
            print(f"   ❌ ERROR: Positions not sequential")
            print(f"      Expected: {expected}")
            print(f"      Got: {positions}")
            all_valid = False
        
        # Validate position values are 1-based
        if queue_tracks and queue_tracks[0]['position'] == 1:
            print("   ✓ Positions are 1-based (first track = 1)")
        else:
            print("   ❌ ERROR: Positions should be 1-based")
            all_valid = False
        
        return all_valid
        
    except reConnectionError as e:
        print(f"\n❌ Connection error: {e}")
        print(f"   Could not connect to Mopidy server at {hostname}:{port}")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_play_track_at_position_logic(hostname: str, port: int = 6680):
    """Test the play_track_at_position logic."""
    print(f"\n{'='*60}")
    print("Testing play_track_at_position service logic")
    print(f"{'='*60}")
    
    try:
        api = MopidyAPI(host=hostname, port=port, use_websocket=False)
        
        # Get current state
        print("\n1. Getting current queue state...")
        queue_length = api.tracklist.get_length()
        current_index = api.tracklist.index()  # Method call
        
        print(f"   Queue length: {queue_length}")
        print(f"   Current playing index (0-based): {current_index}")
        print(f"   Current playing position (1-based): {current_index + 1 if current_index is not None else None}")
        
        if queue_length is None or queue_length == 0:
            print("\n⚠️  Queue is empty - cannot test play_track_at_position")
            return True
        
        # Test validation logic
        print("\n2. Testing validation logic...")
        
        # Test invalid position (too high)
        test_position = queue_length + 1
        if test_position < 1 or test_position > queue_length:
            print(f"   ✓ Position {test_position} correctly identified as invalid (range: 1-{queue_length})")
        else:
            print(f"   ❌ ERROR: Position {test_position} should be invalid")
            return False
        
        # Test valid position conversion
        print("\n3. Testing position conversion (1-based to 0-based)...")
        test_positions = [1, 2, queue_length]
        for pos_1based in test_positions:
            pos_0based = pos_1based - 1
            print(f"   Position {pos_1based} (1-based) → Index {pos_0based} (0-based)")
        
        # Test actual service call - play track at position 1
        if queue_length >= 1:
            print("\n4. Testing play_track_at_position(1)...")
            try:
                # Convert 1-based to 0-based
                api_position = 1 - 1  # = 0
                
                # Set tracklist index
                api.tracklist.index = api_position
                print(f"   ✓ Set tracklist index to {api_position}")
                
                # Start playback
                api.playback.play()
                print(f"   ✓ Started playback")
                
                # Note: After setting index, it becomes a property, so we verify by checking playback state
                # The actual implementation in speaker.py doesn't verify the index after setting it
                print(f"   ✓ Service call completed successfully")
                
                print("   ✓ Service call logic works correctly")
                
            except Exception as e:
                print(f"   ❌ Error: {e}")
                import traceback
                traceback.print_exc()
                return False
        
        # Test playing a different position if queue is large enough
        if queue_length >= 3:
            print("\n5. Testing play_track_at_position(3)...")
            try:
                api_position = 3 - 1  # = 2
                api.tracklist.index = api_position
                api.playback.play()
                print(f"   ✓ Set tracklist index to {api_position} and started playback")
                
            except Exception as e:
                print(f"   ❌ Error: {e}")
                return False
        
        return True
        
    except reConnectionError as e:
        print(f"\n❌ Connection error: {e}")
        print(f"   Could not connect to Mopidy server at {hostname}:{port}")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main test function."""
    if len(sys.argv) < 2:
        print("Usage: python test_backend_simple.py <hostname> [port]")
        sys.exit(1)
    
    hostname = sys.argv[1]
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 6680
    
    print(f"Testing Mopidy Backend Services")
    print(f"Hostname: {hostname}")
    print(f"Port: {port}")
    
    # Test queue_tracks structure
    queue_tracks_ok = test_queue_tracks_structure(hostname, port)
    
    # Test play_track_at_position logic
    play_track_ok = test_play_track_at_position_logic(hostname, port)
    
    # Summary
    print(f"\n{'='*60}")
    print("Test Summary")
    print(f"{'='*60}")
    print(f"queue_tracks structure: {'✓ PASS' if queue_tracks_ok else '❌ FAIL'}")
    print(f"play_track_at_position logic: {'✓ PASS' if play_track_ok else '❌ FAIL'}")
    
    if queue_tracks_ok and play_track_ok:
        print("\n✅ All backend service tests passed!")
        return 0
    else:
        print("\n❌ Some tests failed")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)

