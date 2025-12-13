# Quick Start Guide: Enabling Mopidy UI Templates

The UI templates are **not automatically enabled**. You need to manually add them to your Home Assistant dashboard. Follow these steps:

## Step 1: Find Your Mopidy Entity ID

1. Go to **Settings** → **Devices & Services** → **Mopidy**
2. Click on your Mopidy integration entry
3. Look at the entity listed (e.g., `media_player.mopidy` or `media_player.living_room`)
4. **Note this entity ID** - you'll need it in the next steps

Alternatively, check **Developer Tools** → **States** and search for "mopidy" to find your entity.

## Step 2: Set Up Helper Entities

The templates need helper entities for user input. Choose one method:

### Option A: Via UI (Recommended)
1. Go to **Settings** → **Devices & Services** → **Helpers**
2. Click **+ CREATE HELPER**
3. Create these helpers (you can create them as needed):

**For Queue Management:**
- **Number**: Name: "Queue Source Position", Min: 1, Max: 100, Step: 1
- **Number**: Name: "Queue Destination Position", Min: 1, Max: 100, Step: 1
- **Number**: Name: "Queue Remove Position", Min: 1, Max: 100, Step: 1

**For Playback History:**
- **Number**: Name: "History Track Index", Min: 1, Max: 20, Step: 1

**For Playlist Management:**
- **Text**: Name: "Playlist Name"
- **Text**: Name: "Playlist URI"

### Option B: Via YAML
1. Copy the contents of `helpers.yaml` to your `configuration.yaml`
2. Restart Home Assistant

## Step 3: Add the Enhanced Media Player Card

1. Go to your **Dashboard** (or create a new one)
2. Click the **⋮** (three dots) menu → **Edit Dashboard**
3. Click **+ ADD CARD**
4. Scroll down and select **Manual** (or **YAML**)
5. Open `docs/ui-templates/media-player-enhanced.yaml` from this repository
6. Copy the entire contents
7. **IMPORTANT**: Replace all occurrences of `media_player.mopidy_entity` with your actual entity ID (from Step 1)
8. Paste into the card editor
9. Click **SAVE**

You should now see an enhanced media player card with queue information and buttons to manage queue and view history.

## Step 4: Add Queue Management View (Optional)

1. In your dashboard, click **+ ADD VIEW** (or edit an existing view)
2. Name it "Queue Management"
3. Add a new card → **Manual** (YAML mode)
4. Open `docs/ui-templates/queue-management.yaml`
5. Copy the contents
6. **Replace** `media_player.mopidy_entity` with your entity ID
7. **Replace** helper entity IDs if you used different names (e.g., `input_number.mopidy_queue_from_position`)
8. Paste and save

## Step 5: Add Playback History View (Optional)

1. Create another view named "Playback History"
2. Add a new card → **Manual** (YAML mode)
3. Open `docs/ui-templates/playback-history.yaml`
4. Copy the contents
5. **Replace** `media_player.mopidy_entity` with your entity ID
6. **Replace** helper entity IDs if needed
7. Paste and save

## Step 6: Update Navigation Paths (If Using Separate Views)

If you created separate views for queue and history:
1. Edit the enhanced media player card
2. Update the `navigation_path` values:
   - For "Manage Queue" button: `/lovelace/queue-management` (or your view path)
   - For "View History" button: `/lovelace/playback-history` (or your view path)

To find your view path:
- Edit the dashboard
- Click on the view name
- The URL will show the path (e.g., `/lovelace/0` or `/lovelace/queue-management`)

## Troubleshooting

**Card shows "entity unavailable":**
- Check that your entity ID is correct
- Verify the Mopidy integration is working (check in Settings → Devices & Services)

**Buttons don't work:**
- Verify helper entities are created and match the IDs in the template
- Check Home Assistant logs for service call errors

**Template syntax errors:**
- Use a YAML validator to check syntax
- Ensure all quotes and indentation are correct
- Make sure you replaced all placeholder entity IDs

**Can't find entity:**
- Go to Developer Tools → States
- Search for "mopidy" or your device name
- The entity ID format is usually `media_player.{device_name}` (lowercase, underscores)

**card_mod styling not working:**
- `card_mod` is a custom Lovelace card that provides advanced styling
- If you don't have it installed, the templates will still work but some visual styling (like opacity changes) won't apply
- To install: HACS → Frontend → Search for "card-mod" → Install
- Alternatively, you can remove the `card_mod:` sections from the templates - they're optional styling only

## Next Steps

- See `README.md` for more detailed documentation
- Customize templates by editing colors, fonts, and layout
- Add playlist management view using `playlist-management.yaml`

