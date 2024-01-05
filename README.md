# Guitar tuner and musician's assistant

The tuner is based on web audio api which can work in three modes:
- **'All notes'** - user has access to all notes, including flat and sharp ones, and can tune string to any of them.
- **'Standard auto'** - tuner automatically understands what string user is trying to tune. (supports only standard tuning)
- **'Standard strict'** - user can choose one string and tune it individually. (supports only standard tuning)

---
**Other features:**
- User can upload own songs with chords
- All songs are stored in the playlist
- User can play along scrolling of the song: application detects played chords and automatically scrolls the text
- All data is stored in the database

**Coming soon:**
- Task tracker
- Notifications about tasks

## For what stands each file?

- **server.js** - server
- **ChordCollector.js** - async collector for storing chords played by user in the mode 'play a song'
- **songParser.js** - used by song controller; parses a song provided by filepath before putting it into the database
- **SongProcessor.js, ChordProcessor.js** - real life processing of the played chords
- **controllers, services, repositories** - interaction with the database
- **tuner.js** - contains the logic of the tuner itself.
- **app.js** - connects tuner, song processing and UI.
- **user-interface** - UI.
