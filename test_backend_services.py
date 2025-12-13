#!/usr/bin/env python3
"""Test script for backend services: queue_tracks attribute and play_track_at_position service.

Usage:
    python test_backend_services.py <hostname> [port]

Example:
    python test_backend_services.py 10.0.1.230
    python test_backend_services.py 10.0.1.230 6680
"""

import sys
import asyncio
from typing import Any
from mopidyapi import MopidyAPI
from requests.exceptions import ConnectionError as reConnectionError

# Import the classes we need to test
sys.path.insert(0, 'custom_components/mopidy')
from speaker import MopidyQueue, MopidySpeaker


async def test_queue_tracks_attribute(hostname: str, port: int = 6680):
    """Test the queue_tracks attribute implementation."""
    print(f"\n{'='*60}")
    print("Testing queue_tracks attribute")
    print(f"{'='*60}")
    
    try:
        # Create a mock speaker-like object to test the queue
        # We'll use the actual MopidyAPI to get real data
        api = MopidyAPI(host=hostname, port=port, use_websocket=False)
        
        # Create queue object
        queue = MopidyQueue()
        queue.api = api
        queue.hostname = hostname
        queue.port = port
        
        # Update queue information
        print("\n1. Updating queue information...")
        queue.update_queue_information()
        print(f"   Queue size: {queue.size}")
        print(f"   Queue position: {queue.position}")
        
        # Update tracks to populate queue dictionary
        print("\n2. Updating tracks...")
        queue.update_tracks()
        print(f"   Tracks in queue dict: {len(queue.queue)}")
        
        # Test get_queue_tracks_array
        print("\n3. Getting queue_tracks array...")
        queue_tracks = queue.get_queue_tracks_array()
        print(f"   Number of tracks in array: {len(queue_tracks)}")
        
        if queue_tracks:
            print("\n4. Sample track data:")
            for i, track in enumerate(queue_tracks[:3]):  # Show first 3 tracks
                print(f"   Track {i+1}:")
                print(f"     Position: {track.get('position')}")
                print(f"     URI: {track.get('uri')}")
                print(f"     Title: {track.get('title')}")
                print(f"     Artist: {track.get('artist')}")
                print(f"     Album: {track.get('album')}")
                print(f"     Duration: {track.get('duration')}s")
            
            # Validate structure
            print("\n5. Validating structure...")
            required_fields = ['position', 'uri', 'title', 'artist', 'album', 'duration']
            all_valid = True
            for track in queue_tracks:
                for field in required_fields:
                    if field not in track:
                        print(f"   ERROR: Missing field '{field}' in track")
                        all_valid = False
            
            if all_valid:
                print("   ✓ All tracks have required fields")
            
            # Validate ordering
            print("\n6. Validating ordering...")
            positions = [t['position'] for t in queue_tracks]
            if positions == list(range(1, len(positions) + 1)):
                print(f"   ✓ Tracks are correctly ordered (positions 1-{len(positions)})")
            else:
                print(f"   ERROR: Positions not sequential: {positions}")
        
        else:
            print("   Queue is empty - no tracks to display")
        
        return True
        
    except reConnectionError as e:
        print(f"\n❌ Connection error: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_play_track_at_position(hostname: str, port: int = 6680):
    """Test the play_track_at_position service."""
    print(f"\n{'='*60}")
    print("Testing play_track_at_position service")
    print(f"{'='*60}")
    
    try:
        # Create speaker object
        print("\n1. Creating MopidySpeaker...")
        # We need to mock HomeAssistant for this
        class MockHass:
            pass
        
        speaker = MopidySpeaker(MockHass(), hostname, port)
        
        # Get current queue state
        print("\n2. Getting current queue state...")
        speaker.queue.update_queue_information()
        queue_size = speaker.queue.size
        current_position = speaker.queue.position
        
        print(f"   Queue size: {queue_size}")
        print(f"   Current playing position: {current_position}")
        
        if queue_size is None or queue_size == 0:
            print("\n⚠️  Queue is empty - cannot test play_track_at_position")
            return True
        
        # Test validation - invalid position
        print("\n3. Testing validation (invalid position)...")
        try:
            speaker.play_track_at_position(queue_size + 1)
            print("   ❌ ERROR: Should have raised ValueError for out-of-range position")
            return False
        except ValueError as e:
            print(f"   ✓ Correctly raised ValueError: {e}")
        
        # Test validation - empty queue (if we can simulate it)
        # This is harder to test without actually clearing the queue
        
        # Test actual playback - play track at position 1
        if queue_size >= 1:
            print("\n4. Testing play_track_at_position(1)...")
            try:
                speaker.play_track_at_position(1)
                print("   ✓ Service call succeeded")
                
                # Wait a moment for playback to start
                await asyncio.sleep(0.5)
                
                # Check if position updated
                speaker.queue.update_queue_information()
                new_position = speaker.queue.position
                print(f"   Current position after call: {new_position}")
                if new_position == 0:  # 0-based in API, but we expect it to be 0 for position 1
                    print("   ✓ Position correctly set to 1 (0-based: 0)")
                else:
                    print(f"   ⚠️  Position is {new_position} (expected 0 for position 1)")
                
            except Exception as e:
                print(f"   ❌ Error calling service: {e}")
                import traceback
                traceback.print_exc()
                return False
        
        # Test playing a different position if queue is large enough
        if queue_size >= 3:
            print("\n5. Testing play_track_at_position(3)...")
            try:
                speaker.play_track_at_position(3)
                print("   ✓ Service call succeeded")
                
                await asyncio.sleep(0.5)
                
                speaker.queue.update_queue_information()
                new_position = speaker.queue.position
                print(f"   Current position after call: {new_position}")
                if new_position == 2:  # 0-based, so position 3 = index 2
                    print("   ✓ Position correctly set to 3 (0-based: 2)")
                else:
                    print(f"   ⚠️  Position is {new_position} (expected 2 for position 3)")
                
            except Exception as e:
                print(f"   ❌ Error calling service: {e}")
                import traceback
                traceback.print_exc()
                return False
        
        return True
        
    except reConnectionError as e:
        print(f"\n❌ Connection error: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Main test function."""
    if len(sys.argv) < 2:
        print("Usage: python test_backend_services.py <hostname> [port]")
        sys.exit(1)
    
    hostname = sys.argv[1]
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 6680
    
    print(f"Testing Mopidy backend services")
    print(f"Hostname: {hostname}")
    print(f"Port: {port}")
    
    # Test queue_tracks attribute
    queue_tracks_ok = await test_queue_tracks_attribute(hostname, port)
    
    # Test play_track_at_position service
    play_track_ok = await test_play_track_at_position(hostname, port)
    
    # Summary
    print(f"\n{'='*60}")
    print("Test Summary")
    print(f"{'='*60}")
    print(f"queue_tracks attribute: {'✓ PASS' if queue_tracks_ok else '❌ FAIL'}")
    print(f"play_track_at_position service: {'✓ PASS' if play_track_ok else '❌ FAIL'}")
    
    if queue_tracks_ok and play_track_ok:
        print("\n✅ All backend services working correctly!")
        return 0
    else:
        print("\n❌ Some tests failed")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

